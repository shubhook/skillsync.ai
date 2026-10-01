import { describe, expect, it } from 'vitest';
import { readUrlState, writeUrlState } from './urlState';

describe('urlState', () => {
  it('round-trips stack and preferences', () => {
    const state = {
      stack: ['React.js', 'C/C++', 'Ruby on Rails'],
      preferences: { level: 'Beginner' as const, timeBudget: 'weeks' as const, goal: 'learning' as const, interests: ['Health', 'Dev tools'] },
    };
    expect(readUrlState(writeUrlState(state))).toEqual(state);
  });

  it('writes nothing for an empty state', () => {
    expect(writeUrlState({ stack: [], preferences: { interests: [] } })).toBe('');
  });

  it('ignores unknown values and caps interests', () => {
    const state = readUrlState('?level=Expert&time=forever&goal=fun&interests=Health,Nope,Games,Music,Travel');
    expect(state.preferences).toEqual({ level: undefined, timeBudget: undefined, goal: undefined, interests: ['Health', 'Games', 'Music'] });
  });
});
