import { ReactNode, useId, useState } from 'react';
import { useBookmarks } from '../context/BookmarksContext';
import { useToast } from '../context/ToastContext';
import { STATUS_OPTIONS } from '../data/catalog';
import { projectToMarkdown } from '../lib/markdown';
import { isSafeUrl } from '../lib/url';
import type { BookmarkedProject, BookmarkStatus, Difficulty, Project, RefineDirection, ResultProject } from '../types';
import {
  ArrowDownIcon, ArrowUpIcon, BookmarkIcon, ChevronDownIcon, ClockIcon, CopyIcon, ExternalLinkIcon, SparkIcon, TrashIcon,
} from './icons';

const DIFFICULTY_STYLES: Record<Difficulty, string> = {
  Beginner: 'text-beginner border-beginner/40 bg-beginner/10',
  Intermediate: 'text-intermediate border-intermediate/40 bg-intermediate/10',
  Advanced: 'text-advanced border-advanced/40 bg-advanced/10',
};

const DIRECTION_LABELS: Record<RefineDirection, string> = {
  similar: 'More like',
  easier: 'Easier version of',
  harder: 'Harder version of',
};

type ProjectCardProps =
  | { mode: 'result'; project: ResultProject; refining?: RefineDirection; onRefine: (direction: RefineDirection) => void }
  | { mode: 'bookmark'; project: BookmarkedProject; onStatusChange: (status: BookmarkStatus) => void; onRemove: () => void }
  | { mode: 'sample'; project: Project };

function ActionButton({ children, onClick, disabled, pressed, label }: {
  children: ReactNode; onClick: () => void; disabled?: boolean; pressed?: boolean; label?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={pressed}
      aria-label={label}
      className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
        pressed ? 'border-accent bg-accent/10 text-accent' : 'border-border-strong text-muted hover:border-faint hover:text-fg'
      }`}
    >
      {children}
    </button>
  );
}

export default function ProjectCard(props: ProjectCardProps) {
  const { project, mode } = props;
  const detailsId = useId();
  const [expanded, setExpanded] = useState(false);
  const { isBookmarked, toggleBookmark, restoreBookmarks } = useBookmarks();
  const toast = useToast();
  const saved = isBookmarked(project);

  const copyMarkdown = async () => {
    try {
      await navigator.clipboard.writeText(projectToMarkdown(project));
      toast({ message: 'Copied as Markdown. Paste it into a README.' });
    } catch {
      toast({ message: 'Could not copy. Your browser blocked clipboard access.', tone: 'error' });
    }
  };

  const toggleSave = () => {
    const removed = toggleBookmark(project);
    if (removed) {
      toast({ message: 'Removed from bookmarks', action: { label: 'Undo', onClick: () => restoreBookmarks([removed]) } });
    } else {
      toast({ message: 'Saved to bookmarks', action: { label: 'Undo', onClick: () => toggleBookmark(project) } });
    }
  };

  const variationOf = mode === 'result' ? props.project.variationOf : undefined;
  const refining = mode === 'result' ? props.refining : undefined;

  return (
    <article className={`rounded-2xl border bg-surface p-4 transition-colors sm:p-5 ${variationOf ? 'border-accent/40' : 'border-border'}`}>
      {variationOf && (
        <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-accent">
          <SparkIcon className="h-3.5 w-3.5" />
          {DIRECTION_LABELS[variationOf.direction]} "{variationOf.title}"
        </p>
      )}

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
        <span className={`rounded-full border px-2 py-0.5 font-semibold ${DIFFICULTY_STYLES[project.difficulty]}`}>{project.difficulty}</span>
        {project.estimatedTime && (
          <span className="inline-flex items-center gap-1">
            <ClockIcon className="h-3.5 w-3.5" />
            {project.estimatedTime}
          </span>
        )}
        {mode === 'sample' && <span className="rounded-full bg-surface-2 px-2 py-0.5 font-medium">Sample</span>}
      </div>

      <h3 className="mt-2 text-base font-semibold leading-snug text-fg sm:text-lg">{project.title}</h3>
      <p className={`mt-1.5 text-sm leading-relaxed text-muted ${expanded ? '' : 'line-clamp-3'}`}>{project.description}</p>

      {project.techStack.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Tech stack">
          {project.techStack.map((tech, i) => (
            <li key={i} className="rounded-md border border-border bg-surface-2 px-2 py-0.5 font-mono text-[11px] text-muted">{tech}</li>
          ))}
        </ul>
      )}

      <div id={detailsId} hidden={!expanded} className="mt-4 space-y-4 border-t border-border pt-4">
          {project.learningOutcomes.length > 0 && (
            <div>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">What you'll learn</h4>
              <ul className="space-y-1.5">
                {project.learningOutcomes.map((outcome, i) => (
                  <li key={i} className="flex gap-2 text-sm text-fg">
                    <span className="mt-2 h-1 w-1 flex-none rounded-full bg-accent" aria-hidden="true" />
                    {outcome}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {project.resources.length > 0 && (
            <div>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Resources</h4>
              <ul className="grid gap-2">
                {project.resources.map((resource, i) => (
                  <li key={i} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface-2 px-3 py-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-fg">{resource.name}</p>
                      <p className="text-xs text-muted">{resource.type}</p>
                    </div>
                    {isSafeUrl(resource.url) ? (
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex flex-none items-center gap-1 rounded-md border border-border-strong px-2.5 py-1 text-xs font-medium text-muted hover:text-fg"
                      >
                        Open <ExternalLinkIcon className="h-3 w-3" />
                        <span className="sr-only">{resource.name} (opens in a new tab)</span>
                      </a>
                    ) : (
                      <span className="flex-none text-xs text-muted">No link</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-1.5 border-t border-border pt-3">
        {mode === 'result' && (
          <>
            <ActionButton onClick={toggleSave} pressed={saved}>
              <BookmarkIcon className="h-3.5 w-3.5" filled={saved} />
              {saved ? 'Saved' : 'Save'}
            </ActionButton>
            <ActionButton onClick={() => props.onRefine('similar')} disabled={!!refining}>
              <SparkIcon className="h-3.5 w-3.5" /> More like this
            </ActionButton>
            <ActionButton onClick={() => props.onRefine('easier')} disabled={!!refining || project.difficulty === 'Beginner'}>
              <ArrowDownIcon className="h-3.5 w-3.5" /> Easier
            </ActionButton>
            <ActionButton onClick={() => props.onRefine('harder')} disabled={!!refining}>
              <ArrowUpIcon className="h-3.5 w-3.5" /> Harder
            </ActionButton>
          </>
        )}

        {mode === 'bookmark' && (
          <div role="radiogroup" aria-label="Status" className="flex rounded-lg border border-border-strong p-0.5">
            {STATUS_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={props.project.status === option.value}
                onClick={() => props.onStatusChange(option.value)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium ${
                  props.project.status === option.value ? 'bg-accent/10 text-accent' : 'text-muted hover:text-fg'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}

        {mode !== 'sample' && (
          <ActionButton onClick={copyMarkdown} label="Copy as README (Markdown)">
            <CopyIcon className="h-3.5 w-3.5" /> README
          </ActionButton>
        )}
        {mode === 'bookmark' && (
          <ActionButton onClick={props.onRemove} label={`Remove ${project.title} from bookmarks`}>
            <TrashIcon className="h-3.5 w-3.5" />
          </ActionButton>
        )}

        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          aria-expanded={expanded}
          aria-controls={detailsId}
          className="ml-auto inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-muted hover:text-fg"
        >
          {expanded ? 'Less' : 'Details'}
          <ChevronDownIcon className={`h-3.5 w-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {refining && (
        <p role="status" className="mt-3 flex items-center gap-2 text-xs text-accent">
          <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />
          Writing {refining === 'similar' ? 'a similar idea' : `an ${refining} version`}…
        </p>
      )}
    </article>
  );
}

export function SkeletonCard() {
  const bar = 'rounded-md bg-[linear-gradient(90deg,rgb(var(--c-surface-2))_0%,rgb(var(--c-border))_50%,rgb(var(--c-surface-2))_100%)] bg-[length:200%_100%] animate-shimmer';
  return (
    <div className="rounded-2xl border border-border bg-surface p-5" aria-hidden="true">
      <div className={`h-4 w-24 ${bar}`} />
      <div className={`mt-3 h-5 w-3/4 ${bar}`} />
      <div className={`mt-3 h-3 w-full ${bar}`} />
      <div className={`mt-2 h-3 w-5/6 ${bar}`} />
      <div className="mt-4 flex gap-2">
        <div className={`h-5 w-16 ${bar}`} />
        <div className={`h-5 w-20 ${bar}`} />
        <div className={`h-5 w-14 ${bar}`} />
      </div>
    </div>
  );
}
