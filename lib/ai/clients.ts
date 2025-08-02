import { GoogleGenerativeAI } from '@google/generative-ai';

export interface AIClient {
  askQuestion(question: string, context?: Record<string, unknown>): Promise<string>;
}

export class AnthropicClient implements AIClient {
  private apiKey: string;
  private baseUrl = 'https://api.anthropic.com/v1/messages';

  constructor() {
    const apiKey = process.env['ANTHROPIC_API_KEY'];
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY is not configured');
    }
    this.apiKey = apiKey;
  }

  async askQuestion(question: string, context?: Record<string, unknown>): Promise<string> {
    const prompt = context
      ? `${question}\n\nContext:\n${JSON.stringify(context, null, 2)}`
      : question;

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Anthropic API error: ${response.status} - ${errorText}`);
    }

    const data = (await response.json()) as { content: Array<{ text: string }> };
    return data.content[0]?.text ?? 'No response received';
  }
}

export class GeminiClient implements AIClient {
  private client: GoogleGenerativeAI;
  private modelName: string;

  constructor() {
    const apiKey: string = process.env['GOOGLE_GEMINI_API_KEY'] as string;
    if (!apiKey) {
      throw new Error('GOOGLE_GEMINI_API_KEY is not configured');
    }
    this.client = new GoogleGenerativeAI(apiKey);
    this.modelName = process.env['GOOGLE_GEMINI_MODEL'] ?? 'gemini-1.5-flash-latest';
  }

  async askQuestion(question: string, context?: Record<string, unknown>): Promise<string> {
    const model = this.client.getGenerativeModel({ model: this.modelName });
    const prompt: string = context
      ? `${question}

Context:
${JSON.stringify(context, null, 2)}`
      : question;
    const result: Awaited<ReturnType<typeof model.generateContent>> =
      await model.generateContent(prompt);
    const response: Awaited<typeof result.response> = result.response;
    const text: string = response.text();
    if (!text) {
      throw new Error('No response text received from Gemini');
    }
    return text;
  }
}

export interface VoiceOptions {
  voice_id?: string;
  model_id?: string;
  voice_settings?: {
    stability: number;
    similarity_boost: number;
    style?: number;
    use_speaker_boost?: boolean;
  };
}

export class ElevenLabsClient {
  private apiKey: string;
  private baseUrl = 'https://api.elevenlabs.io/v1';

  constructor() {
    const apiKey = process.env['ELEVENLABS_API_KEY'];
    if (!apiKey) {
      throw new Error('ELEVENLABS_API_KEY is not configured');
    }
    this.apiKey = apiKey;
  }

  async synthesizeSpeech(text: string, options: VoiceOptions = {}): Promise<ArrayBuffer> {
    const voiceId = options.voice_id ?? 'pNInz6obpgDQGcFmaJgB'; // Default voice
    const modelId = options.model_id ?? 'eleven_monolingual_v1';
    const voiceSettings = options.voice_settings ?? {
      stability: 0.5,
      similarity_boost: 0.5,
      style: 0,
      use_speaker_boost: true,
    };

    const response = await fetch(`${this.baseUrl}/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        Accept: 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': this.apiKey,
      },
      body: JSON.stringify({
        text,
        model_id: modelId,
        voice_settings: voiceSettings,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
    }

    return response.arrayBuffer();
  }

  async getVoices(): Promise<unknown> {
    const response = await fetch(`${this.baseUrl}/voices`, {
      headers: {
        'xi-api-key': this.apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch voices: ${response.statusText}`);
    }

    return response.json();
  }
}

export class ForecastClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env['FORECAST_API_URL'] ?? 'http://127.0.0.1:8000';
  }

  async getProphetForecast(data: { ds: string[]; y: number[] }): Promise<Record<string, unknown>> {
    const response = await fetch(`${this.baseUrl}/prophet-forecast`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json() as Promise<Record<string, unknown>>;
  }

  async getNeuralProphetForecast(data: {
    ds: string[];
    y: number[];
    seasonality_mode?: string;
    learning_rate?: number;
  }): Promise<Record<string, unknown>> {
    const response = await fetch(`${this.baseUrl}/neural-prophet-forecast`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json() as Promise<Record<string, unknown>>;
  }
}
