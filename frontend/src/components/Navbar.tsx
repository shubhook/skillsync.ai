import { useBookmarks } from '../context/BookmarksContext';
import { useTheme } from '../hooks/useTheme';
import LogoMark from './LogoMark';
import Action from './ui/Action';
import Badge from './ui/Badge';
import { BookmarkIcon, MoonIcon, SunIcon } from './icons';

interface NavbarProps {
  onOpenBookmarks: () => void;
}

export default function Navbar({ onOpenBookmarks }: NavbarProps) {
  const { bookmarks } = useBookmarks();
  const { theme, toggleTheme } = useTheme();
  const nextTheme = theme === 'dark' ? 'light' : 'dark';

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/85 backdrop-blur-md">
      <nav className="mx-auto flex max-w-page items-center justify-between px-4 py-3 sm:px-6" aria-label="Main">
        <a href="/" className="flex items-center gap-2 rounded-tight text-lg font-bold tracking-tight text-fg">
          <LogoMark className="h-8 w-8 shrink-0" />
          SkillSync
        </a>
        <div className="flex items-center gap-2">
          <Action
            variant="icon"
            className="relative"
            onClick={onOpenBookmarks}
            aria-label={bookmarks.length > 0 ? `Bookmarks, ${bookmarks.length} saved` : 'Bookmarks'}
            title="Bookmarks"
          >
            <BookmarkIcon className="h-4 w-4" />
            {bookmarks.length > 0 && (
              <Badge className="absolute -right-1.5 -top-1.5 min-w-4 justify-center px-1">
                {bookmarks.length}
                <span className="sr-only"> saved</span>
              </Badge>
            )}
          </Action>
          <Action variant="icon" onClick={toggleTheme} aria-label={`Switch to ${nextTheme} theme`} title={`Switch to ${nextTheme} theme`}>
            {theme === 'dark' ? <SunIcon className="h-4 w-4" /> : <MoonIcon className="h-4 w-4" />}
          </Action>
        </div>
      </nav>
    </header>
  );
}
