import { useBookmarks } from '../context/BookmarksContext';
import { ThemePreference, useTheme } from '../hooks/useTheme';
import LogoMark from './LogoMark';
import Menu from './ui/Menu';
import { BookmarkIcon, MonitorIcon, MoonIcon, SunIcon } from './icons';

interface NavbarProps {
  onOpenBookmarks: () => void;
}

const THEMES: { value: ThemePreference; label: string; Icon: typeof SunIcon }[] = [
  { value: 'system', label: 'System', Icon: MonitorIcon },
  { value: 'light', label: 'Light', Icon: SunIcon },
  { value: 'dark', label: 'Dark', Icon: MoonIcon },
];

export default function Navbar({ onOpenBookmarks }: NavbarProps) {
  const { bookmarks } = useBookmarks();
  const { preference, dark, setPreference } = useTheme();
  const CurrentIcon = preference === 'system' ? MonitorIcon : dark ? MoonIcon : SunIcon;

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg">
      <nav className="mx-auto flex h-14 max-w-page items-center justify-between px-4 sm:px-6" aria-label="Main">
        <a href="/" className="flex items-center gap-2 rounded-tight text-base font-semibold text-fg">
          <LogoMark className="h-6 w-6 shrink-0" />
          SkillSync
        </a>
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="action"
            data-variant="ghost"
            onClick={onOpenBookmarks}
            aria-label={bookmarks.length > 0 ? `Bookmarks, ${bookmarks.length} saved` : 'Bookmarks'}
          >
            <BookmarkIcon className="h-4 w-4 text-muted" />
            <span className="hidden sm:inline">Bookmarks</span>
            {bookmarks.length > 0 && <span className="font-mono text-xs tabular-nums text-muted">{bookmarks.length}</span>}
          </button>
          <Menu
            triggerVariant="icon"
            triggerLabel="Appearance"
            title="Appearance"
            align="end"
            trigger={<CurrentIcon className="h-4 w-4" />}
            items={THEMES.map(({ value, label, Icon }) => ({
              label,
              icon: <Icon className="h-4 w-4" />,
              checked: preference === value,
              onSelect: () => setPreference(value),
            }))}
          />
        </div>
      </nav>
    </header>
  );
}
