import React from 'react';

interface AppErrorBoundaryProps {
  children: React.ReactNode;
}

interface AppErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class AppErrorBoundary extends React.Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  constructor(props: AppErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    console.error('Unexpected render error:', error);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="text-center max-w-md">
            <h1 className="text-2xl font-bold mb-3">Something went wrong</h1>
            <p className="text-gray-600 mb-4">
              The app hit an unexpected error. Reloading usually resolves this.
            </p>
            {this.state.error && (
              <p className="text-sm text-gray-500 mb-6 p-3 bg-red-50 rounded font-mono">
                {this.state.error.message}
              </p>
            )}
            <button
              onClick={this.handleReload}
              className="px-6 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transition"
            >
              Reload App
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
