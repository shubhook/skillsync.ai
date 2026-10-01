import { createContext, useContext } from 'react';
import type { BookmarkedProject, Project } from '../types';

export interface BookmarksContextType {
  bookmarks: BookmarkedProject[];
  isBookmarked: (project: Project) => boolean;
  toggleBookmark: (project: Project) => void;
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
