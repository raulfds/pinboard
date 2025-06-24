'use client';

import { useState } from 'react';
import Leaderboard from '@/components/dashboard/leaderboard';
import PinFeed from '@/components/dashboard/pin-feed';
import { users as usersData, pins as pinsData } from '@/lib/data';
import GivePinDialog from '@/components/dashboard/give-pin-dialog';
import type { Pin, User } from '@/types';

export default function DashboardPage() {
  const [users, setUsers] = useState<User[]>(usersData);
  const [pins, setPins] = useState<Pin[]>(pinsData);
  
  // For prototyping, we assume the first user is the logged-in user
  const currentUser = users[0];

  const handleGivePin = (data: { receiverId: string; reason: string }) => {
    const { receiverId, reason } = data;
    const receiver = users.find((user) => user.id === receiverId);

    if (!receiver) return;

    // Create the new pin
    const newPin: Pin = {
      id: `pin-${Date.now()}`,
      giver: currentUser,
      receiver: receiver,
      reason,
      timestamp: new Date(),
    };

    // Update pins state
    setPins((prevPins) => [newPin, ...prevPins]);

    // Update receiver's points
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === receiverId ? { ...user, points: user.points + 1 } : user
      )
    );
  };
  
  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Painel</h1>
        <GivePinDialog 
          users={users.filter(u => u.id !== currentUser.id)} 
          onPinGiven={handleGivePin} 
        />
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
