import { GoogleGenAI } from '@google/genai';

let geminiClient: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI {
  if (!geminiClient) {
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GOOGLE_GEMINI_API_KEY is not configured');
    }

    geminiClient = new GoogleGenAI({ apiKey });
  }

  return geminiClient;
}

export async function generateAIResponse(prompt: string): Promise<string> {
  try {
    const ai = getGeminiClient();
    const model = process.env.GOOGLE_GEMINI_MODEL || 'gemini-2.0-flash-exp-01-18';

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    const text = response.text;
    if (!text) {
      throw new Error('No response text received from Gemini');
    }

    return text;
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error('Failed to generate AI response');
  }
}

export async function analyzeEmployeeCost(
  query: string,
  context?: Record<string, unknown>
): Promise<string> {
  const prompt = `
    You are an AI financial analyst specializing in employee cost management and workforce planning.
    
    User Question: ${query}
    
    ${context ? `Context: ${JSON.stringify(context, null, 2)}` : ''}
    
    Provide a clear, concise, and actionable response. Focus on:
    - Direct answer to the question
    - Relevant financial insights
    - Practical recommendations
    - Potential risks or considerations
    
    Keep the response professional but conversational, suitable for executives.
  `;

  return generateAIResponse(prompt);
}
