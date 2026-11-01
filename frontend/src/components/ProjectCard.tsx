import { useId, useState } from 'react';
import { useBookmarks } from '../context/BookmarksContext';
import { useToast } from '../context/ToastContext';
import { STATUS_OPTIONS } from '../data/catalog';
import { projectToMarkdown } from '../lib/markdown';
import { isSafeUrl } from '../lib/url';
import type { BookmarkedProject, BookmarkStatus, Project, RefineDirection, ResultProject } from '../types';
import Action from './ui/Action';
import Card from './ui/Card';
import DifficultyMeter from './ui/DifficultyMeter';
import Menu from './ui/Menu';
import Segmented from './ui/Segmented';
import {
  ArrowDownIcon, ArrowUpIcon, ArrowUpRightIcon, BookmarkIcon, ChevronDownIcon, CopyIcon, CornerDownRightIcon, LayersIcon, SlidersIcon, TrashIcon,
} from './icons';

const DIRECTION_LABELS: Record<RefineDirection, string> = {
  similar: 'Like',
  easier: 'Easier version of',
  harder: 'Harder version of',
};

type ProjectCardProps =
  | { mode: 'result'; project: ResultProject; refining?: RefineDirection; onRefine: (direction: RefineDirection) => void }
  | { mode: 'bookmark'; project: BookmarkedProject; onStatusChange: (status: BookmarkStatus) => void; onRemove: () => void }
  | { mode: 'sample'; project: Project };

// A project brief: what it takes (difficulty, time), what it is, what it's built with.
// Details hold what you'll learn, resources, and the README copy.
export default function ProjectCard(props: ProjectCardProps) {
  const { project, mode } = props;
  const detailsId = useId();
  const [expanded, setExpanded] = useState(false);
  const { isBookmarked, toggleBookmark, restoreBookmarks } = useBookmarks();
  const toast = useToast();
  const saved = isBookmarked(project);

  const variationOf = mode === 'result' ? props.project.variationOf : undefined;
  const refining = mode === 'result' ? props.refining : undefined;
  const starter = project.resources.find((r) => isSafeUrl(r.url));

  const copyMarkdown = async () => {
    try {
      await navigator.clipboard.writeText(projectToMarkdown(project));
      toast({ message: 'Copied as Markdown, ready to paste into a README' });
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
    <Card density={mode === 'bookmark' ? 'compact' : 'default'}>
      <div className="flex items-center justify-between gap-3">
        <p className="flex min-w-0 items-center gap-1.5 text-[13px] text-muted">
          <DifficultyMeter difficulty={project.difficulty} />
          <span className="ml-0.5 text-fg">{project.difficulty}</span>
          {[project.estimatedTime, mode === 'sample' && 'Example'].filter(Boolean).map((part) => (
            <span key={String(part)} className="flex min-w-0 items-center gap-1.5">
              <span className="text-faint" aria-hidden="true">·</span>
              <span className="truncate">{part}</span>
            </span>
          ))}
        </p>
        {mode === 'result' && (
          <Action
            variant="icon"
            onClick={toggleSave}
            aria-pressed={saved}
            aria-label={saved ? `Remove ${project.title} from bookmarks` : `Save ${project.title} to bookmarks`}
            title={saved ? 'Saved' : 'Save'}
            className="-my-1 -mr-2"
          >
            <BookmarkIcon className="h-4 w-4" filled={saved} />
          </Action>
        )}
        {mode === 'bookmark' && (
          <Action variant="icon" onClick={props.onRemove} aria-label={`Remove ${project.title} from bookmarks`} title="Remove" className="-my-1 -mr-2">
            <TrashIcon className="h-4 w-4" />
          </Action>
        )}
      </div>

      <h3 className={`mt-2 font-medium leading-snug text-fg ${mode === 'bookmark' ? 'text-base' : 'text-[17px]'}`}>{project.title}</h3>

      {variationOf && (
        <p className="mt-1 flex items-center gap-1 text-xs text-muted">
          <CornerDownRightIcon className="h-3.5 w-3.5 flex-none text-faint" />
          <span className="truncate">{DIRECTION_LABELS[variationOf.direction]} "{variationOf.title}"</span>
        </p>
      )}

      <p className={`mt-2 text-sm leading-relaxed text-muted ${expanded ? '' : 'line-clamp-3'}`}>{project.description}</p>

      {project.techStack.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-x-3 gap-y-1 font-mono text-xs text-muted" aria-label="Tech stack">
          {project.techStack.map((tech, i) => <li key={i}>{tech}</li>)}
        </ul>
      )}

      <div id={detailsId} hidden={!expanded} className="mt-4 space-y-5 border-t border-border pt-4">
        {project.learningOutcomes.length > 0 && (
          <div>
            <h4 className="mb-2 text-[13px] font-medium text-fg">What you'll learn</h4>
            <ul className="space-y-1.5">
              {project.learningOutcomes.map((outcome, i) => (
                <li key={i} className="flex gap-2.5 text-sm text-muted">
                  <span className="mt-2 h-1 w-1 flex-none rounded-full bg-faint" aria-hidden="true" />
                  {outcome}
                </li>
              ))}
            </ul>
          </div>
        )}
        {project.resources.length > 0 && (
          <div>
            <h4 className="mb-2 text-[13px] font-medium text-fg">Resources</h4>
            <ul className="divide-y divide-border rounded-mid border border-border">
              {project.resources.map((resource, i) => (
                <li key={i} className="flex items-center justify-between gap-3 px-3 py-2.5">
                  <div className="min-w-0">
                    <p className="break-words text-sm leading-snug text-fg">{resource.name}</p>
                    <p className="text-xs text-faint">{resource.type}</p>
                  </div>
                  {isSafeUrl(resource.url) ? (
                    <Action as="a" variant="link" href={resource.url} target="_blank" rel="noopener noreferrer" className="shrink-0">
                      Open <ArrowUpRightIcon className="h-3.5 w-3.5" />
                      <span className="sr-only"> {resource.name} (opens in a new tab)</span>
                    </Action>
                  ) : (
                    <span className="shrink-0 text-xs text-faint">No link</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
        {mode !== 'sample' && (
          <Action variant="ghost" onClick={copyMarkdown}>
            <CopyIcon className="h-4 w-4 text-muted" /> Copy as README
          </Action>
        )}
      </div>

      <div className="mt-4 flex min-w-0 flex-wrap items-center gap-2">
        {mode === 'bookmark' && (
          <div className="min-w-0 max-w-full flex-1 basis-60">
            <Segmented
              label={`Status of ${project.title}`}
              hideLabel
              includeAny={false}
              options={STATUS_OPTIONS}
              value={props.project.status}
              onChange={(status) => status && props.onStatusChange(status)}
            />
          </div>
        )}

        <Action variant="ghost" onClick={() => setExpanded((e) => !e)} aria-expanded={expanded} aria-controls={detailsId}>
          {expanded ? 'Hide details' : 'Details'}
          <ChevronDownIcon className={`h-4 w-4 text-muted transition-transform duration-200 ease-out-soft ${expanded ? 'rotate-180' : ''}`} />
        </Action>

        {mode === 'result' && (
          <Menu
            disabled={!!refining}
            trigger={<><SlidersIcon className="h-4 w-4 text-muted" /> Adjust</>}
            items={[
              { label: 'More like this', icon: <LayersIcon className="h-4 w-4" />, onSelect: () => props.onRefine('similar') },
              { label: 'Easier version', icon: <ArrowDownIcon className="h-4 w-4" />, onSelect: () => props.onRefine('easier'), disabled: project.difficulty === 'Beginner' },
              { label: 'Harder version', icon: <ArrowUpIcon className="h-4 w-4" />, onSelect: () => props.onRefine('harder') },
            ]}
          />
        )}

        {starter && mode !== 'bookmark' && (
          <Action as="a" variant="link" href={starter.url} target="_blank" rel="noopener noreferrer" className="ml-auto">
            Starter docs <ArrowUpRightIcon className="h-3.5 w-3.5" />
            <span className="sr-only"> for {project.title}: {starter.name} (opens in a new tab)</span>
          </Action>
        )}
      </div>

      {refining && (
        <p role="status" className="mt-3 flex items-center gap-2 text-[13px] text-muted">
          <span className="h-3 w-3 animate-spin rounded-full border-[1.5px] border-current border-t-transparent" aria-hidden="true" />
          Writing {refining === 'similar' ? 'a similar idea' : `an ${refining} version`}…
        </p>
      )}
    </Card>
  );
}

export function SkeletonCard() {
  const bar = 'rounded-[4px] bg-[linear-gradient(90deg,rgb(var(--c-surface-2))_0%,rgb(var(--c-border))_50%,rgb(var(--c-surface-2))_100%)] bg-[length:200%_100%] animate-shimmer';
  return (
    <Card as="div" aria-hidden="true">
      <div className={`h-3 w-32 ${bar}`} />
      <div className={`mt-4 h-5 w-3/4 ${bar}`} />
      <div className={`mt-3 h-3 w-full ${bar}`} />
      <div className={`mt-2 h-3 w-5/6 ${bar}`} />
      <div className={`mt-4 h-3 w-48 ${bar}`} />
    </Card>
  );
}
