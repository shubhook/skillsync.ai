import type { BadgeTone } from '../components/ui/Badge';
import type { Difficulty } from '../types';

export const difficultyTone = (difficulty: Difficulty): BadgeTone =>
  difficulty === 'Beginner' ? 'beginner' : difficulty === 'Advanced' ? 'advanced' : 'intermediate';
