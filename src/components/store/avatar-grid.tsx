'use client';

import type { Avatar } from '@/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { Flame } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function AvatarGrid() {
  const { toast } = useToast();
  const { avatars, currentUser } = useApp();

  if (!currentUser) return null;

  const handleBuy = (avatar: Avatar) => {
    if (currentUser.points >= avatar.price) {
      toast({
        title: 'Compra Realizada!',
        description: `Você desbloqueou o avatar "${avatar.name}".`,
      });
      // Here you would typically call a function from context to update user's avatar and points
    } else {
      toast({
        title: 'Pontos insuficientes',
        description: `Você precisa de mais ${avatar.price - currentUser.points} pontos para comprar isto.`,
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
              src={(avatar.image ? avatar.image.replace(/([^:]\/)(\/)+/g, '$1') : 'https://placehold.co/200x200?text=Avatar')}
              alt={avatar.name || 'Avatar'}
              width={200}
              height={200}
              className="rounded-lg object-cover aspect-square"
              data-ai-hint={avatar.hint}
              onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/200x200?text=Avatar'; }}
            />
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              onClick={() => handleBuy(avatar)}
              disabled={currentUser.points < avatar.price && avatar.price > 0}
            >
              {avatar.price === 0 ? 'Padrão' : (
                <>
                  <Flame className="mr-2 h-4 w-4" /> {avatar.price} Pontos
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
