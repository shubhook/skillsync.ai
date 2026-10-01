import { CATALOG, CATEGORY_ORDER } from '../data/catalog';
import type { Category, Tech } from '../types';

// Must match the backend limits in backend/src/schemas.ts.
export const MAX_TECHS = 20;
export const MAX_TECH_LENGTH = 50;

const key = (name: string) => name.trim().toLowerCase();

// Commas would split the item when the payload is joined, so they become spaces.
export function normalizeTechName(name: string): string {
  return name.replace(/,/g, ' ').replace(/\s+/g, ' ').trim();
}

export function findCatalogTech(name: string): Tech | undefined {
  const k = key(name);
  return CATALOG.find((tech) => key(tech.name) === k);
}

// Catalog entry if the name matches one (any case), otherwise a custom "others" entry.
export function resolveTech(rawName: string): Tech | null {
  const name = normalizeTechName(rawName);
  if (!name) return null;
  return findCatalogTech(name) ?? { name, category: 'others' };
}

export type AddTechResult = { ok: true; techs: Tech[] } | { ok: false; error: string };

export function addTech(techs: Tech[], rawName: string): AddTechResult {
  const tech = resolveTech(rawName);
  if (!tech) return { ok: false, error: 'Type a technology name first.' };
  if (tech.name.length > MAX_TECH_LENGTH) {
    return { ok: false, error: `Names can be at most ${MAX_TECH_LENGTH} characters.` };
  }
  if (techs.some((t) => key(t.name) === key(tech.name))) {
    return { ok: false, error: `${tech.name} is already in your stack.` };
  }
  if (techs.length >= MAX_TECHS) {
    return { ok: false, error: `You can pick up to ${MAX_TECHS} technologies.` };
  }
  return { ok: true, techs: [...techs, tech] };
}

export function techsFromNames(names: string[]): Tech[] {
  return names.reduce<Tech[]>((techs, name) => {
    const result = addTech(techs, name);
    return result.ok ? result.techs : techs;
  }, []);
}

export interface CatalogGroup {
  category: Category;
  techs: Tech[];
}

// Catalog entries not yet selected that match the query, grouped by category.
// Names that start with the query sort first.
export function searchCatalog(query: string, selected: Tech[]): CatalogGroup[] {
  const q = key(query);
  const taken = new Set(selected.map((t) => key(t.name)));
  const matches = CATALOG.filter((tech) => !taken.has(key(tech.name)) && key(tech.name).includes(q));
  const rank = (tech: Tech) => (q && key(tech.name).startsWith(q) ? 0 : 1);

  return CATEGORY_ORDER.map((category) => ({
    category,
    techs: matches.filter((t) => t.category === category).sort((a, b) => rank(a) - rank(b)),
  })).filter((g) => g.techs.length > 0);
}

export function toDataset(techs: Tech[]): Record<Category, string> {
  const names = (category: Category) => techs.filter((t) => t.category === category).map((t) => t.name).join(',');
  return { language: names('language'), framework: names('framework'), database: names('database'), others: names('others') };
}
