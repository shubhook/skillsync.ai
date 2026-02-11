import React from 'react';
import { useBookmarks } from '../context/BookmarksContext';
import ProjectCard from './ProjectCard';

interface BookmarksPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const BookmarksPanel: React.FC<BookmarksPanelProps> = ({ isOpen, onClose }) => {
  const { bookmarks, clearAllBookmarks } = useBookmarks();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-2xl bg-gray-925 border-l border-gray-800 z-50 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-800">
          <div>
            <h2 className="text-xl font-bold text-white">Bookmarks</h2>
            <p className="text-sm text-gray-500 mt-1">
              {bookmarks.length} {bookmarks.length === 1 ? 'project' : 'projects'} saved
            </p>
          </div>
          <div className="flex items-center gap-3">
            {bookmarks.length > 0 && (
              <button
                onClick={clearAllBookmarks}
                className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
              >
                Clear all
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {bookmarks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <svg className="w-16 h-16 text-gray-700 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-400 mb-2">No bookmarks yet</h3>
              <p className="text-sm text-gray-600 max-w-xs">
                Generate some project ideas and bookmark the ones you like to save them here.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {bookmarks.map((project, idx) => (
                <ProjectCard 
                  key={project.id} 
                  project={project} 
                  index={idx + 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default BookmarksPanel;