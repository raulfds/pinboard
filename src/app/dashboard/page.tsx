import Leaderboard from '@/components/dashboard/leaderboard';
import PinFeed from '@/components/dashboard/pin-feed';
import { users, pins } from '@/lib/data';
import GivePinDialog from '@/components/dashboard/give-pin-dialog';

export default function DashboardPage() {
  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <GivePinDialog users={users} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <PinFeed pins={pins} />
        </div>
        <div className="lg:col-span-1">
          <Leaderboard users={users} />
        </div>
      </div>
    </div>
  );
}
