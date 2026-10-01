import type { ReactNode } from 'react';

export type BadgeTone = 'beginner' | 'intermediate' | 'advanced' | 'neutral';

// Difficulty tones are for difficulty only; time and everything else use neutral.
// Badges never use the accent color.
export default function Badge({ tone = 'neutral', children, className = '' }: { tone?: BadgeTone; children: ReactNode; className?: string }) {
  return <span data-tone={tone} className={`badge ${className}`.trim()}>{children}</span>;
}

