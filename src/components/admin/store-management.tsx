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
import { supabase } from '@/lib/supabase';

export default function StoreManagement() {
  const { avatars, addAvatar, updateAvatar, removeAvatar } = useApp();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentAvatar, setCurrentAvatar] = useState<Avatar | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");

  const handleEdit = (avatar: Avatar) => {
    setCurrentAvatar(avatar);
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    setCurrentAvatar(null);
    setIsDialogOpen(true);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
      const { data, error } = await supabase.storage.from('avatars').upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });
      if (error) throw error;
      // Gerar URL pública
      const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(fileName);
      setImageUrl(publicUrlData.publicUrl);
    } catch (err: any) {
      setUploadError(err.message || 'Erro ao fazer upload');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      image: imageUrl || (formData.get('image') as string),
      price: Number(formData.get('price')),
      hint: formData.get('hint') as string,
    };
    if (currentAvatar) {
      await updateAvatar({ ...currentAvatar, ...data });
    } else {
      await addAvatar(data);
    }
    setIsDialogOpen(false);
    setCurrentAvatar(null);
    setImageUrl("");
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
          {avatars.filter(Boolean).map((avatar) => (
            avatar && (
              <TableRow key={avatar.id}>
                <TableCell>
                  <Image 
                    src={(avatar.image ? avatar.image.replace(/([^:]\/)(\/)+/g, '$1') : 'https://placehold.co/80x80?text=Avatar')} 
                    alt={avatar.name || 'Avatar'} 
                    width={80} 
                    height={80} 
                    className="rounded-md"
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/80x80?text=Avatar'; }}
                  />
                </TableCell>
                <TableCell>{avatar.name || 'Sem nome'}</TableCell>
                <TableCell>{avatar.price ?? '-'}</TableCell>
                <TableCell>{avatar.hint || '-'}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="outline" size="icon" onClick={() => handleEdit(avatar)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="destructive" size="icon" onClick={() => removeAvatar(avatar.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            )
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
              <Input id="image" name="image" defaultValue={currentAvatar?.image} placeholder="https://placehold.co/200x200.png" disabled={!!imageUrl} />
              <div className="flex gap-2 items-center mt-2">
                <input type="file" accept="image/*" onChange={handleFileChange} />
                {uploading && <span>Enviando...</span>}
                {uploadError && <span className="text-red-500">{uploadError}</span>}
                {imageUrl && <span className="text-green-600">Imagem enviada!</span>}
              </div>
              {imageUrl && (
                <div className="mt-2">
                  <Image src={imageUrl} alt="Preview" width={80} height={80} className="rounded-md object-cover aspect-square" />
                </div>
              )}
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
