import React from 'react';
import { useBookmarks } from '../context/BookmarksContext';

interface NavbarProps {
  onOpenBookmarks: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onOpenBookmarks }) => {
  const { bookmarks } = useBookmarks();
  const bookmarkCount = bookmarks.length;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-925/90 backdrop-blur-md border-b border-gray-800">
      <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-white font-bold text-xl">SkillSync</span>
        </div>
        <div className="flex items-center gap-3">
          {/* Bookmarks Button */}
          <button
            onClick={onOpenBookmarks}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 hover:text-white hover:border-gray-600 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            Bookmarks
            {bookmarkCount > 0 && (
              <span className="px-1.5 py-0.5 bg-white text-gray-900 text-xs font-semibold rounded-full min-w-[20px] text-center">
                {bookmarkCount}
              </span>
            )}
          </button>
          {/* GitHub Link */}
          <a
            href="https://github.com/shubhook/skillsync.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 hover:text-white hover:border-gray-600 transition-all"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
            </svg>
            GitHub
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;