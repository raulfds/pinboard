'use client';

import Leaderboard from '@/components/dashboard/leaderboard';
import PinFeed from '@/components/dashboard/pin-feed';
import GivePinDialog from '@/components/dashboard/give-pin-dialog';
import { useApp } from '@/context/AppContext';

export default function DashboardPage() {
  const { currentUser } = useApp();

  if (!currentUser) return null;
  
  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Painel</h1>
        <GivePinDialog />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <PinFeed />
        </div>
        <div className="lg:col-span-1">
          <Leaderboard />
        </div>
      </div>
    </div>
  );
}
