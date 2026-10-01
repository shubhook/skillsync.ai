import { useId } from 'react';

interface LogoMarkProps {
  className?: string;
}

// Even geometric S knocked out of the same 8px tile as the toolbar buttons.
// Bowls are semicircles and the ends are cut flat so it stays a mark, not a pen stroke.
const S =
  'M22.2 9.4 H14.2 A3.5 3.5 0 0 0 10.7 12.9 A3.5 3.5 0 0 0 14.2 16.4 H17.8 A3.5 3.5 0 0 1 21.3 19.9 A3.5 3.5 0 0 1 17.8 23.4 H9.8';

export default function LogoMark({ className }: LogoMarkProps) {
  const maskId = useId();

  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={className}>
      <mask id={maskId}>
        <rect width="32" height="32" rx="8" fill="white" />
        <path d={S} fill="none" stroke="black" strokeWidth="4.4" strokeLinecap="square" strokeLinejoin="round" />
      </mask>
      <rect width="32" height="32" rx="8" fill="currentColor" mask={`url(#${maskId})`} />
    </svg>
  );
}
