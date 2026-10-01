import { describe, expect, it } from 'vitest';
import { addTech, MAX_TECHS, normalizeTechName, resolveTech, searchCatalog, techsFromNames, toDataset } from './stack';

describe('resolveTech', () => {
  it('matches catalog entries case-insensitively and keeps their category', () => {
    expect(resolveTech('react.js')).toEqual({ name: 'React.js', category: 'framework' });
    expect(resolveTech('  postgresql ')).toEqual({ name: 'PostgreSQL', category: 'database' });
  });

  it('treats unknown names as custom tools', () => {
    expect(resolveTech('Elixir')).toEqual({ name: 'Elixir', category: 'others' });
  });

  it('returns null for blank input', () => {
    expect(resolveTech('   ')).toBeNull();
  });
});

describe('normalizeTechName', () => {
  it('removes commas so the payload stays splittable', () => {
    expect(normalizeTechName(' Foo,  Bar ')).toBe('Foo Bar');
  });
});

describe('addTech', () => {
  it('adds a tech', () => {
    const result = addTech([], 'Go');
    expect(result.ok && result.techs).toEqual([{ name: 'Go', category: 'language' }]);
  });

  it('rejects duplicates in any case', () => {
    const result = addTech(techsFromNames(['React.js']), 'REACT.JS');
    expect(result).toEqual({ ok: false, error: 'React.js is already in your stack.' });
  });

  it('enforces the length and count limits', () => {
    expect(addTech([], 'x'.repeat(51)).ok).toBe(false);
    const full = techsFromNames(Array.from({ length: MAX_TECHS }, (_, i) => `Tool ${i}`));
    expect(full).toHaveLength(MAX_TECHS);
    expect(addTech(full, 'One more').ok).toBe(false);
  });
});

describe('searchCatalog', () => {
  it('excludes selected techs and puts prefix matches first', () => {
    const groups = searchCatalog('sql', techsFromNames(['MySQL']));
    const names = groups.flatMap((g) => g.techs.map((t) => t.name));
    expect(names).toContain('PostgreSQL');
    expect(names).toContain('SQLite');
    expect(names).not.toContain('MySQL');
    expect(names.indexOf('SQLite')).toBeLessThan(names.indexOf('PostgreSQL'));
  });

  it('returns every unselected tech for an empty query', () => {
    const total = searchCatalog('', []).reduce((n, g) => n + g.techs.length, 0);
    expect(total).toBeGreaterThan(40);
  });
});

describe('toDataset', () => {
  it('groups names into the API fields', () => {
    expect(toDataset(techsFromNames(['Go', 'Rust', 'Redis', 'Elixir']))).toEqual({
      language: 'Go,Rust', framework: '', database: 'Redis', others: 'Elixir',
    });
  });
});
