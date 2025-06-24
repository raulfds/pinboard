'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut, User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/lib/firebase';
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

  const [users, setUsers] = useState<User[]>(initialUsers);
  const [pins, setPins] = useState<Pin[]>(initialPins);
  const [avatars, setAvatars] = useState<Avatar[]>(initialAvatars);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      console.warn("Firebase auth is not configured. User features will be disabled.");
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        let user = users.find(u => u.email === firebaseUser.email);
        if (!user) {
          // Auto-register new user
          user = {
            id: `user-${Date.now()}`,
            uid: firebaseUser.uid,
            name: firebaseUser.displayName || 'Novo Usuário',
            email: firebaseUser.email!,
            avatar: initialAvatars[0].image,
            points: 0,
            role: 'user',
            hint: initialAvatars[0].hint,
          };
          setUsers(prev => [...prev, user!]);
        }
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [users]);

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

  const givePin = (giverId: string, receiverId: string, reason: string) => {
    const giver = users.find(u => u.id === giverId);
    const receiver = users.find(u => u.id === receiverId);
    if (!giver || !receiver) return;

    const newPin: Pin = {
      id: `pin-${Date.now()}`,
      giver,
      receiver,
      reason,
      timestamp: new Date(),
    };

    setPins(prev => [newPin, ...prev]);
    setUsers(prev => prev.map(u => u.id === receiverId ? { ...u, points: u.points + 1 } : u));
  };

  const invalidatePin = (pinId: string) => {
    setPins(prev => prev.filter(p => p.id !== pinId));
    toast({ title: 'PIN invalidado com sucesso.' });
  };
  
  const removeUser = (userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
    toast({ title: 'Usuário removido com sucesso.' });
  }

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
