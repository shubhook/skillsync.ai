import type { Preferences, Project, RefineDirection, Tech } from '../types';
import { toDataset } from './stack';

// Falls back to the local backend only in dev, so a prod build without VITE_API_URL
// reports a clear error instead of calling localhost.
const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3000' : '');

// The backend gives Gemini 45s, so wait a little longer than that.
const REQUEST_TIMEOUT_MS = 60_000;

export interface GenerateRequest {
  techs: Tech[];
  preferences: Preferences;
  // Titles already shown, so the model doesn't repeat them.
  exclude?: string[];
  count?: number;
  refine?: {
    direction: RefineDirection;
    project: Pick<Project, 'title' | 'description' | 'difficulty'>;
  };
}

// Error whose message is safe to show to the user.
export class GenerateError extends Error {}

interface ApiBody {
  error?: unknown;
  response?: { projects?: unknown };
}

export async function generateProjects({ techs, preferences, exclude = [], count = 3, refine }: GenerateRequest): Promise<Project[]> {
  if (!API_URL) {
    throw new GenerateError('The app is missing its API URL. Set VITE_API_URL and rebuild.');
  }

  let res: Response;
  try {
    res = await fetch(`${API_URL}/ai`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dataset: toDataset(techs), preferences, exclude, count, refine }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'TimeoutError') {
      throw new GenerateError('The request timed out. Please try again.');
    }
    throw new GenerateError('Could not reach the server. Check your connection and try again.');
  }

  const body = (await res.json().catch(() => null)) as ApiBody | null;

  if (!res.ok) {
    const serverMessage = typeof body?.error === 'string' ? body.error : null;
    if (res.status === 429) {
      throw new GenerateError(serverMessage ?? 'Too many requests. Please wait a bit and try again.');
    }
    throw new GenerateError(serverMessage ?? `Something went wrong (HTTP ${res.status}). Please try again.`);
  }

  const projects = body?.response?.projects;
  if (!Array.isArray(projects)) {
    throw new GenerateError('The server returned an unexpected response. Please try again.');
  }
  return projects as Project[];
}
