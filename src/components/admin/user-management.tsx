'use client';

import { useApp } from '@/context/AppContext';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function UserManagement() {
  const { users, removeUser, currentUser } = useApp();
  const [invites, setInvites] = useState<string[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');

  // Carregar e-mails convidados do Supabase
  useEffect(() => {
    const fetchInvites = async () => {
      const { data, error } = await supabase.from('invites').select('email');
      if (data) setInvites(data.map((i: any) => i.email));
    };
    fetchInvites();
  }, []);

  // Adicionar novo convite
  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    await supabase.from('invites').insert([{ email: inviteEmail }]);
    setInvites((prev) => [...prev, inviteEmail]);
    setInviteEmail('');
  };

  // Remover convite
  const handleRemoveInvite = async (email: string) => {
    await supabase.from('invites').delete().eq('email', email);
    setInvites((prev) => prev.filter((e) => e !== email));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gerenciamento de Usuários</CardTitle>
        <CardDescription>
          Visualize e remova usuários do sistema. Novos usuários só podem logar se forem convidados por e-mail.
        </CardDescription>
      </CardHeader>
      <div className="mb-6">
        <form onSubmit={handleInvite} className="flex gap-2">
          <input
            type="email"
            placeholder="E-mail para convite"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            className="border rounded px-2 py-1"
            required
          />
          <Button type="submit">Convidar</Button>
        </form>
        <div className="mt-2">
          <strong>E-mails convidados:</strong>
          <ul className="list-disc ml-6">
            {invites.map((email) => (
              <li key={email} className="flex items-center gap-2">
                {email}
                <Button variant="destructive" size="sm" onClick={() => handleRemoveInvite(email)}>
                  Remover
                </Button>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Usuário</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Pontos</TableHead>
            <TableHead>Role</TableHead>
            <TableHead className="text-right">Ação</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar || 'https://placehold.co/40x40?text=Avatar'} alt={user.name || 'Avatar'} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{user.name}</span>
                </div>
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.points}</TableCell>
              <TableCell>
                <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                  {user.role}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button 
                  variant="destructive" 
                  size="icon" 
                  onClick={() => removeUser(user.id)}
                  disabled={user.id === currentUser?.id}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
