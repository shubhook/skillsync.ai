import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Types
export interface Resource {
  name: string;
  type: 'Documentation' | 'Video' | 'Tutorial';
  url: string;
}

export interface Project {
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedTime: string;
  techStack: string[];
  resources: Resource[];
  learningOutcomes: string[];
}

export interface BookmarkedProject extends Project {
  id: string;
  bookmarkedAt: number;
}

interface BookmarksContextType {
  bookmarks: BookmarkedProject[];
  addBookmark: (project: Project) => void;
  removeBookmark: (id: string) => void;
  isBookmarked: (project: Project) => boolean;
  getBookmarkId: (project: Project) => string | null;
  clearAllBookmarks: () => void;
}

const BookmarksContext = createContext<BookmarksContextType | undefined>(undefined);

const STORAGE_KEY = 'skillsync_bookmarks';

// Generate a unique ID for a project based on its title
function generateProjectId(project: Project): string {
  return btoa(project.title).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
}

export function BookmarksProvider({ children }: { children: ReactNode }) {
  const [bookmarks, setBookmarks] = useState<BookmarkedProject[]>([]);

  // Load bookmarks from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as BookmarkedProject[];
        setBookmarks(parsed);
      }
    } catch (error) {
      console.error('Failed to load bookmarks:', error);
    }
  }, []);

  // Save bookmarks to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
    } catch (error) {
      console.error('Failed to save bookmarks:', error);
    }
  }, [bookmarks]);

  const addBookmark = (project: Project) => {
    const id = generateProjectId(project);
    const exists = bookmarks.some(b => b.id === id);
    
    if (!exists) {
      const bookmarkedProject: BookmarkedProject = {
        ...project,
        id,
        bookmarkedAt: Date.now(),
      };
      setBookmarks(prev => [bookmarkedProject, ...prev]);
    }
  };

  const removeBookmark = (id: string) => {
    setBookmarks(prev => prev.filter(b => b.id !== id));
  };

  const isBookmarked = (project: Project): boolean => {
    const id = generateProjectId(project);
    return bookmarks.some(b => b.id === id);
  };

  const getBookmarkId = (project: Project): string | null => {
    const id = generateProjectId(project);
    const bookmark = bookmarks.find(b => b.id === id);
    return bookmark ? bookmark.id : null;
  };

  const clearAllBookmarks = () => {
    setBookmarks([]);
  };

  return (
    <BookmarksContext.Provider value={{
      bookmarks,
      addBookmark,
      removeBookmark,
      isBookmarked,
      getBookmarkId,
      clearAllBookmarks,
    }}>
      {children}
    </BookmarksContext.Provider>
  );
}

export function useBookmarks() {
  const context = useContext(BookmarksContext);
  if (context === undefined) {
    throw new Error('useBookmarks must be used within a BookmarksProvider');
  }
  return context;
}
