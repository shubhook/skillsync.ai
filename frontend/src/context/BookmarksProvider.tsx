import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import type { BookmarkedProject, BookmarkStatus, Project } from '../types';
import { loadBookmarks, projectKey, restoreBookmarkIn, saveBookmarks, toggleBookmarkIn } from '../lib/bookmarks';
import { BookmarksContext } from './BookmarksContext';

export function BookmarksProvider({ children }: { children: ReactNode }) {
  // Read storage in the initializer, not an effect. An effect-based load raced the save
  // effect, and under StrictMode the saved [] overwrote the stored bookmarks.
  const [bookmarks, setBookmarks] = useState<BookmarkedProject[]>(loadBookmarks);

  useEffect(() => {
    saveBookmarks(bookmarks);
  }, [bookmarks]);

  const bookmarkedKeys = useMemo(() => new Set(bookmarks.map(projectKey)), [bookmarks]);

  const isBookmarked = useCallback(
    (project: Project) => bookmarkedKeys.has(projectKey(project)),
    [bookmarkedKeys],
  );

  const toggleBookmark = useCallback((project: Project) => {
    const key = projectKey(project);
    const removed = bookmarks.find((b) => projectKey(b) === key) ?? null;
    setBookmarks((prev) => toggleBookmarkIn(prev, project));
    return removed;
  }, [bookmarks]);

  const removeBookmark = useCallback((id: string) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const restoreBookmarks = useCallback((restored: BookmarkedProject[]) => {
    setBookmarks((prev) => restored.reduce(restoreBookmarkIn, prev));
  }, []);

  const setStatus = useCallback((id: string, status: BookmarkStatus) => {
    setBookmarks((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
  }, []);

  const clearAllBookmarks = useCallback(() => {
    setBookmarks([]);
  }, []);

  const value = useMemo(
    () => ({ bookmarks, isBookmarked, toggleBookmark, removeBookmark, restoreBookmarks, setStatus, clearAllBookmarks }),
    [bookmarks, isBookmarked, toggleBookmark, removeBookmark, restoreBookmarks, setStatus, clearAllBookmarks],
  );

  return <BookmarksContext.Provider value={value}>{children}</BookmarksContext.Provider>;
}
