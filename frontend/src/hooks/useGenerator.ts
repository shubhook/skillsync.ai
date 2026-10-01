import { useCallback, useEffect, useState } from 'react';
import { generateProjects, GenerateError } from '../lib/api';
import { newId } from '../lib/bookmarks';
import type { Batch, Preferences, Project, RefineDirection, ResultProject, Tech } from '../types';

const SESSION_KEY = 'skillsync_batches';
const MAX_BATCHES = 10;
const MAX_EXCLUDED_TITLES = 30;

// Batches survive a refresh but not a new tab, so old ideas don't pile up forever.
function loadBatches(): Batch[] {
  try {
    const parsed: unknown = JSON.parse(sessionStorage.getItem(SESSION_KEY) ?? '[]');
    return Array.isArray(parsed)
      ? parsed.filter((b): b is Batch => typeof b?.id === 'string' && Array.isArray(b?.projects) && Array.isArray(b?.techs))
      : [];
  } catch {
    return [];
  }
}

const withIds = (projects: Project[]): ResultProject[] => projects.map((p) => ({ ...p, id: newId() }));

const errorMessage = (err: unknown) =>
  err instanceof GenerateError ? err.message : 'Something went wrong. Please try again.';

export interface PendingBatch {
  startedAt: number;
  count: number;
}

export function useGenerator() {
  const [batches, setBatches] = useState<Batch[]>(loadBatches);
  const [activeBatchId, setActiveBatchId] = useState<string | null>(() => batches.at(-1)?.id ?? null);
  const [pending, setPending] = useState<PendingBatch | null>(null);
  // Project id -> direction for cards with a refinement in flight.
  const [refining, setRefining] = useState<Record<string, RefineDirection>>({});
  const [error, setError] = useState<string | null>(null);
  // Bumped after each finished batch so the results area can announce it and move focus.
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(batches));
    } catch {
      // Session storage full or blocked; results still work for this page view.
    }
  }, [batches]);

  // Titles the user has seen, newest first, so the model avoids repeats.
  const seenTitles = useCallback(
    () => batches.flatMap((b) => b.projects.map((p) => p.title)).reverse().slice(0, MAX_EXCLUDED_TITLES),
    [batches],
  );

  const generate = useCallback(async (techs: Tech[], preferences: Preferences) => {
    if (pending || techs.length === 0) return;
    setPending({ startedAt: Date.now(), count: 3 });
    setError(null);
    try {
      const projects = await generateProjects({ techs, preferences, exclude: seenTitles() });
      const batch: Batch = { id: newId(), createdAt: Date.now(), techs, preferences, projects: withIds(projects) };
      // Keep earlier batches. The newest one becomes the active tab.
      setBatches((prev) => [...prev, batch].slice(-MAX_BATCHES));
      setActiveBatchId(batch.id);
      setCompletedCount((n) => n + 1);
    } catch (err) {
      setError(errorMessage(err));
      console.error(err);
    } finally {
      setPending(null);
    }
  }, [pending, seenTitles]);

  const refine = useCallback(async (batchId: string, project: ResultProject, direction: RefineDirection) => {
    const batch = batches.find((b) => b.id === batchId);
    if (!batch || refining[project.id]) return;
    setRefining((prev) => ({ ...prev, [project.id]: direction }));
    setError(null);
    try {
      const [variation] = await generateProjects({
        techs: batch.techs,
        preferences: batch.preferences,
        exclude: seenTitles(),
        refine: { direction, project: { title: project.title, description: project.description, difficulty: project.difficulty } },
      });
      if (!variation) throw new GenerateError('The AI returned no project. Please try again.');
      const result: ResultProject = { ...variation, id: newId(), variationOf: { title: project.title, direction } };
      // Insert right after the card it came from; never replace the original.
      setBatches((prev) => prev.map((b) => {
        if (b.id !== batchId) return b;
        const index = b.projects.findIndex((p) => p.id === project.id);
        const projects = [...b.projects];
        projects.splice(index + 1, 0, result);
        return { ...b, projects };
      }));
    } catch (err) {
      setError(errorMessage(err));
      console.error(err);
    } finally {
      setRefining((prev) => {
        const next = { ...prev };
        delete next[project.id];
        return next;
      });
    }
  }, [batches, refining, seenTitles]);

  const clearBatches = useCallback(() => {
    const previous = { batches, activeBatchId };
    setBatches([]);
    setActiveBatchId(null);
    setError(null);
    return previous;
  }, [batches, activeBatchId]);

  const restoreBatches = useCallback((previous: { batches: Batch[]; activeBatchId: string | null }) => {
    setBatches(previous.batches);
    setActiveBatchId(previous.activeBatchId);
  }, []);

  return {
    batches,
    activeBatchId,
    setActiveBatchId,
    pending,
    refining,
    error,
    dismissError: () => setError(null),
    completedCount,
    generate,
    refine,
    clearBatches,
    restoreBatches,
  };
}
