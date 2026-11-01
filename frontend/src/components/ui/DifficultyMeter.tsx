import { difficultyLevel } from '../../lib/difficulty';
import type { Difficulty } from '../../types';

// The SkillSync signature: difficulty as three bars, filled up to the level.
// Used on idea cards and bookmarks only. The word next to it carries the meaning.
export default function DifficultyMeter({ difficulty }: { difficulty: Difficulty }) {
  const level = difficultyLevel(difficulty);
  return (
    <span className="inline-flex items-end gap-0.5" aria-hidden="true">
      {[1, 2, 3].map((step) => (
        <span
          key={step}
          className={`w-[3px] rounded-[1px] ${step <= level ? 'bg-fg' : 'bg-border-strong'}`}
          style={{ height: 6 + step * 2 }}
        />
      ))}
    </span>
  );
}
