'use client';

import { useApp } from '@/context/AppContext';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function PinModeration() {
  const { pins, invalidatePin } = useApp();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Moderação de PINs</CardTitle>
        <CardDescription>
          Revise e invalide PINs que não estejam de acordo com as regras.
        </CardDescription>
      </CardHeader>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>De</TableHead>
            <TableHead>Para</TableHead>
            <TableHead>Motivo</TableHead>
            <TableHead>Data</TableHead>
            <TableHead className="text-right">Ação</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pins.map((pin) => (
            <TableRow key={pin.id}>
              <TableCell>{pin.giver.name}</TableCell>
              <TableCell>{pin.receiver.name}</TableCell>
              <TableCell className="max-w-xs truncate">{pin.reason}</TableCell>
              <TableCell>
                {formatDistanceToNow(new Date(pin.timestamp), {
                  addSuffix: true,
                  locale: ptBR,
                })}
              </TableCell>
              <TableCell className="text-right">
                <Button variant="destructive" size="icon" onClick={() => invalidatePin(pin.id)}>
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
