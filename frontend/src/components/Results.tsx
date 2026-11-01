import { forwardRef, KeyboardEvent, useEffect, useRef, useState } from 'react';
import { SAMPLE_PROJECT } from '../data/catalog';
import type { PendingBatch } from '../hooks/useGenerator';
import type { Batch, RefineDirection, ResultProject } from '../types';
import ProjectCard, { SkeletonCard } from './ProjectCard';
import Action from './ui/Action';
import { AlertIcon, CloseIcon, RefreshIcon } from './icons';

interface ResultsProps {
  batches: Batch[];
  activeBatchId: string | null;
  pending: PendingBatch | null;
  refining: Record<string, RefineDirection>;
  error: string | null;
  completedCount: number;
  onSelectBatch: (id: string) => void;
  onRefine: (batchId: string, project: ResultProject, direction: RefineDirection) => void;
  onRetry: () => void;
  onDismissError: () => void;
  onClear: () => void;
}

function useElapsedSeconds(startedAt: number | undefined) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!startedAt) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [startedAt]);
  return startedAt ? Math.max(0, Math.round((now - startedAt) / 1000)) : 0;
}

const batchLabel = (batch: Batch) => batch.techs.slice(0, 3).map((t) => t.name).join(', ') + (batch.techs.length > 3 ? '…' : '');

// Right column. The heading is focusable so the page can move focus here after generating.
const Results = forwardRef<HTMLHeadingElement, ResultsProps>(function Results(
  { batches, activeBatchId, pending, refining, error, completedCount, onSelectBatch, onRefine, onRetry, onDismissError, onClear },
  headingRef,
) {
  const elapsed = useElapsedSeconds(pending?.startedAt);
  const tablistRef = useRef<HTMLDivElement>(null);
  const activeIndex = batches.findIndex((b) => b.id === activeBatchId);
  const activeBatch = pending ? null : batches[activeIndex] ?? batches.at(-1) ?? null;
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    if (completedCount > 0) setAnnouncement(`${batches.at(-1)?.projects.length ?? 0} new ideas ready.`);
    // Only announce when a batch finishes, not when tabs change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completedCount]);

  const onTabKeyDown = (e: KeyboardEvent, index: number) => {
    const step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const next = (index + step + batches.length) % batches.length;
    onSelectBatch(batches[next].id);
    tablistRef.current?.querySelectorAll<HTMLElement>('[role="tab"]')[next]?.focus();
  };

  const isEmpty = batches.length === 0 && !pending;

  return (
    <section aria-labelledby="results-heading" className="min-w-0 animate-rise [animation-delay:60ms]">
      <div className="mb-1 flex min-h-8 flex-wrap items-center justify-between gap-3">
        <h2 id="results-heading" ref={headingRef} tabIndex={-1} className="text-[17px] font-medium text-fg focus:outline-none">
          {isEmpty ? 'What you get' : 'Ideas'}
        </h2>
        {batches.length > 0 && !pending && (
          <Action variant="ghost" onClick={onClear}>Clear history</Action>
        )}
      </div>

      <p className="sr-only" aria-live="polite">{announcement}</p>

      {(batches.length > 1 || (pending && batches.length > 0)) && (
        <div ref={tablistRef} role="tablist" aria-label="Batches" className="-mx-1 mb-3 mt-3 flex gap-2 overflow-x-auto p-1">
          {batches.map((batch, i) => {
            const selected = !pending && batch.id === activeBatch?.id;
            return (
              <Action
                key={batch.id}
                variant="ghost"
                role="tab"
                id={`tab-${batch.id}`}
                aria-selected={selected}
                aria-controls="batch-panel"
                tabIndex={selected ? 0 : -1}
                disabled={!!pending}
                onClick={() => onSelectBatch(batch.id)}
                onKeyDown={(e) => onTabKeyDown(e, i)}
                title={batchLabel(batch)}
                className="flex-none"
              >
                Batch {i + 1}
              </Action>
            );
          })}
          {pending && (
            <Action as="span" variant="ghost" role="tab" aria-selected="true" aria-controls="batch-panel" className="flex-none">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" aria-hidden="true" />
              Batch {batches.length + 1}
            </Action>
          )}
        </div>
      )}

      {error && (
        <div role="alert" className="mb-4 mt-3 flex items-center gap-3 rounded-mid border border-danger/30 bg-danger/5 py-2 pl-3 pr-2 text-sm">
          <AlertIcon className="h-4 w-4 flex-none text-danger" />
          <p className="flex-1 text-fg">{error}</p>
          <Action variant="ghost" onClick={onRetry} className="flex-none">
            <RefreshIcon className="h-4 w-4 text-muted" /> Retry
          </Action>
          <Action variant="icon" onClick={onDismissError} aria-label="Dismiss error">
            <CloseIcon className="h-4 w-4" />
          </Action>
        </div>
      )}

      <div id="batch-panel" role={batches.length > 1 || pending ? 'tabpanel' : undefined} aria-labelledby={activeBatch && batches.length > 1 ? `tab-${activeBatch.id}` : undefined} className="space-y-4">
        {pending && (
          <>
            <p role="status" className="flex items-center gap-2 text-[13px] text-muted">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" aria-hidden="true" />
              Writing {pending.count} ideas
              <span className="font-mono text-xs tabular-nums text-faint">{elapsed}s</span>
            </p>
            {Array.from({ length: pending.count }, (_, i) => <SkeletonCard key={i} />)}
          </>
        )}

        {activeBatch && (
          <>
            <p className="text-[13px] text-muted">
              For {activeBatch.techs.map((t) => t.name).join(', ')}
              {activeBatch.preferences.level && ` · ${activeBatch.preferences.level}`}
              {activeBatch.preferences.interests.length > 0 && ` · ${activeBatch.preferences.interests.join(', ')}`}
              <span className="text-faint"> · Written by Gemini. Check the details before you start.</span>
            </p>
            {activeBatch.projects.map((project) => (
              <ProjectCard
                key={project.id}
                mode="result"
                project={project}
                refining={refining[project.id]}
                onRefine={(direction) => onRefine(activeBatch.id, project, direction)}
              />
            ))}
          </>
        )}

        {isEmpty && (
          <>
            <p className="text-[13px] text-muted">
              Add a few technologies and generate. Gemini writes three ideas like this one, with what you'll learn and links to start.
            </p>
            <ProjectCard mode="sample" project={SAMPLE_PROJECT} />
          </>
        )}
      </div>
    </section>
  );
});

export default Results;
