'use client';

import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { Flame } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { currentUser, loading } = useApp();
  const router = useRouter();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Flame className="h-12 w-12 animate-pulse text-primary" />
      </div>
    );
  }

  if (!currentUser) {
    router.replace('/');
    return null;
  }

  if (currentUser.role !== 'admin') {
    router.replace('/dashboard');
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <p>Acesso negado. Redirecionando...</p>
        </div>
    );
  }

  return <>{children}</>;
}
