import { z } from 'zod';

// ---------- Request ----------

export const MAX_ITEM_LENGTH = 50;
export const MAX_TOTAL_ITEMS = 20;

export interface TechDataset {
  language: string[];
  framework: string[];
  database: string[];
  others: string[];
}

// The frontend sends each category as a comma-separated string.
const techField = z.string().max(1000).default('');

const aiRequestSchema = z.object({
  dataset: z.object({
    language: techField,
    framework: techField,
    database: techField,
    others: techField,
  }),
});

// Splits a comma-separated field into trimmed, non-empty items with control characters removed.
function splitTechList(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.replace(/[\u0000-\u001f\u007f]/g, '').trim())
    .filter(Boolean);
}

export type ParseResult<T> = { ok: true; value: T } | { ok: false; error: string };

export function parseAiRequest(body: unknown): ParseResult<TechDataset> {
  const parsed = aiRequestSchema.safeParse(body);
  if (!parsed.success) {
    return { ok: false, error: 'Request body must be { dataset: { language, framework, database, others } } with string values.' };
  }

  const { language, framework, database, others } = parsed.data.dataset;
  const dataset: TechDataset = {
    language: splitTechList(language),
    framework: splitTechList(framework),
    database: splitTechList(database),
    others: splitTechList(others),
  };
  const allItems = Object.values(dataset).flat();

  if (allItems.length === 0) {
    return { ok: false, error: 'Please provide at least one technology.' };
  }
  if (allItems.length > MAX_TOTAL_ITEMS) {
    return { ok: false, error: `Please select at most ${MAX_TOTAL_ITEMS} technologies.` };
  }
  const tooLong = allItems.find((item) => item.length > MAX_ITEM_LENGTH);
  if (tooLong) {
    return { ok: false, error: `Technology names must be ${MAX_ITEM_LENGTH} characters or fewer.` };
  }

  return { ok: true, value: dataset };
}

// ---------- Model response ----------

export const NOT_AVAILABLE = 'Not available';

// Only http(s) links reach the client. Anything else becomes the "Not available" sentinel.
export function toSafeUrl(value: string): string {
  try {
    const url = new URL(value.trim());
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : NOT_AVAILABLE;
  } catch {
    return NOT_AVAILABLE;
  }
}

const stringList = z.array(z.string().trim().min(1)).catch([]);

const resourceSchema = z.object({
  name: z.string().trim().min(1),
  type: z.enum(['Documentation', 'Video', 'Tutorial']).catch('Documentation'),
  url: z.string().transform(toSafeUrl),
});

const projectSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().trim().min(1),
  difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced']).catch('Intermediate'),
  estimatedTime: z.string().trim().min(1).catch('Not specified'),
  techStack: stringList,
  // Drop malformed resources instead of failing the whole project.
  resources: z
    .array(z.unknown())
    .catch([])
    .transform((items) => items.flatMap((item) => {
      const result = resourceSchema.safeParse(item);
      return result.success ? [result.data] : [];
    })),
  learningOutcomes: stringList,
});

export type Project = z.infer<typeof projectSchema>;
export type Resource = z.infer<typeof resourceSchema>;

export interface ProjectsResponse {
  projects: Project[];
}

export class ModelResponseError extends Error {}

// Parses the model's JSON text. Invalid projects are dropped; it throws only if none survive.
export function parseProjectsResponse(text: string): ProjectsResponse {
  const cleanText = text.replace(/```json|```/g, '').trim();

  let json: unknown;
  try {
    json = JSON.parse(cleanText);
  } catch (error) {
    throw new ModelResponseError('Model returned invalid JSON', { cause: error });
  }

  const rawProjects = z.object({ projects: z.array(z.unknown()) }).safeParse(json);
  if (!rawProjects.success) {
    throw new ModelResponseError('Model response is missing a projects array');
  }

  const projects = rawProjects.data.projects.flatMap((item) => {
    const result = projectSchema.safeParse(item);
    return result.success ? [result.data] : [];
  });
  if (projects.length === 0) {
    throw new ModelResponseError('Model response contained no valid projects');
  }

  return { projects };
}
