'use client';

import type { Pin } from '@/types';
import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { ArrowRight, MessageSquare } from 'lucide-react';

interface PinFeedProps {
  pins: Pin[];
}

const filterPins = (pins: Pin[], filter: 'day' | 'week' | 'month') => {
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

export default function PinFeed({ pins }: PinFeedProps) {
  const [filter, setFilter] = useState<'day' | 'week' | 'month'>('week');
  const filteredPins = filterPins(pins, filter);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle>Recent Pins</CardTitle>
          <Tabs
            defaultValue="week"
            onValueChange={(value) => setFilter(value as any)}
          >
            <TabsList>
              <TabsTrigger value="day">Day</TabsTrigger>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredPins.length > 0 ? (
            filteredPins.map((pin) => (
              <div key={pin.id} className="p-4 border rounded-lg bg-background/50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={pin.giver.avatar} data-ai-hint="fire character"/>
                      <AvatarFallback>{pin.giver.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="font-semibold">{pin.giver.name}</span>
                    <ArrowRight className="h-4 w-4 text-primary" />
                     <Avatar className="h-6 w-6">
                      <AvatarImage src={pin.receiver.avatar} data-ai-hint="fire character" />
                      <AvatarFallback>{pin.receiver.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="font-semibold">{pin.receiver.name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(pin.timestamp), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
                <div className="flex items-start gap-3 pl-1">
                    <MessageSquare className="h-5 w-5 mt-0.5 text-primary/70 shrink-0"/>
                    <p className="text-foreground">{pin.reason}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No pins in this period. Everyone is happy!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
