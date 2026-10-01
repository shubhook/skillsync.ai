import { ApiError, GoogleGenAI, Schema, Type } from '@google/genai';
import { config } from './config';
import { buildPrompt } from './prompt';
import { AiRequest, ModelResponseError, parseProjectsResponse, ProjectsResponse } from './schemas';

const GEMINI_TIMEOUT_MS = 45_000;

// Error with the HTTP status and user-facing message the route should return.
export class GenerationError extends Error {
  constructor(public readonly status: number, message: string, options?: { cause?: unknown }) {
    super(message, options);
  }
}

let client: GoogleGenAI | null = null;

// Created on first use so a missing key fails the request with a clear log
// instead of crashing the serverless function at import time.
function getClient(): GoogleGenAI {
  if (!config.geminiApiKey) {
    throw new GenerationError(500, 'The server is not configured correctly. Please try again later.', {
      cause: new Error('GEMINI_API_KEY is not set'),
    });
  }
  client ??= new GoogleGenAI({ apiKey: config.geminiApiKey });
  return client;
}

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    projects: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: 'Specific, catchy project name' },
          description: {
            type: Type.STRING,
            description: "2-3 sentences: what the project does, who it's for, and what makes it unique",
          },
          difficulty: { type: Type.STRING, enum: ['Beginner', 'Intermediate', 'Advanced'] },
          estimatedTime: { type: Type.STRING, description: 'For example "3 weeks" or "1-2 months"' },
          techStack: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Only technologies from the user's selection that this project uses",
          },
          resources: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                type: { type: Type.STRING, enum: ['Documentation', 'Video', 'Tutorial'] },
                url: { type: Type.STRING, description: `A real URL, or "Not available"` },
              },
              required: ['name', 'type', 'url'],
              propertyOrdering: ['name', 'type', 'url'],
            },
          },
          learningOutcomes: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ['title', 'description', 'difficulty', 'estimatedTime', 'techStack', 'resources', 'learningOutcomes'],
        propertyOrdering: ['title', 'description', 'difficulty', 'estimatedTime', 'techStack', 'resources', 'learningOutcomes'],
      },
    },
  },
  required: ['projects'],
};

export async function generateProjects(request: AiRequest): Promise<ProjectsResponse> {
  const ai = getClient();

  let text: string | undefined;
  try {
    const response = await ai.models.generateContent({
      model: config.geminiModel,
      contents: buildPrompt(request),
      config: {
        responseMimeType: 'application/json',
        responseSchema,
        abortSignal: AbortSignal.timeout(GEMINI_TIMEOUT_MS),
      },
    });
    text = response.text;
  } catch (error) {
    if (error instanceof Error && (error.name === 'TimeoutError' || error.name === 'AbortError')) {
      throw new GenerationError(504, 'The AI took too long to respond. Please try again.', { cause: error });
    }
    if (error instanceof ApiError && (error.status === 429 || error.status === 503)) {
      throw new GenerationError(503, 'The AI service is busy right now. Please try again in a minute.', { cause: error });
    }
    throw new GenerationError(502, 'Failed to generate project suggestions. Please try again.', { cause: error });
  }

  if (!text) {
    throw new GenerationError(502, 'The AI returned an empty response. Please try again.');
  }

  try {
    return parseProjectsResponse(text);
  } catch (error) {
    if (error instanceof ModelResponseError) {
      console.error('Unparseable model response (first 1000 chars):\n', text.slice(0, 1000));
      throw new GenerationError(502, 'The AI returned an unexpected response. Please try again.', { cause: error });
    }
    throw error;
  }
}
