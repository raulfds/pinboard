'use client';

import { useState } from 'react';
import type { User } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Flame } from 'lucide-react';

interface GivePinDialogProps {
  users: User[];
  onPinGiven: (data: { receiverId: string; reason: string }) => void;
}

export default function GivePinDialog({ users, onPinGiven }: GivePinDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const receiverId = formData.get('receiver') as string;
    const reason = formData.get('reason') as string;
    
    if (!receiverId || !reason) {
      toast({
        title: 'Erro',
        description: 'Por favor, selecione um usuário e forneça um motivo.',
        variant: 'destructive',
      });
      return;
    }
    
    onPinGiven({ receiverId, reason });
    
    const receiver = users.find(u => u.id === receiverId);
    toast({
      title: 'PIN Enviado!',
      description: `Você deu um PIN para ${receiver?.name}.`,
    });
    
    setOpen(false);
    // Reset form for next time
    event.currentTarget.reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Flame className="mr-2 h-4 w-4" /> Dar um PIN
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Dar um PIN</DialogTitle>
            <DialogDescription>
              Selecione um usuário e explique por que ele merece um PIN. Cada PIN vale 1 ponto.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="receiver" className="text-right">
                Para
              </Label>
              <Select name="receiver">
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione um usuário" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="reason" className="text-right pt-2">
                Motivo
              </Label>
              <Textarea
                id="reason"
                name="reason"
                className="col-span-3"
                placeholder="Sobre o que eles reclamaram?"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit">Enviar PIN</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
