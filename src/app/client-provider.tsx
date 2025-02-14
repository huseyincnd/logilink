'use client';

import { SessionProvider } from 'next-auth/react';
import { Toaster } from 'react-hot-toast';
import ClientLayout from './client-layout';

export default function ClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <ClientLayout>
        {children}
      </ClientLayout>
      <Toaster position="top-right" />
    </SessionProvider>
  );
} 