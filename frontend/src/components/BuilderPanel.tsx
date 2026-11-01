import { useState } from 'react';
import { EXAMPLE_STACKS, GOAL_OPTIONS, INTERESTS, LEVEL_OPTIONS, MAX_INTERESTS, TIME_OPTIONS } from '../data/catalog';
import type { Preferences, Tech } from '../types';
import StackPicker from './StackPicker';
import Action from './ui/Action';
import Card from './ui/Card';
import Segmented from './ui/Segmented';
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

const techCount = (n: number) => `${n} ${n === 1 ? 'technology' : 'technologies'}`;

// What the collapsed Tune section shows, e.g. "Intermediate · 2-4 wk · 2 interests".
function tuneSummary({ level, timeBudget, goal, interests }: Preferences): string {
  const parts: string[] = [];
  if (level) parts.push(level);
  if (timeBudget) parts.push(TIME_OPTIONS.find((o) => o.value === timeBudget)?.short ?? '');
  if (goal) parts.push(GOAL_OPTIONS.find((o) => o.value === goal)?.label ?? '');
  if (interests.length) parts.push(interests.length === 1 ? interests[0] : `${interests.length} interests`);
  return parts.length ? parts.join(' · ') : 'Optional';
}

// Left column: pick a stack, optionally tune, then generate.
// On small screens the Generate button is pinned to the bottom of the viewport.
export default function BuilderPanel({
  techs, preferences, generating, onTechsChange, onPreferencesChange, onGenerate, onTryExample,
}: BuilderPanelProps) {
  const [tuneOpen, setTuneOpen] = useState(false);
  const set = (patch: Partial<Preferences>) => onPreferencesChange({ ...preferences, ...patch });

  const toggleInterest = (interest: string) => {
    const has = preferences.interests.includes(interest);
    set({ interests: has ? preferences.interests.filter((i) => i !== interest) : [...preferences.interests, interest] });
  };

  return (
    <section aria-label="Build your stack">
      <Card as="div">
        <StackPicker techs={techs} onChange={onTechsChange} />

        {techs.length === 0 && (
          <div className="mt-2">
            <p className="text-[13px] text-muted">Or start from an example</p>
            <ul className="mt-2 flex flex-col items-start gap-1">
              {EXAMPLE_STACKS.map((example) => (
                <li key={example.label}>
                  <button
                    type="button"
                    onClick={() => onTryExample(example.techs)}
                    disabled={generating}
                    className="rounded-[6px] py-0.5 font-mono text-xs text-fg underline decoration-border-strong underline-offset-4 transition-colors hover:decoration-fg disabled:text-faint"
                  >
                    {example.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-5 border-t border-border pt-1">
          {/* Progressive disclosure: the four tuning controls stay out of the way until asked for. */}
          <button
            type="button"
            onClick={() => setTuneOpen((o) => !o)}
            aria-expanded={tuneOpen}
            aria-controls="tune-ideas"
            className="flex h-10 w-full items-center gap-2 rounded-tight text-left"
          >
            <span className="text-sm font-medium text-fg">Tune ideas</span>
            <span className="min-w-0 flex-1 truncate text-right text-[13px] text-muted">{tuneSummary(preferences)}</span>
            <ChevronDownIcon className={`h-4 w-4 flex-none text-muted transition-transform duration-200 ease-out-soft ${tuneOpen ? 'rotate-180' : ''}`} />
          </button>

          <div id="tune-ideas" hidden={!tuneOpen} className="space-y-4 pb-1 pt-3">
            <Segmented label="Level" options={LEVEL_OPTIONS} value={preferences.level} onChange={(level) => set({ level })} />
            <Segmented
              label="Time you have"
              options={TIME_OPTIONS.map((o) => ({ value: o.value, label: o.short }))}
              value={preferences.timeBudget}
              onChange={(timeBudget) => set({ timeBudget })}
            />
            <Segmented label="Goal" options={GOAL_OPTIONS} value={preferences.goal} onChange={(goal) => set({ goal })} />

            <div>
              <p className="mb-2 text-[13px] text-muted">
                Interested in <span className="text-faint">· up to {MAX_INTERESTS}</span>
              </p>
              {/* Multi-select, so chips (toggle Actions), not a Segmented. */}
              <div className="flex flex-wrap gap-2">
                {INTERESTS.map((interest) => {
                  const on = preferences.interests.includes(interest);
                  return (
                    <Action
                      key={interest}
                      variant="ghost"
                      aria-pressed={on}
                      disabled={!on && preferences.interests.length >= MAX_INTERESTS}
                      onClick={() => toggleInterest(interest)}
                    >
                      {interest}
                    </Action>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-bg px-4 pb-4 pt-3 lg:static lg:mt-4 lg:border-0 lg:bg-transparent lg:p-0">
          <p className="mb-2 text-[13px] text-muted lg:hidden" aria-hidden="true">
            {techs.length ? techCount(techs.length) : 'Add a technology to start'}
          </p>
          <Action variant="solid" onClick={onGenerate} disabled={generating || techs.length === 0} className="w-full">
            {generating ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />
                Writing ideas…
              </>
            ) : (
              'Generate 3 ideas'
            )}
          </Action>
          <p className="mt-2 hidden text-center text-xs text-muted lg:block">
            {techs.length === 0 ? 'Add at least one technology to start' : `For ${techCount(techs.length)}`}
          </p>
        </div>
      </Card>
    </section>
  );
}
