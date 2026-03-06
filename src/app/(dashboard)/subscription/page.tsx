'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Check, 
  Sparkles, 
  CreditCard, 
  Smartphone,
  Crown,
  Zap,
  Shield,
  Clock,
  ArrowRight,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { PRICING_PLANS } from '@/lib/constants';
import { PLAN_LIMITS } from '@/types';

export default function SubscriptionPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const userPlan = (session?.user as { plan?: string })?.plan || 'FREE';
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleSubscribe = (planId: string) => {
    setLoadingPlan(planId);
    router.push(`/subscription/checkout?plan=${planId.toUpperCase()}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Abonnement</h1>
          <p className="text-muted-foreground">
            Gérez votre abonnement et accédez à plus de fonctionnalités
          </p>
        </div>
        {userPlan !== 'FREE' && (
          <Badge variant="default" className="text-lg px-4 py-2 w-fit">
            <Crown className="w-4 h-4 mr-2" />
            Plan {userPlan}
          </Badge>
        )}
      </div>

      {/* Current Plan */}
      <Card className="border-primary/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Plan actuel</CardTitle>
              <CardDescription>Votre abonnement actuel</CardDescription>
            </div>
            <Badge className="text-lg px-4 py-1">{userPlan}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {PLAN_LIMITS[userPlan as keyof typeof PLAN_LIMITS]?.features.map((feature, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-primary" />
                {feature}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Upgrade Plans */}
      {userPlan !== 'PRO' && (
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Passer à un plan supérieur
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {PRICING_PLANS.filter(p => {
              if (userPlan === 'FREE') return p.id === 'basic' || p.id === 'pro';
              if (userPlan === 'BASIC') return p.id === 'pro';
              return false;
            }).map(plan => (
              <Card 
                key={plan.id} 
                className={`relative overflow-hidden ${plan.popular ? 'border-primary shadow-lg' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0">
                    <Badge className="rounded-bl-lg rounded-tr-none rounded-br-none">
                      Recommandé
                    </Badge>
                  </div>
                )}
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2">
                    {plan.name}
                    {plan.id === 'pro' && <Crown className="w-5 h-5 text-primary" />}
                  </CardTitle>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold">{plan.price}{plan.currency}</span>
                    <span className="text-muted-foreground">/{plan.period}</span>
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  {/* Pricing in XAF for African users */}
                  {plan.id !== 'free' && (
                    <div className="pt-2">
                      <Separator />
                      <div className="pt-3 flex items-center gap-2 text-sm text-muted-foreground">
                        <Smartphone className="w-4 h-4" />
                        <span>
                          {plan.id === 'basic' ? '4 500 XAF' : '12 500 XAF'}/mois (Mobile Money)
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex flex-col gap-3">
                  <Button 
                    className="w-full" 
                    variant={plan.popular ? 'default' : 'outline'}
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={loadingPlan === plan.id}
                  >
                    {loadingPlan === plan.id ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Redirection...
                      </>
                    ) : (
                      <>
                        {plan.cta}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    Annulation à tout moment
                  </p>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle>Moyens de paiement</CardTitle>
          <CardDescription>
            Nous acceptons plusieurs méthodes de paiement adaptées à l'Afrique
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 border rounded-lg text-center hover:bg-accent/50 transition-colors">
              <CreditCard className="w-8 h-8 mx-auto mb-2 text-primary" />
              <div className="font-medium">Carte bancaire</div>
              <div className="text-sm text-muted-foreground">Visa, Mastercard</div>
            </div>
            <div className="p-4 border rounded-lg text-center hover:bg-accent/50 transition-colors">
              <Smartphone className="w-8 h-8 mx-auto mb-2 text-primary" />
              <div className="font-medium">MTN Mobile Money</div>
              <div className="text-sm text-muted-foreground">Cameroun, Ghana</div>
            </div>
            <div className="p-4 border rounded-lg text-center hover:bg-accent/50 transition-colors">
              <Smartphone className="w-8 h-8 mx-auto mb-2 text-primary" />
              <div className="font-medium">Orange Money</div>
              <div className="text-sm text-muted-foreground">Cameroun, Sénégal</div>
            </div>
            <div className="p-4 border rounded-lg text-center hover:bg-accent/50 transition-colors">
              <Smartphone className="w-8 h-8 mx-auto mb-2 text-primary" />
              <div className="font-medium">Wave</div>
              <div className="text-sm text-muted-foreground">Sénégal, Côte d'Ivoire</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Guarantees */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6 flex items-start gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="font-medium">Paiement sécurisé</p>
              <p className="text-sm text-muted-foreground">
                Vos données sont protégées par un chiffrement SSL
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-start gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="font-medium">Annulation à tout moment</p>
              <p className="text-sm text-muted-foreground">
                Pas d'engagement, vous pouvez annuler quand vous voulez
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex items-start gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="font-medium">Satisfaction garantie</p>
              <p className="text-sm text-muted-foreground">
                7 jours pour changer d'avis, remboursé intégralement
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle>Questions fréquentes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium">Puis-je annuler à tout moment ?</h4>
            <p className="text-sm text-muted-foreground">
              Oui, vous pouvez annuler votre abonnement à tout moment. Vous conserverez l'accès jusqu'à la fin de la période facturée.
            </p>
          </div>
          <Separator />
          <div>
            <h4 className="font-medium">Que se passe-t-il si je dépasse mes quotas ?</h4>
            <p className="text-sm text-muted-foreground">
              Vous serez invité à passer au plan supérieur. Vos projets existants ne seront pas supprimés.
            </p>
          </div>
          <Separator />
          <div>
            <h4 className="font-medium">Proposez-vous des réductions pour les startups ?</h4>
            <p className="text-sm text-muted-foreground">
              Oui ! Contactez-nous pour bénéficier d'un tarif préférentiel si vous êtes incubé ou si vous faites partie d'un programme d'accélération.
            </p>
          </div>
          <Separator />
          <div>
            <h4 className="font-medium">Comment fonctionne le paiement Mobile Money ?</h4>
            <p className="text-sm text-muted-foreground">
              Lors du paiement, vous serez redirigé vers Flutterwave pour compléter la transaction via MTN Mobile Money, Orange Money ou Wave selon votre pays.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Need Help */}
      <Alert>
        <Sparkles className="w-4 h-4" />
        <AlertDescription className="flex items-center justify-between flex-wrap gap-2">
          <span>Besoin d'aide pour choisir le bon plan ?</span>
          <Link href="/help">
            <Button variant="outline" size="sm">
              Contacter le support
            </Button>
          </Link>
        </AlertDescription>
      </Alert>
    </div>
  );
}
