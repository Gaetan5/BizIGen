'use client';

import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { Subscription } from '@/lib/types';

export default function Dashboard() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const supabase = createClient();
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'flutterwave'>('stripe');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    const fetchSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .single();
        setSubscription(data);
      }
    };
    fetchSubscription();
  }, [supabase]);

  const handleUpgrade = async (plan: string) => {
    if (paymentMethod === 'stripe') {
      try {
        const response = await fetch('/api/stripe/create-checkout-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ plan }),
        });

        const { url } = await response.json();
        window.location.href = url;
      } catch (error) {
        console.error('Error:', error);
        alert('Erreur lors de l\'upgrade');
      }
    } else if (paymentMethod === 'flutterwave') {
      if (!phone) {
        alert('Numéro de téléphone requis pour paiement mobile');
        return;
      }

      try {
        const { data: { user } } = await supabase.auth.getUser();
        const response = await fetch('/api/flutterwave/initiate-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ plan, phone, email: user?.email }),
        });

        const result = await response.json();
        if (result.status === 'success') {
          // Redirect to Flutterwave hosted page
          window.location.href = result.data.link;
        } else {
          alert('Erreur paiement mobile');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Erreur lors du paiement mobile');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Bienvenue sur Biz-IGen</h1>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </header>

        <SignedIn>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader>
                <CardTitle>Nouveau Projet</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">Créez un nouveau projet pour générer votre Business Model Canvas.</p>
                <Button asChild>
                  <Link href="/dashboard/projects/new">Commencer</Link>
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Mes Projets</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">Consultez vos projets existants.</p>
                <Button variant="outline" asChild>
                  <Link href="/dashboard/projects">Voir</Link>
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Abonnement</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>Plan actuel: {subscription?.plan || 'Gratuit'}</p>

                {(!subscription || subscription.plan === 'basic') && (
                  <>
                    <div>
                      <Label htmlFor="payment-method">Méthode de paiement</Label>
                      <select
                        id="payment-method"
                        aria-label="Méthode de paiement"
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value as 'stripe' | 'flutterwave')}
                        className="w-full p-2 border rounded-md mt-1"
                      >
                        <option value="stripe">Carte bancaire (Stripe)</option>
                        <option value="flutterwave">Mobile Money (Afrique)</option>
                      </select>
                    </div>

                    {paymentMethod === 'flutterwave' && (
                      <div>
                        <Label htmlFor="phone">Numéro de téléphone</Label>
                        <Input
                          id="phone"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+237 6XX XXX XXX"
                          className="mt-1"
                        />
                      </div>
                    )}

                    <Button onClick={() => handleUpgrade('pro')} className="w-full">
                      Upgrade Pro (15€/mois)
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Support</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">Besoin d&apos;aide ? Chattez avec notre assistant IA.</p>
                <Button variant="outline" asChild>
                  <Link href="/support">Support</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </SignedIn>

        <SignedOut>
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Connectez-vous</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Vous devez être connecté pour accéder au dashboard.</p>
              <Button asChild>
                <Link href="/sign-in">Se connecter</Link>
              </Button>
            </CardContent>
          </Card>
        </SignedOut>
      </div>
    </div>
  );
}
