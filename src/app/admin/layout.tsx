'use client';

import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { Flame } from 'lucide-react';
import { useEffect } from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { currentUser, loading } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (loading) {
      return;
    }
    if (!currentUser) {
      router.replace('/');
    } else if (currentUser.role !== 'admin') {
      router.replace('/dashboard');
    }
  }, [currentUser, loading, router]);


  if (loading || !currentUser || currentUser.role !== 'admin') {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Flame className="h-12 w-12 animate-pulse text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
