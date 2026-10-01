import { KeyboardEvent, useId, useRef } from 'react';

interface SegmentedProps<T extends string> {
  label: string;
  options: { value: T; label: string }[];
  // undefined means "Any"
  value: T | undefined;
  onChange: (value: T | undefined) => void;
  size?: 'sm' | 'md';
}

// A radio group drawn as a segmented control, with an "Any" option first.
// Arrow keys move the selection, following the WAI-ARIA radio group pattern.
export default function Segmented<T extends string>({ label, options, value, onChange, size = 'md' }: SegmentedProps<T>) {
  const labelId = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const all: { value: T | undefined; label: string }[] = [{ value: undefined, label: 'Any' }, ...options];
  const selectedIndex = Math.max(0, all.findIndex((o) => o.value === value));

  const onKeyDown = (e: KeyboardEvent) => {
    const step = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const next = (selectedIndex + step + all.length) % all.length;
    onChange(all[next].value);
    refs.current[next]?.focus();
  };

  return (
    <div>
      <p id={labelId} className="mb-1.5 text-xs font-medium text-muted">{label}</p>
      <div
        role="radiogroup"
        aria-labelledby={labelId}
        onKeyDown={onKeyDown}
        className="grid gap-1 rounded-lg border border-border-strong bg-surface-2 p-1"
        style={{ gridTemplateColumns: `repeat(${all.length}, minmax(0, 1fr))` }}
      >
        {all.map((option, i) => {
          const checked = i === selectedIndex;
          return (
            <button
              key={option.label}
              ref={(el) => { refs.current[i] = el; }}
              type="button"
              role="radio"
              aria-checked={checked}
              tabIndex={checked ? 0 : -1}
              onClick={() => onChange(option.value)}
              className={`truncate rounded-md px-1 font-medium transition-colors ${size === 'sm' ? 'py-1 text-[11px]' : 'py-1.5 text-xs'} ${
                checked ? 'bg-surface text-fg shadow-sm ring-1 ring-border-strong' : 'text-muted hover:text-fg'
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
