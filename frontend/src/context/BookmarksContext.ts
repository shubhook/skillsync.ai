import { createContext, useContext } from 'react';
import type { BookmarkedProject, BookmarkStatus, Project } from '../types';

export interface BookmarksContextType {
  bookmarks: BookmarkedProject[];
  isBookmarked: (project: Project) => boolean;
  // Returns the bookmark that was removed, if the toggle removed one, so callers can offer undo.
  toggleBookmark: (project: Project) => BookmarkedProject | null;
  removeBookmark: (id: string) => void;
  restoreBookmarks: (bookmarks: BookmarkedProject[]) => void;
  setStatus: (id: string, status: BookmarkStatus) => void;
  clearAllBookmarks: () => void;
}

export const BookmarksContext = createContext<BookmarksContextType | undefined>(undefined);

export function useBookmarks() {
  const context = useContext(BookmarksContext);
  if (context === undefined) {
    throw new Error('useBookmarks must be used within a BookmarksProvider');
  }
  return context;
}
