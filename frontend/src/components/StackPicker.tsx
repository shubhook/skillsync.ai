import { KeyboardEvent, useId, useMemo, useRef, useState } from 'react';
import { CATEGORY_LABELS } from '../data/catalog';
import { addTech, findCatalogTech, MAX_TECH_LENGTH, MAX_TECHS, normalizeTechName, searchCatalog } from '../lib/stack';
import type { Tech } from '../types';
import { CloseIcon } from './icons';

interface StackPickerProps {
  techs: Tech[];
  onChange: (techs: Tech[]) => void;
}

type Option = { kind: 'tech'; tech: Tech } | { kind: 'custom'; name: string };

// Multi-select combobox (WAI-ARIA 1.2 pattern): selected techs show as removable chips,
// typing filters the catalog, Enter adds the highlighted option or a custom entry,
// and Backspace in an empty field removes the last chip.
export default function StackPicker({ techs, onChange }: StackPickerProps) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [message, setMessage] = useState('');

  const groups = useMemo(() => searchCatalog(query, techs), [query, techs]);

  // Flat option list in display order, plus a "custom" entry when the query isn't in the catalog.
  const options = useMemo<Option[]>(() => {
    const list: Option[] = groups.flatMap((g) => g.techs.map((tech) => ({ kind: 'tech' as const, tech })));
    const name = normalizeTechName(query);
    if (name && !findCatalogTech(name)) list.push({ kind: 'custom', name });
    return list;
  }, [groups, query]);

  const listboxId = `${id}-listbox`;
  const optionId = (i: number) => `${id}-option-${i}`;
  const showList = open && options.length > 0;
  const active = Math.min(activeIndex, options.length - 1);

  const add = (name: string) => {
    const result = addTech(techs, name);
    if (result.ok) {
      onChange(result.techs);
      setMessage('');
    } else {
      setMessage(result.error);
    }
    setQuery('');
    setActiveIndex(0);
  };

  const remove = (name: string) => {
    onChange(techs.filter((t) => t.name !== name));
    setMessage('');
    inputRef.current?.focus();
  };

  const choose = (option: Option) => add(option.kind === 'tech' ? option.tech.name : option.name);

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setOpen(true);
        setActiveIndex((i) => (options.length ? (i + 1) % options.length : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setOpen(true);
        setActiveIndex((i) => (options.length ? (i - 1 + options.length) % options.length : 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (showList && options[active]) choose(options[active]);
        else if (query.trim()) add(query);
        break;
      case 'Escape':
        if (open) setOpen(false);
        else setQuery('');
        break;
      case 'Backspace':
        if (!query && techs.length) remove(techs[techs.length - 1].name);
        break;
      case 'Tab':
        setOpen(false);
        break;
    }
  };

  let optionIndex = -1;
  const renderOption = (option: Option, label: string) => {
    optionIndex += 1;
    const i = optionIndex;
    return (
      <li
        key={option.kind === 'tech' ? option.tech.name : `custom-${option.name}`}
        id={optionId(i)}
        role="option"
        aria-selected={i === active}
        // mousedown keeps focus in the input, so the list doesn't close before the click lands.
        onMouseDown={(e) => {
          e.preventDefault();
          choose(option);
        }}
        onMouseMove={() => setActiveIndex(i)}
        className={`cursor-pointer rounded-tight px-3 py-2 text-sm ${i === active ? 'bg-accent-soft text-fg' : 'text-muted'}`}
      >
        {label}
      </li>
    );
  };

  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <label htmlFor={`${id}-input`} className="text-sm font-semibold text-fg">Your stack</label>
        <span className="text-xs text-muted">{techs.length}/{MAX_TECHS}</span>
      </div>
      <p id={`${id}-hint`} className="mb-2 text-xs text-muted">
        Search or browse the list. Press Enter to add anything we don't have.
      </p>

      <div
        onClick={() => inputRef.current?.focus()}
        className="flex min-h-[44px] cursor-text flex-wrap items-center gap-1 rounded-mid border border-border-strong bg-surface p-2 focus-within:border-accent"
      >
        {techs.map((tech) => (
          <span key={tech.name} className="inline-flex items-center gap-1 rounded-tight border border-accent/25 bg-accent-soft py-1 pl-2 pr-1 text-xs font-semibold text-accent">
            {tech.name}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                remove(tech.name);
              }}
              aria-label={`Remove ${tech.name}`}
              className="rounded-tight p-0.5 text-accent hover:bg-accent/15"
            >
              <CloseIcon className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          id={`${id}-input`}
          type="text"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={showList}
          aria-controls={listboxId}
          aria-activedescendant={showList ? optionId(active) : undefined}
          aria-describedby={`${id}-hint ${id}-message`}
          autoComplete="off"
          maxLength={MAX_TECH_LENGTH}
          value={query}
          placeholder={techs.length ? 'Add more…' : 'e.g. React, Python, Postgres'}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setActiveIndex(0);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          onKeyDown={onKeyDown}
          className="min-w-[8rem] flex-1 bg-transparent px-1 py-1 text-sm text-fg placeholder:text-faint focus:outline-none"
        />
      </div>

      <p id={`${id}-message`} aria-live="polite" className="mt-1 min-h-[1rem] text-xs text-danger">{message}</p>

      {/* Rendered in the flow (not floating) so the sticky side panel never clips it. */}
      <ul
        id={listboxId}
        role="listbox"
        aria-label="Technologies"
        hidden={!showList}
        className="mt-1 max-h-64 overflow-y-auto rounded-mid border border-border bg-surface p-1 shadow-card"
      >
        {groups.map((group) => (
          <li key={group.category} role="presentation">
            <div className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-muted" aria-hidden="true">
              {CATEGORY_LABELS[group.category]}
            </div>
            <ul role="group" aria-label={CATEGORY_LABELS[group.category]}>
              {group.techs.map((tech) => renderOption({ kind: 'tech', tech }, tech.name))}
            </ul>
          </li>
        ))}
        {options.at(-1)?.kind === 'custom' && (
          <li role="presentation" className="mt-1 border-t border-border pt-1">
            <ul role="group" aria-label="Custom">
              {renderOption(options.at(-1) as Option, `Add "${normalizeTechName(query)}"`)}
            </ul>
          </li>
        )}
      </ul>
    </div>
  );
}
