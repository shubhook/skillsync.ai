import { describe, expect, it } from 'vitest';
import type { Project } from '../types';
import { createBookmark, parseStoredBookmarks, projectKey, restoreBookmarkIn, toggleBookmarkIn } from './bookmarks';

const project = (title: string): Project => ({
  title,
  description: 'desc',
  difficulty: 'Beginner',
  estimatedTime: '1 week',
  techStack: ['Go'],
  resources: [],
  learningOutcomes: ['Testing'],
});

describe('projectKey', () => {
  it('handles titles that btoa rejects', () => {
    expect(() => projectKey(project('Budget Buddy – Expense Splitter'))).not.toThrow();
    expect(() => projectKey(project('Let’s Code 🚀'))).not.toThrow();
  });

  it('keeps titles with a shared prefix distinct', () => {
    expect(projectKey(project('DevPulse: Real-time Team Mood Tracker')))
      .not.toBe(projectKey(project('DevPulse: Real-time Code Review Bot')));
  });

  it('ignores case and outer whitespace', () => {
    expect(projectKey(project('  Trail Buddy '))).toBe(projectKey(project('trail buddy')));
  });
});

describe('toggleBookmarkIn', () => {
  it('adds, then removes, a project', () => {
    const added = toggleBookmarkIn([], project('A'));
    expect(added).toHaveLength(1);
    expect(added[0].id).toBeTruthy();
    expect(toggleBookmarkIn(added, project('A'))).toEqual([]);
  });

  it('can bookmark two projects with the same title prefix', () => {
    const one = toggleBookmarkIn([], project('DevPulse: Real-time Team Mood Tracker'));
    const both = toggleBookmarkIn(one, project('DevPulse: Real-time Code Review Bot'));
    expect(both).toHaveLength(2);
    expect(new Set(both.map((b) => b.id)).size).toBe(2);
  });

  it('puts new bookmarks first', () => {
    const list = toggleBookmarkIn(toggleBookmarkIn([], project('Old')), project('New'));
    expect(list.map((b) => b.title)).toEqual(['New', 'Old']);
  });
});

describe('parseStoredBookmarks', () => {
  it('returns [] for empty, invalid, or non-array input', () => {
    expect(parseStoredBookmarks(null)).toEqual([]);
    expect(parseStoredBookmarks('not json')).toEqual([]);
    expect(parseStoredBookmarks('{"a":1}')).toEqual([]);
  });

  it('round-trips saved bookmarks, including old base64-style ids', () => {
    const saved = [createBookmark(project('A'), 123), { ...createBookmark(project('B'), 456), id: 'RGV2UHVsc2U6IFJl' }];
    expect(parseStoredBookmarks(JSON.stringify(saved))).toEqual(saved);
  });

  it('drops entries without id or title and fills missing arrays', () => {
    const raw = JSON.stringify([{ title: 'No id' }, { id: 'x' }, { id: 'y', title: 'Partial' }]);
    const [only, ...rest] = parseStoredBookmarks(raw);
    expect(rest).toEqual([]);
    expect(only).toMatchObject({ id: 'y', title: 'Partial', techStack: [], resources: [], learningOutcomes: [] });
  });

  it('defaults a missing or unknown status to saved and keeps valid ones', () => {
    const raw = JSON.stringify([{ id: 'a', title: 'A' }, { id: 'b', title: 'B', status: 'building' }, { id: 'c', title: 'C', status: 'nope' }]);
    expect(parseStoredBookmarks(raw).map((b) => b.status)).toEqual(['saved', 'building', 'saved']);
  });
});

describe('createBookmark', () => {
  it('drops UI-only fields like a result id or variation info', () => {
    const bookmark = createBookmark({ ...project('A'), id: 'result-1', variationOf: { title: 'B', direction: 'easier' } } as Project);
    expect(bookmark).not.toHaveProperty('variationOf');
    expect(bookmark.id).not.toBe('result-1');
    expect(bookmark.status).toBe('saved');
  });
});

describe('restoreBookmarkIn', () => {
  it('puts a removed bookmark back in date order', () => {
    const older = createBookmark(project('Old'), 1);
    const newer = createBookmark(project('New'), 3);
    const middle = createBookmark(project('Middle'), 2);
    expect(restoreBookmarkIn([newer, older], middle).map((b) => b.title)).toEqual(['New', 'Middle', 'Old']);
  });

  it('skips the restore if the same title was saved again', () => {
    const original = createBookmark(project('A'), 1);
    const again = createBookmark(project('a'), 2);
    expect(restoreBookmarkIn([again], original)).toEqual([again]);
  });
});
