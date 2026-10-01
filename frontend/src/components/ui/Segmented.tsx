import { KeyboardEvent, useId, useRef } from 'react';

export type SegmentedTone = 'saved' | 'building' | 'done';

interface SegmentedProps<T extends string> {
  label: string;
  // Visually hide the label (it's still announced). Use when the context already labels the control.
  hideLabel?: boolean;
  options: { value: T; label: string; tone?: SegmentedTone }[];
  // Adds an "Any" option first, meaning no value (undefined).
  includeAny?: boolean;
  value: T | undefined;
  onChange: (value: T | undefined) => void;
  size?: 'sm' | 'md';
}

// Single-select only (use chips for multi-select). Not polymorphic in element, only in size.
// Track uses surface-2; the active option uses surface plus a light shadow.
// Arrow keys move the selection, following the WAI-ARIA radio group pattern.
export default function Segmented<T extends string>({
  label, hideLabel, options, includeAny = true, value, onChange, size = 'md',
}: SegmentedProps<T>) {
  const labelId = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const all: { value: T | undefined; label: string; tone?: SegmentedTone }[] = includeAny
    ? [{ value: undefined, label: 'Any' }, ...options]
    : options;
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
      <p id={labelId} className={hideLabel ? 'sr-only' : 'mb-2 text-xs font-medium text-muted'}>{label}</p>
      <div
        role="radiogroup"
        aria-labelledby={labelId}
        onKeyDown={onKeyDown}
        className="segmented"
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
              data-tone={option.tone}
              tabIndex={checked ? 0 : -1}
              onClick={() => onChange(option.value)}
              className={size === 'sm' ? 'text-[11px]' : 'text-xs'}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
