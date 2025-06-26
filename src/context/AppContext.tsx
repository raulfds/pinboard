'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { User, Pin, Avatar } from '@/types';
import { initialUsers, initialPins, initialAvatars } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';

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
  voteHaha: (pinId: string) => void;
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

  // Carregar usuário autenticado do Supabase
  useEffect(() => {
    const getSession = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (data?.user) {
        // Removido o bloqueio de convite/email, qualquer email pode logar
        // Buscar usuário no banco pelo email
        const { data: userDb } = await supabase.from('users').select('*').eq('email', data.user.email).single();
        if (userDb) {
          // Se for o admin, garantir role admin
          if (userDb.email === 'raulferreiradesouza@gmail.com' && userDb.role !== 'admin') {
            await supabase.from('users').update({ role: 'admin' }).eq('id', userDb.id);
            setCurrentUser({ ...userDb, role: 'admin' });
          } else {
            setCurrentUser(userDb);
          }
        } else {
          // Se não existir, cria
          const isAdmin = data.user.email === 'raulferreiradesouza@gmail.com';
          const newUser = {
            id: data.user.id,
            uid: data.user.id,
            name: data.user.user_metadata.full_name || data.user.email || '',
            email: data.user.email || '',
            avatar: '',
            points: 0,
            role: isAdmin ? 'admin' as const : 'user' as const,
            hint: '',
          };
          await supabase.from('users').insert([newUser]);
          setCurrentUser(newUser);
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    };
    getSession();
    // Listener para mudanças de sessão
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      getSession();
    });
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

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

    // Escuta em tempo real usando on('postgres_changes') para users
    const channel = supabase
      .channel('public:users')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, () => {
        fetchUsers();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Carregar PINs do Supabase e escutar em tempo real
  useEffect(() => {
    const fetchPins = async () => {
      // Buscar pins com join dos usuários
      const { data, error } = await supabase
        .from('pins')
        .select('id, reason, timestamp, giver:users!pins_giver_id_fkey(*), receiver:users!pins_receiver_id_fkey(*)')
        .order('timestamp', { ascending: false });
      if (error) {
        toast({ title: 'Erro ao carregar PINs', description: error.message, variant: 'destructive' });
        return;
      }
      // Adaptar formato para o frontend
      const pinsAdapted = (data || []).map((pin: any) => ({
        id: pin.id,
        giver: pin.giver,
        receiver: pin.receiver,
        reason: pin.reason,
        timestamp: new Date(pin.timestamp),
      }));
      setPins(pinsAdapted);
    };
    fetchPins();

    // Escuta em tempo real usando on('postgres_changes')
    const channel = supabase
      .channel('public:pins')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pins' }, () => {
        fetchPins();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Carregar avatares do Supabase
  useEffect(() => {
    const fetchAvatars = async () => {
      const { data, error } = await supabase.from('avatars').select('*');
      if (error) {
        toast({ title: 'Erro ao carregar avatares', description: error.message, variant: 'destructive' });
        return;
      }
      setAvatars(data || []);
    };
    fetchAvatars();

    // Escuta em tempo real usando on('postgres_changes') para avatars
    const channel = supabase
      .channel('public:avatars')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'avatars' }, () => {
        fetchAvatars();
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

    // Otimista: atualiza localmente antes do Supabase
    const tempPin = {
      id: `temp-${Date.now()}`,
      giver,
      receiver,
      reason,
      timestamp: new Date(),
    };
    setPins(prev => [tempPin, ...prev]);
    setUsers(prev => prev.map(u => u.id === receiver.id ? { ...u, points: u.points + 1 } : u));

    const newPin = {
      giver_id: giver.id,
      receiver_id: receiver.id,
      reason,
      timestamp: new Date().toISOString(),
    };
    const { error } = await supabase.from('pins').insert([newPin]);
    if (error) {
      toast({ title: 'Erro ao dar PIN', description: error.message, variant: 'destructive' });
      // Reverte otimista
      setPins(prev => prev.filter(p => p.id !== tempPin.id));
      setUsers(prev => prev.map(u => u.id === receiver.id ? { ...u, points: u.points - 1 } : u));
      return;
    }
    // Fallback: se realtime não atualizar, força fetch
    setTimeout(() => { fetchPins(); fetchUsers(); }, 2000);
  };

  // Função para invalidar PIN (remover do Supabase)
  const invalidatePin = async (pinId: string) => {
    // Otimista: remove localmente
    const pinToRemove = pins.find(p => p.id === pinId);
    setPins(prev => prev.filter(p => p.id !== pinId));
    if (pinToRemove) {
      setUsers(prev => prev.map(u => u.id === pinToRemove.receiver.id ? { ...u, points: u.points - 1 } : u));
    }
    const { error } = await supabase.from('pins').delete().eq('id', pinId);
    if (error) {
      toast({ title: 'Erro ao invalidar PIN', description: error.message, variant: 'destructive' });
      // Reverte otimista
      setPins(prev => [...prev, pinToRemove!]);
      if (pinToRemove) {
        setUsers(prev => prev.map(u => u.id === pinToRemove.receiver.id ? { ...u, points: u.points + 1 } : u));
      }
      return;
    }
    // Fallback: se realtime não atualizar, força fetch
    setTimeout(() => { fetchPins(); fetchUsers(); }, 2000);
  };

  // Função para remover usuário
  const removeUser = async (userId: string) => {
    // Otimista: remove localmente
    setUsers(prev => prev.filter(u => u.id !== userId));
    setPins(prev => prev.filter(p => p.giver.id !== userId && p.receiver.id !== userId));
    await supabase.from('pins').delete().or(`giver_id.eq.${userId},receiver_id.eq.${userId}`);
    const { error } = await supabase.from('users').delete().eq('id', userId);
    if (error) {
      toast({ title: 'Erro ao remover usuário', description: error.message, variant: 'destructive' });
      // Fallback: força fetch
      setTimeout(() => { fetchPins(); fetchUsers(); }, 2000);
      return;
    }
    setTimeout(() => { fetchPins(); fetchUsers(); }, 2000);
  };

  // Função para adicionar avatar no Supabase
  const addAvatar = async (avatarData: Omit<Avatar, 'id'>) => {
    const { data, error } = await supabase.from('avatars').insert([avatarData]).select();
    if (error) {
      toast({ title: 'Erro ao adicionar avatar', description: error.message, variant: 'destructive' });
      return;
    }
    setAvatars(prev => [...prev, ...(data || [])]);
    toast({ title: 'Avatar adicionado com sucesso!'});
  };

  // Função para atualizar avatar no Supabase
  const updateAvatar = async (updatedAvatar: Avatar) => {
    const { error } = await supabase.from('avatars').update(updatedAvatar).eq('id', updatedAvatar.id);
    if (error) {
      toast({ title: 'Erro ao atualizar avatar', description: error.message, variant: 'destructive' });
      return;
    }
    setAvatars(prev => prev.map(a => a.id === updatedAvatar.id ? updatedAvatar : a));
    toast({ title: 'Avatar atualizado com sucesso!'});
  };

  // Função para remover avatar no Supabase
  const removeAvatar = async (avatarId: string) => {
    const { error } = await supabase.from('avatars').delete().eq('id', avatarId);
    if (error) {
      toast({ title: 'Erro ao remover avatar', description: error.message, variant: 'destructive' });
      return;
    }
    setAvatars(prev => prev.filter(a => a.id !== avatarId));
    toast({ title: 'Avatar removido com sucesso!'});
  };

  // Função para votar 'haha' em um PIN
  const voteHaha = async (pinId: string) => {
    // Atualiza no banco: incrementa haha_votes
    const { data, error } = await supabase.rpc('increment_haha_votes', { pin_id: pinId });
    if (!error) {
      setPins(prev => prev.map(p => p.id === pinId ? { ...p, haha_votes: (p.haha_votes || 0) + 1 } : p));
    }
  };

  // Substituir loginWithGoogle para usar Supabase Auth
  const loginWithGoogle = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
    if (error) {
      toast({ title: 'Erro no login', description: error.message, variant: 'destructive' });
      setLoading(false);
    }
    // O redirecionamento será feito automaticamente pelo Supabase
  };

  // Substituir logout para usar Supabase Auth
  const logout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
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
    voteHaha,
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
