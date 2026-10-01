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

export const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced'] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

export const TIME_BUDGETS = ['weekend', 'weeks', 'months'] as const;
export const GOALS = ['portfolio', 'learning', 'hackathon'] as const;
export const REFINE_DIRECTIONS = ['similar', 'easier', 'harder'] as const;

export const MAX_INTERESTS = 5;
export const MAX_EXCLUDED_TITLES = 30;

export interface Preferences {
  level?: Difficulty;
  timeBudget?: (typeof TIME_BUDGETS)[number];
  goal?: (typeof GOALS)[number];
  interests: string[];
}

export interface RefineRequest {
  direction: (typeof REFINE_DIRECTIONS)[number];
  project: { title: string; description: string; difficulty: Difficulty };
}

export interface AiRequest {
  dataset: TechDataset;
  preferences: Preferences;
  // Titles the user has already seen, so the model doesn't repeat them.
  exclude: string[];
  count: number;
  refine?: RefineRequest;
}

// The frontend sends each category as a comma-separated string.
const techField = z.string().max(1000).default('');
const shortText = (max: number) => z.string().trim().min(1).max(max);

const aiRequestSchema = z.object({
  dataset: z.object({
    language: techField,
    framework: techField,
    database: techField,
    others: techField,
  }),
  preferences: z
    .object({
      level: z.enum(DIFFICULTIES).optional(),
      timeBudget: z.enum(TIME_BUDGETS).optional(),
      goal: z.enum(GOALS).optional(),
      interests: z.array(shortText(30)).max(MAX_INTERESTS).default([]),
    })
    .default({ interests: [] }),
  exclude: z.array(shortText(150)).max(MAX_EXCLUDED_TITLES).default([]),
  count: z.number().int().min(1).max(3).default(3),
  refine: z
    .object({
      direction: z.enum(REFINE_DIRECTIONS),
      project: z.object({
        title: shortText(150),
        description: shortText(1000),
        difficulty: z.enum(DIFFICULTIES),
      }),
    })
    .optional(),
});

const stripControlChars = (value: string) => value.replace(/[\u0000-\u001f\u007f]/g, '');

// Splits a comma-separated field into trimmed, non-empty items with control characters removed.
function splitTechList(value: string): string[] {
  return value
    .split(',')
    .map((item) => stripControlChars(item).trim())
    .filter(Boolean);
}

export type ParseResult<T> = { ok: true; value: T } | { ok: false; error: string };

export function parseAiRequest(body: unknown): ParseResult<AiRequest> {
  const parsed = aiRequestSchema.safeParse(body);
  if (!parsed.success) {
    const field = parsed.error.issues[0]?.path.join('.') || 'body';
    return { ok: false, error: `Invalid request (${field}). Expected { dataset: { language, framework, database, others } } with string values.` };
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

  const { preferences, exclude, count, refine } = parsed.data;
  return {
    ok: true,
    value: {
      dataset,
      preferences: { ...preferences, interests: preferences.interests.map(stripControlChars) },
      exclude: exclude.map(stripControlChars),
      // A refinement always produces a single project.
      count: refine ? 1 : count,
      refine: refine && {
        direction: refine.direction,
        project: {
          ...refine.project,
          title: stripControlChars(refine.project.title),
          description: stripControlChars(refine.project.description),
        },
      },
    },
  };
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
