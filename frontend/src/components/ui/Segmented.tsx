import { KeyboardEvent, useId, useRef } from 'react';

export type SegmentedTone = 'saved' | 'building' | 'done';

// Status gets a small dot. The label carries the meaning, the dot helps scanning.
const DOT: Record<SegmentedTone, string> = {
  saved: 'bg-faint',
  building: 'bg-building',
  done: 'bg-done',
};

interface SegmentedProps<T extends string> {
  label: string;
  // Visually hide the label (it's still announced). Use when the context already labels the control.
  hideLabel?: boolean;
  options: { value: T; label: string; tone?: SegmentedTone; count?: number }[];
  // Adds an "Any" option first, meaning no value (undefined).
  includeAny?: boolean;
  value: T | undefined;
  onChange: (value: T | undefined) => void;
}

// Single-select only (use chips for multi-select).
// Arrow keys move the selection, following the WAI-ARIA radio group pattern.
export default function Segmented<T extends string>({
  label, hideLabel, options, includeAny = true, value, onChange,
}: SegmentedProps<T>) {
  const labelId = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const all: { value: T | undefined; label: string; tone?: SegmentedTone; count?: number }[] = includeAny
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
      <p id={labelId} className={hideLabel ? 'sr-only' : 'mb-2 text-[13px] text-muted'}>{label}</p>
      <div
        role="radiogroup"
        aria-labelledby={labelId}
        onKeyDown={onKeyDown}
        className="segmented"
        // Each option is at least as wide as its label, so "Intermediate" never clips.
        style={{ gridTemplateColumns: `repeat(${all.length}, minmax(max-content, 1fr))` }}
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
            >
              {option.tone && <span className={`h-1.5 w-1.5 flex-none rounded-full ${DOT[option.tone]}`} aria-hidden="true" />}
              {option.label}
              {option.count !== undefined && <span className="font-mono font-normal tabular-nums text-faint">{option.count}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
