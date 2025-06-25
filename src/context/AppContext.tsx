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
    // Atualizar pontos do receiver no banco
    await supabase.from('users').update({ points: receiver.points + 1 }).eq('id', receiver.id);
    // Atualizar pontos do receiver no estado local
    setUsers(prev => prev.map(u => u.id === receiver.id ? { ...u, points: u.points + 1 } : u));
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
  }, []);

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
