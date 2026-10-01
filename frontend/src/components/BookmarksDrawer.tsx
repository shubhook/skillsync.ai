import { KeyboardEvent, useEffect, useRef, useState } from 'react';
import { useBookmarks } from '../context/BookmarksContext';
import { useToast } from '../context/ToastContext';
import { STATUS_OPTIONS } from '../data/catalog';
import { bookmarksToMarkdown, downloadText } from '../lib/markdown';
import type { BookmarkStatus } from '../types';
import ProjectCard from './ProjectCard';
import { BookmarkIcon, CloseIcon, DownloadIcon } from './icons';

interface BookmarksDrawerProps {
  open: boolean;
  onClose: () => void;
}

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function BookmarksDrawer({ open, onClose }: BookmarksDrawerProps) {
  const { bookmarks, removeBookmark, restoreBookmarks, setStatus, clearAllBookmarks } = useBookmarks();
  const toast = useToast();
  const panelRef = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState<BookmarkStatus | 'all'>('all');

  // Lock page scroll, focus the panel, and give focus back to the opener on close.
  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement as HTMLElement | null;
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    panelRef.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus();
    return () => {
      document.body.style.overflow = overflow;
      opener?.focus();
    };
  }, [open]);

  if (!open) return null;

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      onClose();
      return;
    }
    if (e.key !== 'Tab' || !panelRef.current) return;
    // Keep Tab focus inside the dialog.
    const items = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => !el.closest('[hidden]'));
    if (items.length === 0) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  const visible = filter === 'all' ? bookmarks : bookmarks.filter((b) => b.status === filter);
  const count = (status: BookmarkStatus) => bookmarks.filter((b) => b.status === status).length;

  const clearAll = () => {
    const previous = bookmarks;
    clearAllBookmarks();
    toast({ message: `Removed ${previous.length} bookmarks`, action: { label: 'Undo', onClick: () => restoreBookmarks(previous) } });
  };

  const remove = (id: string) => {
    const removed = bookmarks.find((b) => b.id === id);
    removeBookmark(id);
    if (removed) toast({ message: 'Removed from bookmarks', action: { label: 'Undo', onClick: () => restoreBookmarks([removed]) } });
  };

  const exportMarkdown = () => {
    downloadText('skillsync-projects.md', bookmarksToMarkdown(bookmarks));
    toast({ message: 'Downloaded skillsync-projects.md' });
  };

  const filters: { value: BookmarkStatus | 'all'; label: string; count: number }[] = [
    { value: 'all', label: 'All', count: bookmarks.length },
    ...STATUS_OPTIONS.map((o) => ({ value: o.value, label: o.label, count: count(o.value) })),
  ];

  return (
    <div className="fixed inset-0 z-50" onKeyDown={onKeyDown}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="bookmarks-title"
        className="absolute inset-y-0 right-0 flex w-full max-w-xl flex-col border-l border-border bg-bg shadow-2xl animate-slide-in"
      >
        <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
          <div>
            <h2 id="bookmarks-title" className="text-lg font-semibold text-fg">Bookmarks</h2>
            <p className="text-sm text-muted">
              {bookmarks.length} {bookmarks.length === 1 ? 'project' : 'projects'} saved
            </p>
          </div>
          <div className="flex items-center gap-1">
            {bookmarks.length > 0 && (
              <>
                <button type="button" onClick={exportMarkdown} className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted hover:bg-surface-2 hover:text-fg">
                  <DownloadIcon className="h-3.5 w-3.5" /> Export
                </button>
                <button type="button" onClick={clearAll} className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted hover:bg-surface-2 hover:text-danger">
                  Clear all
                </button>
              </>
            )}
            <button type="button" onClick={onClose} aria-label="Close bookmarks" className="rounded-lg p-2 text-muted hover:bg-surface-2 hover:text-fg">
              <CloseIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {bookmarks.length > 0 && (
          <div className="flex gap-1 overflow-x-auto border-b border-border px-5 py-2" role="group" aria-label="Filter by status">
            {filters.map((f) => (
              <button
                key={f.value}
                type="button"
                aria-pressed={filter === f.value}
                onClick={() => setFilter(f.value)}
                className={`flex-none rounded-lg px-3 py-1.5 text-xs font-medium ${
                  filter === f.value ? 'bg-surface-2 text-fg' : 'text-muted hover:text-fg'
                }`}
              >
                {f.label} <span className="text-faint">{f.count}</span>
              </button>
            ))}
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-5">
          {bookmarks.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <BookmarkIcon className="mb-4 h-12 w-12 text-faint" />
              <h3 className="mb-1 font-semibold text-fg">No bookmarks yet</h3>
              <p className="max-w-xs text-sm text-muted">Save ideas you like and track them here as you build.</p>
            </div>
          ) : visible.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted">Nothing marked as {STATUS_OPTIONS.find((o) => o.value === filter)?.label.toLowerCase()} yet.</p>
          ) : (
            <div className="space-y-4">
              {visible.map((bookmark) => (
                <ProjectCard
                  key={bookmark.id}
                  mode="bookmark"
                  project={bookmark}
                  onStatusChange={(status) => setStatus(bookmark.id, status)}
                  onRemove={() => remove(bookmark.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
