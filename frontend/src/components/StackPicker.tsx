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
        className={`flex h-8 cursor-pointer items-center rounded-[6px] px-2 text-sm ${i === active ? 'bg-surface-2 text-fg' : 'text-muted'}`}
      >
        {label}
      </li>
    );
  };

  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={`${id}-input`} className="text-sm font-medium text-fg">Your stack</label>
        <span className="font-mono text-xs tabular-nums text-faint">{techs.length}/{MAX_TECHS}</span>
      </div>
      <p id={`${id}-hint`} className="mb-3 mt-1 text-[13px] text-muted">
        Search the list, or press Enter to add something that isn't in it
      </p>

      <div
        onClick={() => inputRef.current?.focus()}
        className="flex min-h-11 cursor-text flex-wrap items-center gap-1 rounded-tight border border-border-strong bg-surface p-1.5 transition-colors focus-within:border-accent"
      >
        {techs.map((tech) => (
          <span key={tech.name} className="inline-flex h-7 items-center gap-0.5 rounded-[6px] bg-surface-2 pl-2 pr-0.5 font-mono text-xs text-fg">
            {tech.name}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                remove(tech.name);
              }}
              aria-label={`Remove ${tech.name}`}
              className="grid h-6 w-6 place-items-center rounded-[4px] text-muted transition-colors hover:bg-border hover:text-fg"
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
          placeholder={techs.length ? 'Add more' : 'React, Python, Postgres'}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setActiveIndex(0);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          onKeyDown={onKeyDown}
          className="h-7 min-w-32 flex-1 bg-transparent px-1.5 text-sm text-fg placeholder:text-faint focus:outline-none"
        />
      </div>

      <p id={`${id}-message`} aria-live="polite" className="mt-1 min-h-4 text-xs text-danger">{message}</p>

      {/* Rendered in the flow (not floating) so the sticky side panel never clips it.
          The radius lives on a clipping shell so the scrollbar stays inside the corner. */}
      <div hidden={!showList} className="mt-1 overflow-hidden rounded-mid border border-border bg-surface shadow-pop">
        <ul
          id={listboxId}
          role="listbox"
          aria-label="Technologies"
          className="max-h-64 overflow-y-auto p-1"
        >
        {groups.map((group) => (
          <li key={group.category} role="presentation">
            <div className="px-2 pb-1 pt-2 text-xs text-faint" aria-hidden="true">
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
    </div>
  );
}
