'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Loader2, Sparkles, ArrowRight, Download, FileText } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { paymentApi } from '@/lib/fastapi-client';

const PLAN_FEATURES = {
  BASIC: [
    '5 projets par mois',
    'Business Plan complet (20-50 pages)',
    'Exports PDF sans watermark',
    'Support prioritaire',
    'Templates sectoriels',
  ],
  PRO: [
    'Projets illimités',
    'Business Plan complet',
    'Exports PDF et Word',
    'API access',
    'Support dédié',
    'Mises à jour prioritaires',
  ],
};

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const plan = (searchParams.get('plan') as 'BASIC' | 'PRO') || 'BASIC';
  const provider = searchParams.get('provider') || 'stripe';
  const transactionId = searchParams.get('transaction_id') || searchParams.get('session_id');
  const txRef = searchParams.get('tx_ref') || searchParams.get('tx_ref');

  const planFeatures = PLAN_FEATURES[plan] || PLAN_FEATURES.BASIC;

  useEffect(() => {
    const verifyPayment = async () => {
      // For Flutterwave, verify the payment
      if (provider === 'flutterwave' && transactionId) {
        try {
          const result = await paymentApi.verifyFlutterwavePayment(transactionId);
          if (result.success) {
            setIsVerified(true);
          } else {
            setError(result.error || 'Erreur lors de la vérification du paiement');
          }
        } catch {
          setError('Erreur lors de la vérification du paiement');
        }
      } else {
        // For Stripe, the webhook handles verification
        setIsVerified(true);
      }
      setIsLoading(false);
    };

    verifyPayment();
  }, [provider, transactionId, txRef]);

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Vérification du paiement en cours...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Erreur de paiement</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardFooter className="gap-4">
            <Link href="/subscription">
              <Button variant="outline">Retour aux abonnements</Button>
            </Link>
            <Link href="/subscription/checkout">
              <Button>Réessayer</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Success Animation */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', duration: 0.5 }}
        className="flex justify-center"
      >
        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
          <CheckCircle2 className="w-14 h-14 text-primary" />
        </div>
      </motion.div>

      {/* Success Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-center space-y-2"
      >
        <h1 className="text-3xl font-bold">Paiement réussi !</h1>
        <p className="text-muted-foreground">
          Votre abonnement a été activé avec succès
        </p>
      </motion.div>

      {/* Plan Badge */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex justify-center"
      >
        <Badge variant="default" className="text-lg px-6 py-2">
          <Sparkles className="w-4 h-4 mr-2" />
          Plan {plan}
        </Badge>
      </motion.div>

      {/* Confirmation Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Merci pour votre confiance !</CardTitle>
            <CardDescription>
              Votre abonnement est maintenant actif. Voici ce que vous pouvez faire :
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Features List */}
            <div className="space-y-2">
              {planFeatures.map((feature, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                  {feature}
                </div>
              ))}
            </div>

            {/* Transaction Info */}
            {(transactionId || txRef) && (
              <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
                <p>ID de transaction: {transactionId || txRef}</p>
                <p>Méthode: {provider === 'stripe' ? 'Carte bancaire (Stripe)' : 'Flutterwave'}</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex-col gap-3">
            <Link href="/projects/new" className="w-full">
              <Button className="w-full" size="lg">
                <FileText className="w-4 h-4 mr-2" />
                Créer mon premier projet
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/dashboard" className="w-full">
              <Button variant="outline" className="w-full">
                Aller au tableau de bord
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="grid md:grid-cols-2 gap-4"
      >
        <Link href="/projects">
          <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-medium">Mes projets</p>
                <p className="text-sm text-muted-foreground">Gérer vos projets existants</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/help">
          <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Download className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-medium">Centre d'aide</p>
                <p className="text-sm text-muted-foreground">Guides et tutoriels</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </motion.div>

      {/* Email Confirmation Notice */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-center text-sm text-muted-foreground"
      >
        <p>
          Un email de confirmation a été envoyé à votre adresse email.
          <br />
          Si vous avez des questions, contactez-nous à{' '}
          <a href="mailto:support@bizgen.ai" className="text-primary hover:underline">
            support@bizgen.ai
          </a>
        </p>
      </motion.div>
    </div>
  );
}
