import { describe, expect, it } from 'vitest';
import {
  MAX_TOTAL_ITEMS,
  ModelResponseError,
  NOT_AVAILABLE,
  parseAiRequest,
  parseProjectsResponse,
  toSafeUrl,
} from './schemas';

const validProject = {
  title: 'Trail Buddy',
  description: 'Plans hikes from weather and trail data.',
  difficulty: 'Intermediate',
  estimatedTime: '3 weeks',
  techStack: ['React.js'],
  resources: [{ name: 'React docs', type: 'Documentation', url: 'https://react.dev' }],
  learningOutcomes: ['Data fetching'],
};

describe('parseAiRequest', () => {
  it('splits comma-separated fields into trimmed items', () => {
    const result = parseAiRequest({ dataset: { language: 'JavaScript, Go ,', framework: 'React.js' } });
    expect(result).toEqual({
      ok: true,
      value: { language: ['JavaScript', 'Go'], framework: ['React.js'], database: [], others: [] },
    });
  });

  it('rejects a missing dataset', () => {
    expect(parseAiRequest({}).ok).toBe(false);
    expect(parseAiRequest(undefined).ok).toBe(false);
  });

  it('rejects non-string fields', () => {
    expect(parseAiRequest({ dataset: { language: ['JavaScript'] } }).ok).toBe(false);
  });

  it('rejects whitespace-only input', () => {
    expect(parseAiRequest({ dataset: { language: '  ,  ', others: ' ' } })).toEqual({
      ok: false,
      error: 'Please provide at least one technology.',
    });
  });

  it('rejects too many technologies', () => {
    const language = Array.from({ length: MAX_TOTAL_ITEMS + 1 }, (_, i) => `Lang${i}`).join(',');
    expect(parseAiRequest({ dataset: { language } }).ok).toBe(false);
  });

  it('rejects overly long technology names', () => {
    expect(parseAiRequest({ dataset: { others: 'x'.repeat(51) } }).ok).toBe(false);
  });

  it('strips control characters', () => {
    const result = parseAiRequest({ dataset: { language: 'Ja\nva\u0000Script' } });
    expect(result.ok && result.value.language).toEqual(['JavaScript']);
  });
});

describe('toSafeUrl', () => {
  it('keeps http and https URLs', () => {
    expect(toSafeUrl('https://react.dev/learn')).toBe('https://react.dev/learn');
    expect(toSafeUrl('http://example.com')).toBe('http://example.com/');
  });

  it('replaces other protocols and junk with the sentinel', () => {
    expect(toSafeUrl('javascript:alert(1)')).toBe(NOT_AVAILABLE);
    expect(toSafeUrl('Not available')).toBe(NOT_AVAILABLE);
    expect(toSafeUrl('')).toBe(NOT_AVAILABLE);
  });
});

describe('parseProjectsResponse', () => {
  it('parses a valid response', () => {
    const result = parseProjectsResponse(JSON.stringify({ projects: [validProject] }));
    expect(result.projects).toEqual([{ ...validProject, resources: [{ ...validProject.resources[0], url: 'https://react.dev/' }] }]);
  });

  it('strips markdown code fences', () => {
    const text = '```json\n' + JSON.stringify({ projects: [validProject] }) + '\n```';
    expect(parseProjectsResponse(text).projects).toHaveLength(1);
  });

  it('fills in missing arrays instead of failing', () => {
    const { techStack: _t, resources: _r, learningOutcomes: _l, ...partial } = validProject;
    const [project] = parseProjectsResponse(JSON.stringify({ projects: [partial] })).projects;
    expect(project.techStack).toEqual([]);
    expect(project.resources).toEqual([]);
    expect(project.learningOutcomes).toEqual([]);
  });

  it('drops invalid projects and resources but keeps valid ones', () => {
    const text = JSON.stringify({
      projects: [
        { ...validProject, resources: [{ name: 'Bad' }, ...validProject.resources] },
        { description: 'No title' },
      ],
    });
    const { projects } = parseProjectsResponse(text);
    expect(projects).toHaveLength(1);
    expect(projects[0].resources).toHaveLength(1);
  });

  it('sanitizes resource URLs', () => {
    const project = { ...validProject, resources: [{ name: 'Evil', type: 'Video', url: 'javascript:alert(1)' }] };
    const [parsed] = parseProjectsResponse(JSON.stringify({ projects: [project] })).projects;
    expect(parsed.resources[0].url).toBe(NOT_AVAILABLE);
  });

  it('throws ModelResponseError on invalid JSON or no valid projects', () => {
    expect(() => parseProjectsResponse('not json')).toThrow(ModelResponseError);
    expect(() => parseProjectsResponse('{"foo": 1}')).toThrow(ModelResponseError);
    expect(() => parseProjectsResponse('{"projects": [{}]}')).toThrow(ModelResponseError);
  });
});
