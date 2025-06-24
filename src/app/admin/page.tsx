import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AdminTabs from '@/components/admin/admin-tabs';

export default function AdminPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center mb-6">
        <Button asChild variant="outline" size="icon" className="mr-4">
            <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4" />
            </Link>
        </Button>
        <div >
            <h1 className="text-3xl font-bold">Painel de Administração</h1>
            <p className="text-muted-foreground">Gerencie os dados da aplicação.</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
            <AdminTabs />
        </CardContent>
      </Card>
    </div>
  );
}
