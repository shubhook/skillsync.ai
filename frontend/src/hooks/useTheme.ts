import { useCallback, useEffect, useState } from 'react';

export type ThemePreference = 'system' | 'light' | 'dark';

const STORAGE_KEY = 'skillsync_theme';

function readPreference(): ThemePreference {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === 'light' || saved === 'dark' ? saved : 'system';
  } catch {
    return 'system'; // Storage can be blocked; follow the system setting.
  }
}

const systemQuery = () => window.matchMedia('(prefers-color-scheme: dark)');

// Follows the OS appearance by default (HIG dark-mode.md). Light or Dark is an explicit
// override that the user can undo by choosing System again.
export function useTheme() {
  const [preference, setPreferenceState] = useState<ThemePreference>(readPreference);
  const [systemDark, setSystemDark] = useState(() => systemQuery().matches);
  const dark = preference === 'system' ? systemDark : preference === 'dark';

  useEffect(() => {
    const media = systemQuery();
    const onChange = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  // index.html sets the class before first paint; this keeps it in sync afterwards.
  useEffect(() => {
    const root = document.documentElement;
    if (root.classList.contains('dark') === dark) return;
    root.classList.add('theme-switching');
    root.classList.toggle('dark', dark);
    // Two frames: one to apply the new colors, one before transitions come back.
    const frame = requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove('theme-switching')));
    return () => {
      cancelAnimationFrame(frame);
      root.classList.remove('theme-switching');
    };
  }, [dark]);

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next);
    try {
      if (next === 'system') localStorage.removeItem(STORAGE_KEY);
      else localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Not persisted, but the choice still applies for this visit.
    }
  }, []);

  return { preference, dark, setPreference };
}
