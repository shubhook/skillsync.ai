import { GOAL_OPTIONS, INTERESTS, LEVEL_OPTIONS, MAX_INTERESTS, TIME_OPTIONS } from '../data/catalog';
import type { Preferences } from '../types';

// The stack and preferences live in the query string so a refresh keeps them
// and a link shares them, e.g. ?stack=React.js,PostgreSQL&level=Beginner

export interface UrlState {
  stack: string[];
  preferences: Preferences;
}

const list = (value: string | null) => (value ? value.split(',').map((s) => s.trim()).filter(Boolean) : []);

function oneOf<T extends string>(value: string | null, options: { value: T }[]): T | undefined {
  return options.find((o) => o.value === value)?.value;
}

export function readUrlState(search: string): UrlState {
  const params = new URLSearchParams(search);
  return {
    stack: list(params.get('stack')),
    preferences: {
      level: oneOf(params.get('level'), LEVEL_OPTIONS),
      timeBudget: oneOf(params.get('time'), TIME_OPTIONS),
      goal: oneOf(params.get('goal'), GOAL_OPTIONS),
      interests: list(params.get('interests')).filter((i) => INTERESTS.includes(i)).slice(0, MAX_INTERESTS),
    },
  };
}

// Returns "?..." or "" when there is nothing to store.
export function writeUrlState({ stack, preferences }: UrlState): string {
  const params = new URLSearchParams();
  if (stack.length) params.set('stack', stack.join(','));
  if (preferences.level) params.set('level', preferences.level);
  if (preferences.timeBudget) params.set('time', preferences.timeBudget);
  if (preferences.goal) params.set('goal', preferences.goal);
  if (preferences.interests.length) params.set('interests', preferences.interests.join(','));
  const query = params.toString();
  return query ? `?${query}` : '';
}
