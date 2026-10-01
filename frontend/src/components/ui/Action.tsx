import type { ComponentPropsWithoutRef, ComponentType } from 'react';

export type ActionVariant = 'solid' | 'ghost' | 'link' | 'icon';

// Design system: `as` may be button, a, or span. Anything else is over 50% polymorphism.
type ActionElement = 'button' | 'a' | 'span';

export type ActionProps<T extends ActionElement = 'button'> = {
  as?: T;
  variant?: ActionVariant;
} & ComponentPropsWithoutRef<T>;

// Polymorphic control. solid = primary commitment, ghost = secondary, link = navigation
// only, icon = a single 32x32 glyph (give it an aria-label). Ghost uses the same 32px
// height as icon so adjacent controls share a pixel grid. Chrome lives in index.css
// under .action[data-variant]; className is for layout (width, margins) only.
export default function Action<T extends ActionElement = 'button'>({
  as,
  variant = 'solid',
  className = '',
  ...props
}: ActionProps<T>) {
  const Comp = (as ?? 'button') as unknown as ComponentType<Record<string, unknown>>;
  // Callers get props typed for their element; inside, the generic union is too wide for TS to check.
  const rest = props as Record<string, unknown>;
  const typeProps = (as ?? 'button') === 'button' ? { type: 'button' } : {};
  return <Comp {...typeProps} {...rest} data-variant={variant} className={`action ${className}`.trim()} />;
}
