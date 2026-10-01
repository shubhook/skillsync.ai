import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import type { BookmarkedProject, Project } from '../types';
import { loadBookmarks, projectKey, saveBookmarks, toggleBookmarkIn } from '../lib/bookmarks';
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
    setBookmarks((prev) => toggleBookmarkIn(prev, project));
  }, []);

  const clearAllBookmarks = useCallback(() => {
    setBookmarks([]);
  }, []);

  const value = useMemo(
    () => ({ bookmarks, isBookmarked, toggleBookmark, clearAllBookmarks }),
    [bookmarks, isBookmarked, toggleBookmark, clearAllBookmarks],
  );

  return <BookmarksContext.Provider value={value}>{children}</BookmarksContext.Provider>;
}
