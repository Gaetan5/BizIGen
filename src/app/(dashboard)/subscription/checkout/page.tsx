'use client';

import { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CreditCard, 
  Check, 
  Loader2, 
  ArrowLeft, 
  Shield, 
  Lock,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { paymentApi } from '@/lib/fastapi-client';

const PLAN_PRICES = {
  BASIC: {
    eur: 7,
    xaf: 4500,
    name: 'Basic',
    features: ['5 projets par mois', 'Business Plan complet', 'Exports PDF sans watermark', 'Support prioritaire', 'Templates sectoriels'],
  },
  PRO: {
    eur: 19,
    xaf: 12500,
    name: 'Pro',
    features: ['Projets illimités', 'Toutes les fonctionnalités Basic', 'Exports Word/DOCX', 'API access', 'Support dédié', 'Mises à jour prioritaires'],
  },
};

type PaymentProvider = 'stripe' | 'flutterwave';
type Currency = 'EUR' | 'XAF';

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  
  const plan = (searchParams.get('plan') as 'BASIC' | 'PRO') || 'BASIC';
  const planData = PLAN_PRICES[plan];
  
  const [currency, setCurrency] = useState<Currency>('EUR');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Derive provider from currency - XAF always uses Flutterwave
  const provider = useMemo<PaymentProvider>(() => {
    return currency === 'XAF' ? 'flutterwave' : 'stripe';
  }, [currency]);

  const handleStripeCheckout = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const baseUrl = window.location.origin;
      const successUrl = `${baseUrl}/subscription/success?plan=${plan}&provider=stripe`;
      const cancelUrl = `${baseUrl}/subscription/checkout?plan=${plan}&canceled=true`;

      const result = await paymentApi.createStripeCheckout(plan, successUrl, cancelUrl);

      if (result.success && result.data?.checkout_url) {
        window.location.href = result.data.checkout_url;
      } else {
        setError(result.error || 'Erreur lors de la création de la session de paiement');
        setIsLoading(false);
      }
    } catch (err) {
      setError('Une erreur inattendue est survenue');
      setIsLoading(false);
    }
  };

  const handleFlutterwaveCheckout = async () => {
    if (currency === 'XAF' && !phone) {
      setError('Veuillez entrer votre numéro de téléphone pour Mobile Money');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const baseUrl = window.location.origin;
      const redirectUrl = `${baseUrl}/subscription/success?plan=${plan}&provider=flutterwave`;

      const result = await paymentApi.createFlutterwavePayment(plan, redirectUrl, phone || undefined);

      if (result.success && result.data?.payment_url) {
        window.location.href = result.data.payment_url;
      } else {
        setError(result.error || 'Erreur lors de la création du paiement Flutterwave');
        setIsLoading(false);
      }
    } catch (err) {
      setError('Une erreur inattendue est survenue');
      setIsLoading(false);
    }
  };

  const handlePayment = () => {
    if (provider === 'stripe') {
      handleStripeCheckout();
    } else {
      handleFlutterwaveCheckout();
    }
  };

  const price = currency === 'EUR' ? planData.eur : planData.xaf;
  const priceDisplay = currency === 'EUR' ? `${price}€` : `${price.toLocaleString()} XAF`;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/subscription">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Finaliser votre abonnement</h1>
          <p className="text-muted-foreground">
            Plan sélectionné: <span className="font-medium text-foreground">{planData.name}</span>
          </p>
        </div>
      </div>

      {/* Canceled Alert */}
      {searchParams.get('canceled') && (
        <Alert variant="destructive">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>
            Le paiement a été annulé. Vous pouvez réessayer quand vous le souhaitez.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Order Summary */}
        <Card className="lg:col-span-2 h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Récapitulatif
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Plan {planData.name}</p>
                <p className="text-sm text-muted-foreground">Abonnement mensuel</p>
              </div>
              <Badge variant="secondary">{plan}</Badge>
            </div>

            <Separator />

            <ul className="space-y-2">
              {planData.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>

            <Separator />

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Sous-total</span>
                <span>{priceDisplay}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>TVA</span>
                <span>Incluse</span>
              </div>
              <Separator />
              <div className="flex justify-between font-medium text-lg">
                <span>Total</span>
                <span>{priceDisplay}/mois</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Form */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Moyen de paiement</CardTitle>
            <CardDescription>
              Choisissez votre devise et votre méthode de paiement préférée
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Currency Selection */}
            <div className="space-y-3">
              <Label className="text-base">Devise</Label>
              <RadioGroup
                value={currency}
                onValueChange={(v) => setCurrency(v as Currency)}
                className="grid grid-cols-2 gap-4"
              >
                <div>
                  <RadioGroupItem
                    value="EUR"
                    id="eur"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="eur"
                    className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary cursor-pointer [&:has(:checked)]:border-primary"
                  >
                    <span className="text-2xl mb-1">€</span>
                    <span className="font-medium">Euro (EUR)</span>
                    <span className="text-sm text-muted-foreground">Carte bancaire</span>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem
                    value="XAF"
                    id="xaf"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="xaf"
                    className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary cursor-pointer [&:has(:checked)]:border-primary"
                  >
                    <span className="text-2xl mb-1">💰</span>
                    <span className="font-medium">Franc CFA (XAF)</span>
                    <span className="text-sm text-muted-foreground">Mobile Money</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Payment Info for EUR */}
            {currency === 'EUR' && (
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-6 h-6 text-primary" />
                  <div>
                    <span className="font-medium">Paiement par carte bancaire</span>
                    <p className="text-sm text-muted-foreground">Visa, Mastercard via Stripe</p>
                  </div>
                </div>
              </div>
            )}

            {/* Phone number for Mobile Money (XAF) */}
            {currency === 'XAF' && (
              <div className="space-y-3">
                <Label htmlFor="phone" className="text-base">
                  Numéro Mobile Money
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+237 6XX XXX XXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="text-lg"
                />
                <p className="text-sm text-muted-foreground">
                  MTN Mobile Money, Orange Money, Wave acceptés selon votre pays
                </p>
              </div>
            )}

            {/* Payment Methods Info for XAF */}
            {currency === 'XAF' && (
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 border rounded-lg text-center">
                  <div className="text-sm font-medium">MTN</div>
                  <div className="text-xs text-muted-foreground">Mobile Money</div>
                </div>
                <div className="p-3 border rounded-lg text-center">
                  <div className="text-sm font-medium">Orange</div>
                  <div className="text-xs text-muted-foreground">Orange Money</div>
                </div>
                <div className="p-3 border rounded-lg text-center">
                  <div className="text-sm font-medium">Wave</div>
                  <div className="text-xs text-muted-foreground">Sénégal, CI</div>
                </div>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="w-4 h-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Security Notice */}
            <div className="flex items-start gap-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
              <Shield className="w-4 h-4 mt-0.5 shrink-0" />
              <p>
                Paiement sécurisé par {provider === 'stripe' ? 'Stripe' : 'Flutterwave'}. 
                Vos informations bancaires sont cryptées et ne sont jamais stockées sur nos serveurs.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button
              className="w-full"
              size="lg"
              onClick={handlePayment}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Traitement en cours...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  Payer {priceDisplay}
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              En cliquant sur "Payer", vous acceptez nos{' '}
              <Link href="/help" className="underline hover:text-foreground">
                conditions d'utilisation
              </Link>{' '}
              et{' '}
              <Link href="/help" className="underline hover:text-foreground">
                politique de confidentialité
              </Link>
              .
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
