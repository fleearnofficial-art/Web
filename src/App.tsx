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
    <AppProvider>
      <AppRouter />
      <Toaster position="bottom-right" richColors closeButton />
    </AppProvider>
  );
}
