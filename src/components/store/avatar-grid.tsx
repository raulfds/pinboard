'use client';

import type { Avatar } from '@/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { Flame } from 'lucide-react';

interface AvatarGridProps {
  avatars: Avatar[];
  currentUserPoints: number;
}

export default function AvatarGrid({ avatars, currentUserPoints }: AvatarGridProps) {
  const { toast } = useToast();

  const handleBuy = (avatar: Avatar) => {
    if (currentUserPoints >= avatar.price) {
      toast({
        title: 'Purchase Successful!',
        description: `You've unlocked the "${avatar.name}" avatar.`,
      });
    } else {
      toast({
        title: 'Not enough points',
        description: `You need ${avatar.price - currentUserPoints} more points to buy this.`,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {avatars.map((avatar) => (
        <Card key={avatar.id} className="flex flex-col">
          <CardHeader>
            <CardTitle>{avatar.name}</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow flex items-center justify-center">
            <Image
              src={avatar.image}
              alt={avatar.name}
              width={200}
              height={200}
              className="rounded-lg object-cover aspect-square"
              data-ai-hint={avatar.hint}
            />
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              onClick={() => handleBuy(avatar)}
              disabled={currentUserPoints < avatar.price && avatar.price > 0}
            >
              {avatar.price === 0 ? 'Default' : (
                <>
                  <Flame className="mr-2 h-4 w-4" /> {avatar.price} Points
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
