import { NextResponse } from 'next/server';
import { z } from 'zod';

import { ElevenLabsClient } from '@/lib/ai/clients';
import type { VoiceOptions } from '@/lib/ai/clients';

import type { NextRequest } from 'next/server';

// Request/Response schemas with Zod validation
const voiceRequestSchema = z.object({
  text: z.string().min(1, 'Text cannot be empty').max(5000, 'Text too long'),
  voice_id: z.string().optional(),
  model_id: z.string().optional(),
  voice_settings: z
    .object({
      stability: z.number().min(0).max(1).default(0.5),
      similarity_boost: z.number().min(0).max(1).default(0.5),
      style: z.number().min(0).max(1).optional(),
      use_speaker_boost: z.boolean().default(true),
    })
    .optional(),
  output_format: z.enum(['mp3', 'wav', 'ogg']).default('mp3'),
});

const voiceResponseSchema = z.object({
  audio_url: z.string().url(),
  content_type: z.string(),
  size_bytes: z.number(),
  duration_estimate: z.number().optional(),
  voice_id: z.string(),
  model_id: z.string(),
});

// type VoiceRequest = z.infer<typeof voiceRequestSchema>;
type VoiceResponse = z.infer<typeof voiceResponseSchema>;

// Available voices (commonly used ones)
const AVAILABLE_VOICES = {
  rachel: 'pNInz6obpgDQGcFmaJgB', // Professional female voice
  drew: 'cjVigY5qzO86Huf0OWal', // Calm male voice
  clyde: 'TxGEqnHWrfWFTfGW9XjX', // Mature male voice
  domi: 'AZnzlk1XvdvUeBnXmlld', // Strong female voice
  dave: 'CYw3kZ02Hs0563khs1Fj', // Conversational male voice
  fin: 'D38z5RcWu1voky8WS1ja', // Older gentleman voice
  sarah: 'EXAVITQu4vr4xnSDxMaL', // Soft female voice
  antoni: 'ErXwobaYiN019PkySvjV', // Well-rounded male voice
} as const;

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Parse and validate request body
    const body: unknown = await request.json();
    const voiceRequest = voiceRequestSchema.parse(body);

    // Initialize ElevenLabs client
    const elevenLabsClient = new ElevenLabsClient();

    // Map voice name to voice ID if needed
    let voiceId = voiceRequest.voice_id;
    if (voiceId && voiceId in AVAILABLE_VOICES) {
      voiceId = AVAILABLE_VOICES[voiceId as keyof typeof AVAILABLE_VOICES];
    }

    // Prepare voice options
    const voiceOptions: VoiceOptions = {};

    if (voiceId) {
      voiceOptions.voice_id = voiceId;
    }

    if (voiceRequest.model_id) {
      voiceOptions.model_id = voiceRequest.model_id;
    }

    if (voiceRequest.voice_settings) {
      voiceOptions.voice_settings = {
        stability: voiceRequest.voice_settings.stability,
        similarity_boost: voiceRequest.voice_settings.similarity_boost,
      };

      if (voiceRequest.voice_settings.style !== undefined) {
        voiceOptions.voice_settings.style = voiceRequest.voice_settings.style;
      }

      if (voiceRequest.voice_settings.use_speaker_boost !== undefined) {
        voiceOptions.voice_settings.use_speaker_boost =
          voiceRequest.voice_settings.use_speaker_boost;
      }
    }

    // Synthesize speech
    const audioBuffer = await elevenLabsClient.synthesizeSpeech(voiceRequest.text, voiceOptions);

    // Convert ArrayBuffer to Uint8Array for Next.js response
    const audioBytes = new Uint8Array(audioBuffer);

    // Determine content type based on output format
    const contentType = getContentType(voiceRequest.output_format);

    // Create response headers
    const headers = new Headers({
      'Content-Type': contentType,
      'Content-Length': audioBytes.length.toString(),
      'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      'Content-Disposition': `inline; filename="speech.${voiceRequest.output_format}"`,
    });

    // For streaming response, return the audio directly
    if (request.headers.get('accept')?.includes('audio/')) {
      return new NextResponse(audioBytes, {
        status: 200,
        headers,
      });
    }

    // For JSON response, encode audio as base64
    const base64Audio = Buffer.from(audioBytes).toString('base64');
    const dataUrl = `data:${contentType};base64,${base64Audio}`;

    // Estimate duration (rough calculation: ~150 words per minute)
    const wordCount = voiceRequest.text.split(/\s+/).length;
    const durationEstimate = Math.ceil((wordCount / 150) * 60); // seconds

    // Prepare response
    const response: VoiceResponse = {
      audio_url: dataUrl,
      content_type: contentType,
      size_bytes: audioBytes.length,
      duration_estimate: durationEstimate,
      voice_id: voiceOptions.voice_id ?? 'pNInz6obpgDQGcFmaJgB',
      model_id: voiceOptions.model_id ?? 'eleven_monolingual_v1',
    };

    // Validate response
    const validatedResponse = voiceResponseSchema.parse(response);

    return NextResponse.json(validatedResponse);
  } catch (error) {
    console.error('Voice API error:', error);

    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.errors.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    // Handle ElevenLabs API errors
    if (error instanceof Error && error.message.includes('ElevenLabs API error')) {
      return NextResponse.json(
        {
          error: 'Voice synthesis failed',
          message: error.message,
        },
        { status: 502 } // Bad Gateway
      );
    }

    // Handle other errors
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return NextResponse.json(
      {
        error: 'Voice synthesis request failed',
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve available voices
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const includeElevenLabsVoices = searchParams.get('include_remote') === 'true';

    // Always return our curated list
    const voices = Object.entries(AVAILABLE_VOICES).map(([name, id]) => ({
      id,
      name,
      category: 'professional',
      language: 'en',
      accent: 'american',
      description: getVoiceDescription(name),
    }));

    const response: {
      voices: Array<{
        id: string;
        name: string;
        category: string;
        language: string;
        accent: string;
        description: string;
      }>;
      total: number;
      elevenlabs_voices?: unknown;
      elevenlabs_error?: string;
    } = {
      voices,
      total: voices.length,
    };

    // Optionally include all ElevenLabs voices
    if (includeElevenLabsVoices) {
      try {
        const elevenLabsClient = new ElevenLabsClient();
        const remoteVoices = await elevenLabsClient.getVoices();
        response.elevenlabs_voices = remoteVoices;
      } catch (error) {
        console.warn('Failed to fetch ElevenLabs voices:', error);
        response.elevenlabs_error = 'Failed to fetch remote voices';
      }
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Get voices error:', error);

    return NextResponse.json(
      {
        error: 'Failed to retrieve voices',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Helper functions
function getContentType(format: string): string {
  switch (format) {
    case 'mp3':
      return 'audio/mpeg';
    case 'wav':
      return 'audio/wav';
    case 'ogg':
      return 'audio/ogg';
    default:
      return 'audio/mpeg';
  }
}

function getVoiceDescription(voiceName: string): string {
  const descriptions: Record<string, string> = {
    rachel: 'Professional, clear female voice ideal for business presentations',
    drew: 'Calm, reassuring male voice perfect for explanatory content',
    clyde: 'Mature, authoritative male voice suitable for executive summaries',
    domi: 'Strong, confident female voice great for important announcements',
    dave: 'Conversational male voice perfect for casual explanations',
    fin: 'Distinguished older gentleman voice ideal for formal content',
    sarah: 'Soft, warm female voice excellent for friendly communications',
    antoni: 'Well-rounded male voice suitable for general narration',
  };

  return descriptions[voiceName] ?? 'Professional voice suitable for business content';
}
