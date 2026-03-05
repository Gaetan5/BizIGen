import { SignedIn, SignedOut } from '@clerk/nextjs';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { redirect } from 'next/navigation';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <SignedIn>
        {redirect('/dashboard')}
      </SignedIn>

      <SignedOut>
        <div className="flex items-center justify-center min-h-screen p-8">
          <Card className="max-w-2xl w-full">
            <CardHeader className="text-center">
              <CardTitle className="text-4xl font-bold">Biz-IGen</CardTitle>
              <p className="text-xl text-muted-foreground">
                Générez automatiquement vos Business Model Canvas, Lean Canvas et Business Plans avec l'IA
              </p>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <p className="text-lg">
                Réduisez 20-40 heures de travail à 20-40 minutes grâce à notre formulaire intelligent adapté aux marchés africains.
              </p>
              <div className="space-x-4">
                <Button asChild>
                  <Link href="/sign-up">Commencer Gratuitement</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/sign-in">Se Connecter</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </SignedOut>
    </div>
  );
}
