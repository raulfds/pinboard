'use client';

import AvatarGrid from '@/components/store/avatar-grid';
import { useApp } from '@/context/AppContext';

export default function StorePage() {
  const { currentUser } = useApp();

  if (!currentUser) return null;

  return (
    <div className="container mx-auto">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold">Loja de Avatares</h1>
        <div className="text-lg font-semibold text-primary rounded-lg bg-primary/10 px-4 py-2 text-center">
          Seus Pontos: <span className="font-bold">{currentUser.points}</span>
        </div>
      </div>
      <AvatarGrid />
    </div>
  );
}
