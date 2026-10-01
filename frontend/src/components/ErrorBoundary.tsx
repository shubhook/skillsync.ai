import { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  onReset: () => void;
}

// Keeps one bad result from blanking the whole page.
export default class ErrorBoundary extends Component<ErrorBoundaryProps, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Results crashed:', error, info.componentStack);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div role="alert" className="rounded-2xl border border-danger/40 bg-danger/10 p-6 text-sm">
        <p className="font-semibold text-fg">Something went wrong showing these ideas.</p>
        <p className="mt-1 text-muted">Your bookmarks are safe. Clearing the results usually fixes it.</p>
        <button
          type="button"
          onClick={() => {
            this.props.onReset();
            this.setState({ failed: false });
          }}
          className="mt-4 rounded-lg bg-accent px-4 py-2 font-semibold text-accent-ink"
        >
          Clear results
        </button>
      </div>
    );
  }
}
