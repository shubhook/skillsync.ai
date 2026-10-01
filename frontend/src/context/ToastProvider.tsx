import { ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { newId } from '../lib/bookmarks';
import { ToastContext, ToastOptions } from './ToastContext';
import { CloseIcon } from '../components/icons';
import Action from '../components/ui/Action';

const TOAST_DURATION_MS = 5000;
const MAX_TOASTS = 3;

interface Toast extends ToastOptions {
  id: string;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef(new Map<string, number>());

  const dismiss = useCallback((id: string) => {
    window.clearTimeout(timers.current.get(id));
    timers.current.delete(id);
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((options: ToastOptions) => {
    const id = newId();
    setToasts((prev) => [...prev, { ...options, id }].slice(-MAX_TOASTS));
    timers.current.set(id, window.setTimeout(() => dismiss(id), TOAST_DURATION_MS));
  }, [dismiss]);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((timer) => window.clearTimeout(timer));
  }, []);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Sits above the mobile Generate bar. */}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-28 z-[60] flex flex-col items-center gap-2 px-4 lg:bottom-6 lg:items-end lg:px-6"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-mid border px-4 py-3 text-sm shadow-card animate-toast-in ${
              t.tone === 'error' ? 'border-danger/40 bg-surface text-danger' : 'border-border-strong bg-surface text-fg'
            }`}
          >
            <span className="flex-1">{t.message}</span>
            {t.action && (
              <Action
                variant="ghost"
                onClick={() => {
                  t.action?.onClick();
                  dismiss(t.id);
                }}
              >
                {t.action.label}
              </Action>
            )}
            <Action variant="icon" onClick={() => dismiss(t.id)} aria-label="Dismiss notification">
              <CloseIcon className="h-4 w-4" />
            </Action>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
