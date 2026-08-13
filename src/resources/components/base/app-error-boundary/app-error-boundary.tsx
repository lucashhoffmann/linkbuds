import { Component, type ErrorInfo, type ReactNode } from 'react';
import { ErrorBrokenPage } from '@/resources/pages';

interface IAppErrorBoundaryProps {
  children: ReactNode;
}

interface IAppErrorBoundaryState {
  hasError: boolean;
}

export class AppErrorBoundary extends Component<
  IAppErrorBoundaryProps,
  IAppErrorBoundaryState
> {
  state: IAppErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(): IAppErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Unhandled UI error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorBrokenPage />;
    }

    return this.props.children;
  }
}
