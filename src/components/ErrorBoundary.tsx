import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from './ui/button';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center space-y-4">
          <AlertTriangle className="w-12 h-12 text-destructive" />
          <h1 className="text-2xl font-bold">Something went wrong</h1>
          <p className="text-muted-foreground max-w-md">
            We encountered an unexpected error. Please try refreshing the page.
          </p>
          <div className="p-4 bg-muted rounded-lg text-left overflow-auto max-w-full italic text-xs font-mono">
            {this.state.error?.message}
          </div>
          <Button onClick={() => window.location.reload()}>Refresh App</Button>
        </div>
      );
    }

    // @ts-ignore - props exists on Component in React
    return this.props.children;
  }
}
