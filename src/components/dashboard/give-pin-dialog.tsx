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
}

export default function GivePinDialog({ users }: GivePinDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const receiverId = formData.get('receiver');
    const reason = formData.get('reason');
    
    if (!receiverId || !reason) {
      toast({
        title: 'Error',
        description: 'Please select a user and provide a reason.',
        variant: 'destructive',
      });
      return;
    }
    
    const receiver = users.find(u => u.id === receiverId);

    toast({
      title: 'Pin Sent!',
      description: `You gave a pin to ${receiver?.name}.`,
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Flame className="mr-2 h-4 w-4" /> Give a Pin
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Give a Pin</DialogTitle>
            <DialogDescription>
              Select a user and explain why they deserve a pin. Each pin is 1 point.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="receiver" className="text-right">
                To
              </Label>
              <Select name="receiver">
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a user" />
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
                Reason
              </Label>
              <Textarea
                id="reason"
                name="reason"
                className="col-span-3"
                placeholder="What did they complain about?"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit">Send Pin</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
