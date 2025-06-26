'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Flame, LayoutGrid, Store, User as UserIcon, LogOut, Shield, ChevronDown } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useApp } from '@/context/AppContext';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { currentUser, logout, loading } = useApp();
  const router = useRouter();
  const [senha, setSenha] = useState('');
  const [senhaCorreta, setSenhaCorreta] = useState(false);
  const [tentou, setTentou] = useState(false);

  useEffect(() => {
    if (!loading && !currentUser) {
      router.replace('/');
    }
  }, [loading, currentUser, router]);

  if (loading || !currentUser) {
    return (
       <div className="flex h-screen w-full items-center justify-center">
        <Flame className="h-12 w-12 animate-pulse text-primary" />
      </div>
    )
  }

  // Modal de senha
  if (!senhaCorreta) {
    return (
      <Dialog open>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle>Digite a senha para acessar o painel</DialogTitle>
          </DialogHeader>
          <form onSubmit={e => {
            e.preventDefault();
            if (senha === 'vaitomando') {
              setSenhaCorreta(true);
            } else {
              setTentou(true);
            }
          }} className="flex flex-col gap-4">
            <Input
              type="password"
              placeholder="Senha"
              value={senha}
              onChange={e => setSenha(e.target.value)}
              autoFocus
            />
            {tentou && senha !== 'vaitomando' && (
              <span className="text-red-500 text-sm">Senha incorreta</span>
            )}
            <Button type="submit">Entrar</Button>
          </form>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
             <div className="bg-primary rounded-lg p-2 w-fit">
              <Flame className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-primary">Pinboard</h1>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <Link href="/dashboard" className="w-full">
                <SidebarMenuButton>
                  <LayoutGrid />
                  Painel
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/dashboard/store" className="w-full">
                <SidebarMenuButton>
                  <Store />
                  Loja de Avatares
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
             {currentUser.role === 'admin' && (
              <SidebarMenuItem>
                <Link href="/admin" className="w-full">
                  <SidebarMenuButton>
                    <Shield />
                    Painel Admin
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            )}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start h-auto p-2">
                <div className="flex items-center gap-3 w-full">
                  <Avatar>
                    <AvatarImage src={(currentUser.avatar ? currentUser.avatar.replace(/([^:]\/)(\/)+/g, '$1') : 'https://placehold.co/40x40?text=Avatar')} alt={currentUser.name || 'Avatar'} data-ai-hint="fire character"/>
                    <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col text-left">
                    <span className="font-semibold">{currentUser.name}</span>
                    <span className="text-sm text-muted-foreground">{currentUser.points} Pontos</span>
                  </div>
                  <ChevronDown className="ml-auto h-4 w-4" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 mb-2" align="end">
              <DropdownMenuItem onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
          <div className="md:hidden">
              <SidebarTrigger />
          </div>
          <div className="flex-1">
            {/* Can add breadcrumbs or page title here */}
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
