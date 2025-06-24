'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PinModeration from './pin-moderation';
import UserManagement from './user-management';
import StoreManagement from './store-management';

export default function AdminTabs() {
  return (
    <Tabs defaultValue="pins">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="pins">Moderar PINs</TabsTrigger>
        <TabsTrigger value="users">Gerenciar Usuários</TabsTrigger>
        <TabsTrigger value="store">Gerenciar Loja</TabsTrigger>
      </TabsList>
      <TabsContent value="pins">
        <PinModeration />
      </TabsContent>
      <TabsContent value="users">
        <UserManagement />
      </TabsContent>
      <TabsContent value="store">
        <StoreManagement />
      </TabsContent>
    </Tabs>
  );
}
