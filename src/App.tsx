/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Toaster } from 'sonner';
import { AppProvider, useApp } from './context/AppContext';
import { PublicWebsite } from './pages/PublicWebsite';
import { AdminLogin } from './pages/AdminLogin';
import { AdminPanel } from './pages/AdminPanel';

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

class AppErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error?.message || 'Unexpected application error.',
    };
  }

  override render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6 text-slate-900 dark:text-white">
          <div className="max-w-md w-full rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 shadow-sm space-y-4">
            <h1 className="text-lg font-bold">Application Recovery Notice</h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-mono break-all">
              {this.state.errorMessage}
            </p>
            <button
              type="button"
              onClick={() => {
                window.location.hash = '';
                window.location.reload();
              }}
              className="px-5 py-2.5 rounded-full bg-indigo-600 text-white text-xs font-semibold cursor-pointer"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const AppRouter: React.FC = () => {
  const { currentPath } = useApp();

  if (currentPath.startsWith('/admin/login')) {
    return <AdminLogin />;
  }

  if (currentPath.startsWith('/admin')) {
    return <AdminPanel />;
  }

  return <PublicWebsite />;
};

export default function App() {
  return (
    <AppErrorBoundary>
      <AppProvider>
        <AppRouter />
        <Toaster position="bottom-right" richColors closeButton />
      </AppProvider>
    </AppErrorBoundary>
  );
}
