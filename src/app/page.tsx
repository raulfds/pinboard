'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Flame } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { users } from '@/lib/data';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get('email');
    const password = formData.get('password');

    // For prototyping, we'll just check if the user exists and the password is not empty
    const userExists = users.some(user => user.email === email);

    if (userExists && password) {
      toast({
        title: 'Login bem-sucedido',
        description: 'Bem-vindo(a) de volta!',
      });
      router.push('/dashboard');
    } else {
      toast({
        title: 'Falha no Login',
        description: 'E-mail ou senha inválidos.',
        variant: 'destructive',
      });
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 relative">
      <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem]"><div className="absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(circle_500px_at_50%_200px,hsl(var(--background)),transparent)]"></div></div>
      <Card className="w-full max-w-md shadow-2xl bg-card/80 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary rounded-full p-3 w-fit mb-4 border-4 border-primary-foreground/20 shadow-lg">
            <Flame className="h-8 w-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-3xl font-bold text-primary">Pinboard</CardTitle>
          <CardDescription className="text-muted-foreground pt-2">
            Faça login em sua conta para continuar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" name="email" type="email" placeholder="m@example.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            <Button type="submit" className="w-full" size="lg">
              Entrar
            </Button>
          </form>
           <div className="mt-4 text-center text-sm">
            Não tem uma conta?{' '}
            <Link href="#" className="underline">
              Cadastre-se
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
