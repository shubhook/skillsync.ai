import { useBookmarks } from '../context/BookmarksContext';
import { useTheme } from '../hooks/useTheme';
import { BookmarkIcon, MoonIcon, SunIcon } from './icons';

interface NavbarProps {
  onOpenBookmarks: () => void;
}

export default function Navbar({ onOpenBookmarks }: NavbarProps) {
  const { bookmarks } = useBookmarks();
  const { theme, toggleTheme } = useTheme();
  const nextTheme = theme === 'dark' ? 'light' : 'dark';

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/85 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6" aria-label="Main">
        <a href="/" className="flex items-center gap-2 rounded-lg text-lg font-bold text-fg">
          <img src="/logo.png" alt="" className="h-7 w-7 rounded-md" />
          SkillSync
        </a>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={`Switch to ${nextTheme} theme`}
            title={`Switch to ${nextTheme} theme`}
            className="rounded-lg border border-border-strong p-2 text-muted transition-colors hover:text-fg"
          >
            {theme === 'dark' ? <SunIcon className="h-4 w-4" /> : <MoonIcon className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={onOpenBookmarks}
            className="inline-flex items-center gap-2 rounded-lg border border-border-strong px-3 py-2 text-sm font-medium text-fg transition-colors hover:bg-surface-2"
          >
            <BookmarkIcon className="h-4 w-4" />
            <span className="sr-only sm:not-sr-only">Bookmarks</span>
            {bookmarks.length > 0 && (
              <span className="min-w-[20px] rounded-full bg-accent px-1.5 py-0.5 text-center text-xs font-semibold text-accent-ink">
                {bookmarks.length}
                <span className="sr-only"> saved</span>
              </span>
            )}
          </button>
        </div>
      </nav>
    </header>
  );
}
