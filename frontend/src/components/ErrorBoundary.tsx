import { Component, ErrorInfo, ReactNode } from 'react';
import Action from './ui/Action';

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
      <div role="alert" className="rounded-soft border border-danger/35 bg-danger/10 p-6 text-sm">
        <p className="font-semibold text-fg">Something went wrong showing these ideas.</p>
        <p className="mt-1 text-muted">Your bookmarks are safe. Clearing the results usually fixes it.</p>
        <Action
          variant="solid"
          className="mt-4"
          onClick={() => {
            this.props.onReset();
            this.setState({ failed: false });
          }}
        >
          Clear results
        </Action>
      </div>
    );
  }
}
