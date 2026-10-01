import { useState } from 'react';
import { EXAMPLE_STACKS, GOAL_OPTIONS, INTERESTS, LEVEL_OPTIONS, MAX_INTERESTS, TIME_OPTIONS } from '../data/catalog';
import type { Preferences, Tech } from '../types';
import Segmented from './Segmented';
import StackPicker from './StackPicker';
import { ChevronDownIcon } from './icons';

interface BuilderPanelProps {
  techs: Tech[];
  preferences: Preferences;
  generating: boolean;
  onTechsChange: (techs: Tech[]) => void;
  onPreferencesChange: (preferences: Preferences) => void;
  onGenerate: () => void;
  onTryExample: (techNames: string[]) => void;
}

function summary(techs: Tech[], { level, timeBudget }: Preferences): string {
  const parts = [`${techs.length} ${techs.length === 1 ? 'technology' : 'technologies'}`];
  if (level) parts.push(level);
  if (timeBudget) parts.push(TIME_OPTIONS.find((o) => o.value === timeBudget)?.label ?? '');
  return parts.join(' · ');
}

// Left column: pick a stack, optionally tune, then generate.
// On small screens the Generate button is pinned to the bottom of the viewport.
export default function BuilderPanel({
  techs, preferences, generating, onTechsChange, onPreferencesChange, onGenerate, onTryExample,
}: BuilderPanelProps) {
  const [tuneOpen, setTuneOpen] = useState(false);
  const set = (patch: Partial<Preferences>) => onPreferencesChange({ ...preferences, ...patch });
  const tunedCount = [preferences.level, preferences.timeBudget, preferences.goal].filter(Boolean).length + preferences.interests.length;
  const tuneLabel = (
    <>
      Tune ideas <span className="font-normal text-muted">· optional{tunedCount > 0 && ` · ${tunedCount} set`}</span>
    </>
  );

  const toggleInterest = (interest: string) => {
    const has = preferences.interests.includes(interest);
    set({ interests: has ? preferences.interests.filter((i) => i !== interest) : [...preferences.interests, interest] });
  };

  return (
    <section aria-label="Build your stack" className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
      <StackPicker techs={techs} onChange={onTechsChange} />

      {techs.length === 0 && (
        <div className="mt-1">
          <p className="mb-2 text-xs text-muted">Or try an example:</p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_STACKS.map((example) => (
              <button
                key={example.label}
                type="button"
                onClick={() => onTryExample(example.techs)}
                disabled={generating}
                className="rounded-full border border-dashed border-border-strong px-3 py-1 text-xs font-medium text-muted transition-colors hover:border-accent hover:text-accent disabled:opacity-50"
              >
                {example.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-5 border-t border-border pt-4">
        {/* Collapsible on small screens, always open on large ones. */}
        <button
          type="button"
          onClick={() => setTuneOpen((o) => !o)}
          aria-expanded={tuneOpen}
          aria-controls="tune-ideas"
          className="flex w-full items-center justify-between text-left lg:hidden"
        >
          <span className="text-sm font-semibold text-fg">{tuneLabel}</span>
          <ChevronDownIcon className={`h-4 w-4 text-muted transition-transform ${tuneOpen ? 'rotate-180' : ''}`} />
        </button>
        <h2 className="hidden text-sm font-semibold text-fg lg:block">{tuneLabel}</h2>

        <div id="tune-ideas" className={`${tuneOpen ? 'block' : 'hidden'} mt-4 space-y-4 lg:block`}>
          <Segmented label="Level" options={LEVEL_OPTIONS} value={preferences.level} onChange={(level) => set({ level })} size="sm" />
          <Segmented
            label="Time you have"
            options={TIME_OPTIONS.map((o) => ({ value: o.value, label: o.short }))}
            value={preferences.timeBudget}
            onChange={(timeBudget) => set({ timeBudget })}
          />
          <Segmented label="Goal" options={GOAL_OPTIONS} value={preferences.goal} onChange={(goal) => set({ goal })} />

          <div>
            <p className="mb-1.5 text-xs font-medium text-muted">
              Interested in <span className="text-faint">· up to {MAX_INTERESTS}</span>
            </p>
            <div className="flex flex-wrap gap-1.5">
              {INTERESTS.map((interest) => {
                const on = preferences.interests.includes(interest);
                const full = !on && preferences.interests.length >= MAX_INTERESTS;
                return (
                  <button
                    key={interest}
                    type="button"
                    aria-pressed={on}
                    disabled={full}
                    onClick={() => toggleInterest(interest)}
                    className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                      on ? 'border-accent bg-accent/10 text-accent' : 'border-border-strong text-muted hover:text-fg'
                    }`}
                  >
                    {interest}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-bg/95 px-4 pb-4 pt-3 backdrop-blur lg:static lg:mt-5 lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
        <p className="mb-2 flex justify-between text-xs text-muted lg:hidden" aria-hidden="true">
          <span>{summary(techs, preferences)}</span>
        </p>
        <button
          type="button"
          onClick={onGenerate}
          disabled={generating || techs.length === 0}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-accent-ink transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {generating ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />
              Generating…
            </>
          ) : (
            <>
              Generate 3 ideas
              {/* The mobile bar shows the count in its summary line instead. */}
              {techs.length > 0 && <span className="hidden font-normal lg:inline">· {techs.length} {techs.length === 1 ? 'technology' : 'technologies'}</span>}
            </>
          )}
        </button>
        {techs.length === 0 && <p className="mt-2 hidden text-center text-xs text-muted lg:block">Add at least one technology to start.</p>}
      </div>
    </section>
  );
}
