import type { HTMLAttributes, ReactNode } from 'react';

export type CardDensity = 'default' | 'compact';

interface CardProps extends HTMLAttributes<HTMLElement> {
  // default = results and the builder, compact = bookmarks and secondary lists.
  density?: CardDensity;
  as?: 'article' | 'div' | 'li';
  children: ReactNode;
}

// Content shell. Density shifts padding, never structure. Don't nest cards.
export default function Card({ density = 'default', as: Comp = 'article', className = '', children, ...props }: CardProps) {
  return (
    <Comp {...props} data-density={density} className={`card ${className}`.trim()}>
      {children}
    </Comp>
  );
}
