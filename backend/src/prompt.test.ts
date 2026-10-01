import { describe, expect, it } from 'vitest';
import { buildPrompt } from './prompt';
import type { AiRequest } from './schemas';

const base: AiRequest = {
  dataset: { language: ['Go'], framework: [], database: ['Redis'], others: [] },
  preferences: { interests: [] },
  exclude: [],
  count: 3,
};

describe('buildPrompt', () => {
  it('lists only the categories the user filled in', () => {
    const prompt = buildPrompt(base);
    expect(prompt).toContain('Programming Languages: Go');
    expect(prompt).toContain('Databases: Redis');
    expect(prompt).not.toContain('Frameworks/Libraries');
    expect(prompt).not.toContain("USER'S PREFERENCES");
    expect(prompt).toContain('Generate EXACTLY 3 projects');
    expect(prompt).toContain('varying difficulty');
  });

  it('includes preferences and drops the varying-difficulty rule when a level is set', () => {
    const prompt = buildPrompt({
      ...base,
      preferences: { level: 'Beginner', timeBudget: 'weekend', goal: 'learning', interests: ['Health', 'Games'] },
    });
    expect(prompt).toContain('every project must be Beginner');
    expect(prompt).toContain('a weekend');
    expect(prompt).toContain('learn the selected technologies');
    expect(prompt).toContain('Health, Games');
    expect(prompt).not.toContain('varying difficulty');
  });

  it('lists excluded titles', () => {
    const prompt = buildPrompt({ ...base, exclude: ['Trail Buddy', 'PR Pulse'] });
    expect(prompt).toContain('- Trail Buddy\n- PR Pulse');
  });

  it('builds a single-project refinement prompt', () => {
    const prompt = buildPrompt({
      ...base,
      count: 1,
      refine: { direction: 'easier', project: { title: 'PR Pulse', description: 'Review dashboard', difficulty: 'Advanced' } },
    });
    expect(prompt).toContain('Title: PR Pulse');
    expect(prompt).toContain('an easier variation');
    expect(prompt).toContain('Generate EXACTLY 1 project\n');
  });
});
