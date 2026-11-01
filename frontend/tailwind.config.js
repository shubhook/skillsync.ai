/** @type {import('tailwindcss').Config} */

// Colors, radii, and shadows come from CSS variables in src/index.css, so one set of
// classes works for both themes.
const token = (name) => `rgb(var(--c-${name}) / <alpha-value>)`;
const ease = 'cubic-bezier(0.22, 1, 0.36, 1)';

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
        danger: token('danger'),
        building: token('building'),
        done: token('done'),
      },
      // The radius ladder: controls 8, cards 16, sheets 20 (plus rounded-full for dots and spinners).
      borderRadius: {
        tight: '8px',
        mid: '12px',
        soft: '16px',
        shell: '20px',
      },
      boxShadow: {
        card: 'var(--shadow)',
        pop: 'var(--shadow-pop)',
      },
      maxWidth: {
        page: '1120px',
      },
      transitionTimingFunction: {
        'out-soft': ease,
      },
      keyframes: {
        shimmer: { from: { backgroundPosition: '200% 0' }, to: { backgroundPosition: '-200% 0' } },
        'slide-in': { from: { transform: 'translateX(24px)', opacity: '0' }, to: { transform: 'translateX(0)', opacity: '1' } },
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        rise: { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        'menu-in': { from: { opacity: '0', transform: 'translateY(-4px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
      animation: {
        shimmer: 'shimmer 1.6s linear infinite',
        'slide-in': `slide-in 320ms ${ease}`,
        'fade-in': `fade-in 200ms ${ease}`,
        rise: `rise 360ms ${ease} both`,
        'toast-in': `rise 220ms ${ease}`,
        'menu-in': `menu-in 160ms ${ease}`,
      },
    },
  },
  plugins: [],
}
