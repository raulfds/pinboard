'use client';

import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, Trash2, Edit } from 'lucide-react';
import Image from 'next/image';
import type { Avatar } from '@/types';

export default function StoreManagement() {
  const { avatars, addAvatar, updateAvatar, removeAvatar } = useApp();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentAvatar, setCurrentAvatar] = useState<Avatar | null>(null);

  const handleEdit = (avatar: Avatar) => {
    setCurrentAvatar(avatar);
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    setCurrentAvatar(null);
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      image: formData.get('image') as string,
      price: Number(formData.get('price')),
      hint: formData.get('hint') as string,
    };

    if (currentAvatar) {
      updateAvatar({ ...currentAvatar, ...data });
    } else {
      addAvatar(data);
    }
    setIsDialogOpen(false);
    setCurrentAvatar(null);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Gerenciamento da Loja</CardTitle>
          <CardDescription>Adicione, edite ou remova avatares da loja.</CardDescription>
        </div>
        <Button onClick={handleAddNew}>
          <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Novo
        </Button>
      </CardHeader>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Avatar</TableHead>
            <TableHead>Nome</TableHead>
            <TableHead>Preço</TableHead>
            <TableHead>Hint</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {avatars.map((avatar) => (
            <TableRow key={avatar.id}>
              <TableCell>
                <Image src={avatar.image} alt={avatar.name} width={40} height={40} className="rounded-md" />
              </TableCell>
              <TableCell>{avatar.name}</TableCell>
              <TableCell>{avatar.price}</TableCell>
              <TableCell>{avatar.hint}</TableCell>
              <TableCell className="text-right space-x-2">
                <Button variant="outline" size="icon" onClick={() => handleEdit(avatar)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="destructive" size="icon" onClick={() => removeAvatar(avatar.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{currentAvatar ? 'Editar Avatar' : 'Adicionar Novo Avatar'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Avatar</Label>
              <Input id="name" name="name" defaultValue={currentAvatar?.name} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="image">URL da Imagem</Label>
              <Input id="image" name="image" defaultValue={currentAvatar?.image} required placeholder="https://placehold.co/200x200.png"/>
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Preço (em pontos)</Label>
              <Input id="price" name="price" type="number" defaultValue={currentAvatar?.price} required />
            </div>
             <div className="space-y-2">
              <Label htmlFor="hint">Dica de IA (para geração de imagem)</Label>
              <Input id="hint" name="hint" defaultValue={currentAvatar?.hint} required />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">Cancelar</Button>
              </DialogClose>
              <Button type="submit">Salvar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
