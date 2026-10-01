import type { BookmarkedProject, Project } from '../types';

export const STORAGE_KEY = 'skillsync_bookmarks';

// Two projects are the same bookmark if their titles match, ignoring case and outer whitespace.
export function projectKey(project: Pick<Project, 'title'>): string {
  return project.title.trim().toLowerCase();
}

// crypto.randomUUID only exists in secure contexts, so plain-http LAN testing needs a fallback.
function newId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createBookmark(project: Project, now = Date.now()): BookmarkedProject {
  return { ...project, id: newId(), bookmarkedAt: now };
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

// Reads bookmarks saved by any version of the app. Drops entries without an id or title
// and fills in missing arrays so a bad entry can't crash the UI.
export function parseStoredBookmarks(raw: string | null): BookmarkedProject[] {
  if (!raw) return [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];

  return parsed.flatMap((entry): BookmarkedProject[] => {
    if (typeof entry !== 'object' || entry === null) return [];
    const b = entry as Record<string, unknown>;
    if (typeof b.id !== 'string' || typeof b.title !== 'string') return [];

    return [{
      id: b.id,
      title: b.title,
      description: typeof b.description === 'string' ? b.description : '',
      difficulty: b.difficulty === 'Beginner' || b.difficulty === 'Advanced' ? b.difficulty : 'Intermediate',
      estimatedTime: typeof b.estimatedTime === 'string' ? b.estimatedTime : '',
      techStack: stringArray(b.techStack),
      learningOutcomes: stringArray(b.learningOutcomes),
      resources: Array.isArray(b.resources)
        ? b.resources.filter((r): r is Project['resources'][number] =>
            typeof r === 'object' && r !== null && typeof r.name === 'string' && typeof r.url === 'string')
        : [],
      bookmarkedAt: typeof b.bookmarkedAt === 'number' ? b.bookmarkedAt : 0,
    }];
  });
}

export function loadBookmarks(): BookmarkedProject[] {
  try {
    return parseStoredBookmarks(localStorage.getItem(STORAGE_KEY));
  } catch (error) {
    console.error('Failed to load bookmarks:', error);
    return [];
  }
}

export function saveBookmarks(bookmarks: BookmarkedProject[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
  } catch (error) {
    console.error('Failed to save bookmarks:', error);
  }
}

// Adds the project if it isn't bookmarked, removes it if it is.
export function toggleBookmarkIn(bookmarks: BookmarkedProject[], project: Project): BookmarkedProject[] {
  const key = projectKey(project);
  if (bookmarks.some((b) => projectKey(b) === key)) {
    return bookmarks.filter((b) => projectKey(b) !== key);
  }
  return [createBookmark(project), ...bookmarks];
}
