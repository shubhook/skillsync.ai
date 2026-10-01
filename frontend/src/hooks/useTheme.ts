import { useCallback, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'skillsync_theme';

// index.html sets the class before first paint; this reads it back so React agrees.
function currentTheme(): Theme {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(currentTheme);

  useEffect(() => {
    const root = document.documentElement;
    if (root.classList.contains('dark') === (theme === 'dark')) return;
    root.classList.add('theme-switching');
    root.classList.toggle('dark', theme === 'dark');
    // Two frames: one to apply the new colors, one before transitions come back.
    const frame = requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove('theme-switching')));
    return () => {
      cancelAnimationFrame(frame);
      root.classList.remove('theme-switching');
    };
  }, [theme]);

  // Follow the OS setting until the user picks a theme themselves.
  useEffect(() => {
    const hasSavedTheme = () => {
      try {
        return localStorage.getItem(STORAGE_KEY) !== null;
      } catch {
        return false; // Storage can be blocked; fall back to the system setting.
      }
    };

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e: MediaQueryListEvent) => {
      if (!hasSavedTheme()) setTheme(e.matches ? 'dark' : 'light');
    };
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // Not persisted, but the toggle still works for this visit.
      }
      return next;
    });
  }, []);

  return { theme, toggleTheme };
}
