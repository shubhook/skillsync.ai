import type { Difficulty } from '../types';

// 1 to 3, used by the difficulty meter.
export const difficultyLevel = (difficulty: Difficulty): 1 | 2 | 3 =>
  difficulty === 'Beginner' ? 1 : difficulty === 'Advanced' ? 3 : 2;
