/** @type {import('tailwindcss').Config} */

// Colors, radii, and shadow come from CSS variables in src/index.css, so one set of
// classes works for both themes. See the "50% polymorphism" design system for the rules.
const token = (name) => `rgb(var(--c-${name}) / <alpha-value>)`;

export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Instrument Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        bg: token('bg'),
        'bg-deep': token('bg-deep'),
        surface: token('surface'),
        'surface-2': token('surface-2'),
        border: token('border'),
        'border-strong': token('border-strong'),
        fg: token('fg'),
        muted: token('muted'),
        faint: token('faint'),
        accent: token('accent'),
        'accent-soft': token('accent-soft'),
        'accent-ink': token('accent-ink'),
        beginner: token('beginner'),
        intermediate: token('intermediate'),
        advanced: token('advanced'),
        danger: token('danger'),
        saved: token('saved'),
        building: token('building'),
        done: token('done'),
      },
      // The radius ladder. Use these names only (plus rounded-full for dots and spinners).
      borderRadius: {
        tight: '8px',
        mid: '12px',
        soft: '18px',
        shell: '24px',
      },
      boxShadow: {
        card: 'var(--shadow)',
      },
      maxWidth: {
        page: '1080px',
      },
      keyframes: {
        shimmer: { from: { backgroundPosition: '200% 0' }, to: { backgroundPosition: '-200% 0' } },
        'slide-in': { from: { transform: 'translateX(100%)' }, to: { transform: 'translateX(0)' } },
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'toast-in': { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
      animation: {
        shimmer: 'shimmer 1.4s linear infinite',
        'slide-in': 'slide-in 200ms ease-out',
        'fade-in': 'fade-in 150ms ease-out',
        'toast-in': 'toast-in 180ms ease-out',
      },
    },
  },
  plugins: [],
}
