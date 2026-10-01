import { useEffect, useRef, useState } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import BuilderPanel from "./components/BuilderPanel";
import Results from "./components/Results";
import BookmarksDrawer from "./components/BookmarksDrawer";
import ErrorBoundary from "./components/ErrorBoundary";
import { BookmarksProvider } from "./context/BookmarksProvider";
import { ToastProvider } from "./context/ToastProvider";
import { useToast } from "./context/ToastContext";
import { useGenerator } from "./hooks/useGenerator";
import { techsFromNames } from "./lib/stack";
import { readUrlState, writeUrlState } from "./lib/urlState";
import type { Preferences, Tech } from "./types";

// Below the lg breakpoint the results sit under the builder, so we scroll to them.
const isSingleColumn = () => window.matchMedia("(max-width: 1023px)").matches;

function AppContent() {
  const [initial] = useState(() => readUrlState(window.location.search));
  const [techs, setTechs] = useState<Tech[]>(() => techsFromNames(initial.stack));
  const [preferences, setPreferences] = useState<Preferences>(initial.preferences);
  const [bookmarksOpen, setBookmarksOpen] = useState(false);
  const resultsHeadingRef = useRef<HTMLHeadingElement>(null);
  const generator = useGenerator();
  const toast = useToast();

  // Keep the stack and preferences in the URL so refresh and shared links restore them.
  useEffect(() => {
    const query = writeUrlState({ stack: techs.map((t) => t.name), preferences });
    window.history.replaceState(null, "", `${window.location.pathname}${query}`);
  }, [techs, preferences]);

  // After a batch lands, move focus to the results so keyboard and screen reader users follow along.
  useEffect(() => {
    if (generator.completedCount > 0 && isSingleColumn()) {
      resultsHeadingRef.current?.focus({ preventScroll: true });
    }
  }, [generator.completedCount]);

  const generate = (forTechs: Tech[] = techs) => {
    generator.generate(forTechs, preferences);
    if (isSingleColumn()) {
      resultsHeadingRef.current?.scrollIntoView({ block: "start" });
    }
  };

  const tryExample = (names: string[]) => {
    const exampleTechs = techsFromNames(names);
    setTechs(exampleTechs);
    generate(exampleTechs);
  };

  const clearHistory = () => {
    const previous = generator.clearBatches();
    toast({ message: "Cleared results", action: { label: "Undo", onClick: () => generator.restoreBatches(previous) } });
  };

  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-mid focus:bg-accent focus:px-4 focus:py-2 focus:text-accent-ink">
        Skip to content
      </a>
      <Navbar onOpenBookmarks={() => setBookmarksOpen(true)} />
      <BookmarksDrawer open={bookmarksOpen} onClose={() => setBookmarksOpen(false)} />

      <main id="main" className="mx-auto w-full max-w-page flex-1 px-4 pb-16 pt-8 sm:px-6 lg:pt-10">
        <div className="mb-8 max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight text-fg sm:text-4xl">Find your next project</h1>
          <p className="mt-2 text-muted">
            Pick your stack, tune it if you like, and get three project ideas with a difficulty, a time estimate, and links to get started.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(320px,380px)_1fr] lg:items-start">
          {/* Capped to the viewport so the Generate button stays reachable on short screens. */}
          <div className="lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto lg:rounded-soft">
            <BuilderPanel
              techs={techs}
              preferences={preferences}
              generating={!!generator.pending}
              onTechsChange={setTechs}
              onPreferencesChange={setPreferences}
              onGenerate={() => generate()}
              onTryExample={tryExample}
            />
          </div>

          <ErrorBoundary onReset={() => generator.clearBatches()}>
            <Results
              ref={resultsHeadingRef}
              batches={generator.batches}
              activeBatchId={generator.activeBatchId}
              pending={generator.pending}
              refining={generator.refining}
              error={generator.error}
              completedCount={generator.completedCount}
              onSelectBatch={generator.setActiveBatchId}
              onRefine={generator.refine}
              onRetry={() => generate()}
              onDismissError={generator.dismissError}
              onClear={clearHistory}
            />
          </ErrorBoundary>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <BookmarksProvider>
        <AppContent />
      </BookmarksProvider>
    </ToastProvider>
  );
}
