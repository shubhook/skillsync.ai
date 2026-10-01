import { useId, useState } from 'react';
import { useBookmarks } from '../context/BookmarksContext';
import { useToast } from '../context/ToastContext';
import { STATUS_OPTIONS } from '../data/catalog';
import { difficultyTone } from '../lib/difficulty';
import { projectToMarkdown } from '../lib/markdown';
import { isSafeUrl } from '../lib/url';
import type { BookmarkedProject, BookmarkStatus, Project, RefineDirection, ResultProject } from '../types';
import Action from './ui/Action';
import Badge from './ui/Badge';
import Card from './ui/Card';
import Segmented from './ui/Segmented';
import { ArrowDownIcon, ArrowUpIcon, BookmarkIcon, ChevronDownIcon, CopyIcon, SparkIcon, TrashIcon } from './icons';

const DIRECTION_LABELS: Record<RefineDirection, string> = {
  similar: 'More like',
  easier: 'Easier version of',
  harder: 'Harder version of',
};

type ProjectCardProps =
  | { mode: 'result'; project: ResultProject; featured?: boolean; refining?: RefineDirection; onRefine: (direction: RefineDirection) => void }
  | { mode: 'bookmark'; project: BookmarkedProject; onStatusChange: (status: BookmarkStatus) => void; onRemove: () => void }
  | { mode: 'sample'; project: Project };

// Density by context: results are default (the first in a batch is featured),
// bookmarks are compact, and the first-visit sample is featured.
export default function ProjectCard(props: ProjectCardProps) {
  const { project, mode } = props;
  const detailsId = useId();
  const [expanded, setExpanded] = useState(false);
  const { isBookmarked, toggleBookmark, restoreBookmarks } = useBookmarks();
  const toast = useToast();
  const saved = isBookmarked(project);

  const density = mode === 'bookmark' ? 'compact' : mode === 'sample' || (mode === 'result' && props.featured) ? 'featured' : 'default';
  const variationOf = mode === 'result' ? props.project.variationOf : undefined;
  const refining = mode === 'result' ? props.refining : undefined;
  const starter = project.resources.find((r) => isSafeUrl(r.url));

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

  return (
    <Card density={density}>
      {variationOf && (
        <p className="mb-2 flex items-center gap-1 text-xs font-medium text-accent">
          <SparkIcon className="h-3 w-3" />
          {DIRECTION_LABELS[variationOf.direction]} "{variationOf.title}"
        </p>
      )}

      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base font-semibold leading-snug tracking-tight text-fg sm:text-lg">{project.title}</h3>
        {mode === 'result' && (
          <Action
            variant="icon"
            onClick={toggleSave}
            aria-pressed={saved}
            aria-label={saved ? `Remove ${project.title} from bookmarks` : `Save ${project.title} to bookmarks`}
            title={saved ? 'Saved' : 'Save'}
          >
            <BookmarkIcon className="h-4 w-4" filled={saved} />
          </Action>
        )}
        {mode === 'bookmark' && (
          <Action variant="icon" onClick={props.onRemove} aria-label={`Remove ${project.title} from bookmarks`} title="Remove">
            <TrashIcon className="h-4 w-4" />
          </Action>
        )}
      </div>

      <p className={`mt-1 text-sm leading-relaxed text-muted ${expanded ? '' : 'line-clamp-3'}`}>{project.description}</p>

      <div className="mt-3 flex flex-wrap items-center gap-1">
        <Badge tone={difficultyTone(project.difficulty)}>{project.difficulty}</Badge>
        {project.estimatedTime && <Badge>{project.estimatedTime}</Badge>}
        {mode === 'sample' && <Badge>Sample</Badge>}
      </div>

      {project.techStack.length > 0 && (
        <ul className="mt-2 flex flex-wrap gap-1" aria-label="Tech stack">
          {project.techStack.map((tech, i) => (
            <li key={i}><Badge className="font-mono font-normal">{tech}</Badge></li>
          ))}
        </ul>
      )}

      <div id={detailsId} hidden={!expanded} className="mt-4 space-y-4 border-t border-border pt-4">
        {project.learningOutcomes.length > 0 && (
          <div>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">What you'll learn</h4>
            <ul className="space-y-2">
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
                <li key={i} className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 rounded-mid border border-border bg-surface-2 px-3 py-2">
                  <div className="min-w-0">
                    <p className="whitespace-normal break-words text-sm font-medium leading-snug text-fg">{resource.name}</p>
                    <p className="mt-0.5 text-xs text-muted">{resource.type}</p>
                  </div>
                  {isSafeUrl(resource.url) ? (
                    <Action as="a" variant="link" href={resource.url} target="_blank" rel="noopener noreferrer" className="mt-0.5 shrink-0">
                      Open<span className="sr-only"> {resource.name} (opens in a new tab)</span>
                    </Action>
                  ) : (
                    <span className="mt-0.5 shrink-0 text-xs text-muted">No link</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="mt-4 flex min-w-0 flex-wrap items-center gap-2 border-t border-border pt-3">
        {mode === 'result' && (
          <>
            <Action variant="ghost" onClick={() => props.onRefine('similar')} disabled={!!refining}>
              <SparkIcon className="h-3 w-3" /> More like this
            </Action>
            <Action variant="ghost" onClick={() => props.onRefine('easier')} disabled={!!refining || project.difficulty === 'Beginner'}>
              <ArrowDownIcon className="h-3 w-3" /> Easier
            </Action>
            <Action variant="ghost" onClick={() => props.onRefine('harder')} disabled={!!refining}>
              <ArrowUpIcon className="h-3 w-3" /> Harder
            </Action>
          </>
        )}

        {mode === 'bookmark' && (
          <div className="min-w-0 max-w-full flex-1 basis-[13.5rem]">
            <Segmented
              label={`Status of ${project.title}`}
              hideLabel
              size="sm"
              includeAny={false}
              options={STATUS_OPTIONS}
              value={props.project.status}
              onChange={(status) => status && props.onStatusChange(status)}
            />
          </div>
        )}

        {mode !== 'sample' && (
          <Action variant="ghost" onClick={copyMarkdown} aria-label="Copy as README (Markdown)">
            <CopyIcon className="h-3 w-3" /> README
          </Action>
        )}

        <Action variant="ghost" onClick={() => setExpanded((e) => !e)} aria-expanded={expanded} aria-controls={detailsId}>
          {expanded ? 'Less' : 'Details'}
          <ChevronDownIcon className={`h-3 w-3 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </Action>

        {starter && (
          <Action as="a" variant="link" href={starter.url} target="_blank" rel="noopener noreferrer" className="ml-auto">
            Starter docs<span className="sr-only"> for {project.title}: {starter.name} (opens in a new tab)</span>
          </Action>
        )}
      </div>

      {refining && (
        <p role="status" className="mt-3 flex items-center gap-2 text-xs text-accent">
          <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />
          Writing {refining === 'similar' ? 'a similar idea' : `an ${refining} version`}…
        </p>
      )}
    </Card>
  );
}

export function SkeletonCard() {
  const bar = 'rounded-tight bg-[linear-gradient(90deg,rgb(var(--c-surface-2))_0%,rgb(var(--c-border))_50%,rgb(var(--c-surface-2))_100%)] bg-[length:200%_100%] animate-shimmer';
  return (
    <Card as="div" aria-hidden="true">
      <div className={`h-5 w-3/4 ${bar}`} />
      <div className={`mt-3 h-3 w-full ${bar}`} />
      <div className={`mt-2 h-3 w-5/6 ${bar}`} />
      <div className="mt-4 flex gap-2">
        <div className={`h-5 w-20 ${bar}`} />
        <div className={`h-5 w-16 ${bar}`} />
      </div>
    </Card>
  );
}
