'use client';

import type { User, Pin } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useState } from 'react';

export default function Leaderboard() {
  const { users, pins } = useApp();
  const [filter, setFilter] = useState<'day' | 'week' | 'month' | 'all'>('all');

  // Função para filtrar pins por período
  const filterPins = (pins: Pin[], filter: 'day' | 'week' | 'month' | 'all') => {
    const now = new Date();
    return pins.filter((pin) => {
      const pinDate = new Date(pin.timestamp);
      const diff = now.getTime() - pinDate.getTime();
      const days = diff / (1000 * 3600 * 24);
      if (filter === 'day') return days <= 1;
      if (filter === 'week') return days <= 7;
      if (filter === 'month') return days <= 30;
      return true;
    });
  };

  // Calcular pontos recebidos por usuário no período
  const filteredPins = filterPins(pins, filter);
  const userPoints: Record<string, number> = {};
  filteredPins.forEach(pin => {
    if (!userPoints[pin.receiver.id]) userPoints[pin.receiver.id] = 0;
    userPoints[pin.receiver.id] += 1;
  });

  const sortedUsers = [...users]
    .map(user => ({ ...user, points: userPoints[user.id] || 0 }))
    .sort((a, b) => b.points - a.points);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Placar de Líderes</CardTitle>
        <div className="flex gap-2 items-center">
          <select
            className="border rounded px-2 py-1 text-sm"
            value={filter}
            onChange={e => setFilter(e.target.value as any)}
          >
            <option value="day">Dia</option>
            <option value="week">Semana</option>
            <option value="month">Mês</option>
            <option value="all">Total</option>
          </select>
          <Trophy className="h-6 w-6 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">Pos.</TableHead>
              <TableHead>Usuário</TableHead>
              <TableHead className="text-right">Pontos</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedUsers.map((user, index) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium text-center">{index + 1}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar || 'https://placehold.co/40x40?text=Avatar'} alt={user.name || 'Avatar'} data-ai-hint="fire character" />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{user.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right font-bold text-primary">{user.points}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
