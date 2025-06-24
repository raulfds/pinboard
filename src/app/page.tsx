'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Flame } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function LoginPage() {
  const router = useRouter();
  const { currentUser, loginWithGoogle, loading } = useApp();

  useEffect(() => {
    if (currentUser) {
      router.push('/dashboard');
    }
  }, [currentUser, router]);

  if (loading || currentUser) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <Flame className="h-12 w-12 animate-pulse text-primary" />
      </div>
    );
  }
  
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
            Bem-vindo! Faça login para continuar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={loginWithGoogle} className="w-full" size="lg">
             <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 21.2 172.9 65.6l-63.3 63.3C323.8 100.2 288.7 84 248 84c-83.2 0-151.2 67.2-151.2 151.2s68 152 151.2 152c92.2 0 131.3-64.4 135.2-97.6H248v-65.4h239.2c.4 12.8 1.2 25.8 1.2 39.4z"></path></svg>
            Entrar com Google
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
