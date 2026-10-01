import type { HTMLAttributes, ReactNode } from 'react';

export type CardDensity = 'default' | 'compact' | 'featured';

interface CardProps extends HTMLAttributes<HTMLElement> {
  // default = results, featured = at most one per group, compact = bookmarks and secondary lists.
  density?: CardDensity;
  as?: 'article' | 'div' | 'li';
  children: ReactNode;
}

// Content shell. Density shifts padding and surface, never structure. Don't nest cards.
export default function Card({ density = 'default', as: Comp = 'article', className = '', children, ...props }: CardProps) {
  return (
    <Comp {...props} data-density={density} className={`card ${className}`.trim()}>
      {children}
    </Comp>
  );
}
