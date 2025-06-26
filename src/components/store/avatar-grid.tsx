'use client';

import type { Avatar } from '@/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { Flame } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function AvatarGrid() {
  const { toast } = useToast();
  const { avatars, currentUser, users, updateAvatar } = useApp();
  const [loadingAvatar, setLoadingAvatar] = useState<string | null>(null);

  if (!currentUser) return null;

  // Simulação: lista de IDs de avatares já "comprados" pelo usuário
  // Em produção, você deve buscar do backend/relacionamento
  const userAvatars = [currentUser.avatar, ...avatars.filter(a => a.price === 0).map(a => a.image)].filter(Boolean);

  const handleBuyOrUse = async (avatar: Avatar) => {
    setLoadingAvatar(avatar.id);
    if (currentUser.avatar === avatar.image || userAvatars.includes(avatar.image)) {
      await supabase.from('users').update({ avatar: avatar.image }).eq('id', currentUser.id);
      toast({ title: 'Avatar atualizado!', description: `Você está usando o avatar "${avatar.name}".` });
    } else if (currentUser.points >= avatar.price) {
      await supabase.from('users').update({ avatar: avatar.image, points: currentUser.points - avatar.price }).eq('id', currentUser.id);
      toast({ title: 'Compra Realizada!', description: `Você desbloqueou e está usando o avatar "${avatar.name}".` });
    } else {
      toast({
        title: 'Pontos insuficientes',
        description: `Você precisa de mais ${avatar.price - currentUser.points} pontos para comprar isto.`,
        variant: 'destructive',
      });
    }
    setLoadingAvatar(null);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {avatars.map((avatar) => (
        <Card key={avatar.id} className="h-[300px] flex flex-col justify-between">
          <CardHeader className="flex-row items-center space-y-4 space-x-4">
            <CardTitle className="text-sm font-medium leading-none">{avatar.name}</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center flex-1">
            <Image
              src={avatar.image}
              alt={avatar.name}
              width={100}
              height={100}
              className="rounded-full object-cover"
            />
          </CardContent>
          <CardFooter className="flex items-center justify-center">
            <Button
              className="w-full text-xs sm:text-sm"
              variant={currentUser.avatar === avatar.image ? 'secondary' : userAvatars.includes(avatar.image) ? 'default' : 'outline'}
              onClick={() => handleBuyOrUse(avatar)}
              disabled={loadingAvatar === avatar.id}
            >
              {loadingAvatar === avatar.id ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent inline-block"></span>
              ) : currentUser.avatar === avatar.image ? (
                'Usando'
              ) : userAvatars.includes(avatar.image) ? (
                'Usar'
              ) : (
                `Comprar${avatar.price > 0 ? ` (${avatar.price} pontos)` : ''}`
              )}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}