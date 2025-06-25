'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut, User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import type { User, Pin, Avatar } from '@/types';
import { initialUsers, initialPins, initialAvatars } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

interface AppContextType {
  currentUser: User | null;
  loading: boolean;
  loginWithGoogle: () => void;
  logout: () => void;
  users: User[];
  pins: Pin[];
  avatars: Avatar[];
  givePin: (giverId: string, receiverId: string, reason: string) => void;
  invalidatePin: (pinId: string) => void;
  removeUser: (userId: string) => void;
  addAvatar: (avatar: Omit<Avatar, 'id'>) => void;
  updateAvatar: (avatar: Avatar) => void;
  removeAvatar: (avatarId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  const [users, setUsers] = useState<User[]>([]);
  const [pins, setPins] = useState<Pin[]>([]);
  const [avatars, setAvatars] = useState<Avatar[]>(initialAvatars);

  // Carregar usuários do Supabase
  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase.from('users').select('*');
      if (error) {
        toast({ title: 'Erro ao carregar usuários', description: error.message, variant: 'destructive' });
        return;
      }
      setUsers(data || []);
    };
    fetchUsers();
  }, []);

  // Carregar PINs do Supabase e escutar em tempo real
  useEffect(() => {
    const fetchPins = async () => {
      const { data, error } = await supabase.from('pins').select('*').order('timestamp', { ascending: false });
      if (error) {
        toast({ title: 'Erro ao carregar PINs', description: error.message, variant: 'destructive' });
        return;
      }
      setPins(data || []);
    };
    fetchPins();

    // Escuta em tempo real
    const channel = supabase.channel('realtime-pins')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pins' }, (payload) => {
        fetchPins();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Função para dar um PIN (persistir no Supabase)
  const givePin = async (giverId: string, receiverId: string, reason: string) => {
    const giver = users.find(u => u.id === giverId);
    const receiver = users.find(u => u.id === receiverId);
    if (!giver || !receiver) return;

    const newPin = {
      giver_id: giver.id,
      receiver_id: receiver.id,
      reason,
      timestamp: new Date().toISOString(),
    };
    const { error } = await supabase.from('pins').insert([newPin]);
    if (error) {
      toast({ title: 'Erro ao dar PIN', description: error.message, variant: 'destructive' });
      return;
    }
    // Atualizar pontos do receiver
    await supabase.from('users').update({ points: receiver.points + 1 }).eq('id', receiver.id);
  };

  // Função para invalidar PIN (remover do Supabase)
  const invalidatePin = async (pinId: string) => {
    const { error } = await supabase.from('pins').delete().eq('id', pinId);
    if (!error) toast({ title: 'PIN invalidado com sucesso.' });
  };

  // Função para remover usuário
  const removeUser = async (userId: string) => {
    const { error } = await supabase.from('users').delete().eq('id', userId);
    if (!error) toast({ title: 'Usuário removido com sucesso.' });
  };

  // Avatares continuam locais por enquanto
  const addAvatar = (avatarData: Omit<Avatar, 'id'>) => {
    const newAvatar: Avatar = { ...avatarData, id: `avatar-${Date.now()}` };
    setAvatars(prev => [...prev, newAvatar]);
    toast({ title: 'Avatar adicionado com sucesso!'});
  }

  const updateAvatar = (updatedAvatar: Avatar) => {
    setAvatars(prev => prev.map(a => a.id === updatedAvatar.id ? updatedAvatar : a));
    toast({ title: 'Avatar atualizado com sucesso!'});
  }

  const removeAvatar = (avatarId: string) => {
    setAvatars(prev => prev.filter(a => a.id !== avatarId));
    toast({ title: 'Avatar removido com sucesso!'});
  }

  const loginWithGoogle = async () => {
    if (!auth) {
        toast({ title: 'Erro de Configuração', description: 'A autenticação com Firebase não está configurada. Verifique suas credenciais.', variant: 'destructive' });
        return;
    }
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      router.push('/dashboard');
      toast({ title: 'Login bem-sucedido!' });
    } catch (error: any) {
      if (error.code === 'auth/unauthorized-domain') {
        toast({
          title: 'Domínio não autorizado',
          description: `O domínio "${window.location.hostname}" não está autorizado para login. Adicione-o no painel do Firebase em Authentication > Settings > Authorized domains.`,
          variant: 'destructive',
          duration: 10000,
        });
      } else {
         toast({ title: 'Erro no login', description: 'Não foi possível fazer login com o Google.', variant: 'destructive' });
      }
      console.error("Erro no login com Google:", error);
      setLoading(false);
    }
  };

  const logout = async () => {
    if (!auth) {
        toast({ title: 'Erro de Configuração', description: 'A autenticação com Firebase não está configurada.', variant: 'destructive' });
        return;
    }
    await signOut(auth);
    router.push('/');
    toast({ title: 'Você saiu da sua conta.' });
  };

  const value = {
    currentUser,
    loading,
    loginWithGoogle,
    logout,
    users,
    pins,
    avatars,
    givePin,
    invalidatePin,
    removeUser,
    addAvatar,
    updateAvatar,
    removeAvatar,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
