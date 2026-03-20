'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
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
  Loader2,
  Star,
  Gift,
  CheckCircle2,
  HelpCircle
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

  // Check if user can upgrade
  const canUpgrade = userPlan !== 'PRO';

  // Get usage stats from session
  const projectsUsed = (session?.user as { projectsUsed?: number })?.projectsUsed || 0;
  const exportsUsed = (session?.user as { exportsUsed?: number })?.exportsUsed || 0;
  const currentPlanLimits = PLAN_LIMITS[userPlan as keyof typeof PLAN_LIMITS];

  const handleSubscribe = (planId: string) => {
    setLoadingPlan(planId);
    router.push(`/subscription/checkout?plan=${planId.toUpperCase()}`);
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <Badge variant="outline" className="mb-2 px-4 py-1 border-primary/30">
            <CreditCard className="w-3 h-3 mr-1" />
            Abonnement
          </Badge>
          <h1 className="text-2xl md:text-3xl font-bold">
            Votre <span className="gradient-text">abonnement</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Gérez votre abonnement et accédez à plus de fonctionnalités
          </p>
        </div>
        {userPlan !== 'FREE' && (
          <Badge className="text-base px-5 py-2 btn-gradient shadow-lg shadow-primary/25">
            <Crown className="w-4 h-4 mr-2" />
            Plan {userPlan}
          </Badge>
        )}
      </div>

      {/* Current Plan Card */}
      <Card className="border-primary/30 bg-gradient-to-r from-primary/5 to-emerald-500/5 shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center shadow-lg shadow-primary/25">
                {userPlan === 'FREE' ? (
                  <Gift className="w-7 h-7 text-primary-foreground" />
                ) : (
                  <Crown className="w-7 h-7 text-primary-foreground" />
                )}
              </div>
              <div>
                <CardTitle className="text-xl">Plan actuel</CardTitle>
                <CardDescription>Votre abonnement et ses avantages</CardDescription>
              </div>
            </div>
            <Badge className="text-base px-4 py-1 bg-gradient-to-r from-primary to-emerald-600">
              {userPlan}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Projects */}
            <div className="p-4 rounded-xl bg-muted/50 border border-border/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Projets créés</span>
                <span className="font-bold">{projectsUsed} / {currentPlanLimits?.maxProjects === -1 ? '∞' : currentPlanLimits?.maxProjects}</span>
              </div>
              <Progress 
                value={currentPlanLimits?.maxProjects === -1 ? 0 : (projectsUsed / currentPlanLimits.maxProjects) * 100} 
                className="h-2" 
              />
            </div>
            
            {/* Exports */}
            <div className="p-4 rounded-xl bg-muted/50 border border-border/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Exports ce mois</span>
                <span className="font-bold">{exportsUsed} / {currentPlanLimits?.maxExports === -1 ? '∞' : currentPlanLimits?.maxExports}</span>
              </div>
              <Progress 
                value={currentPlanLimits?.maxExports === -1 ? 0 : (exportsUsed / currentPlanLimits.maxExports) * 100} 
                className="h-2" 
              />
            </div>
          </div>
          
          <div className="mt-4">
            <p className="font-medium text-sm mb-2">Avantages inclus</p>
            <div className="grid grid-cols-2 gap-2">
              {currentPlanLimits?.features.slice(0, 4).map((feature, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upgrade Plans */}
      {canUpgrade && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold">Passez à un plan supérieur</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {PRICING_PLANS
              .filter(p => {
                if (userPlan === 'FREE') return p.id === 'basic' || p.id === 'pro';
                if (userPlan === 'BASIC') return p.id === 'pro';
                return false;
              })
              .map((plan, index) => (
                <Card 
                  key={plan.id} 
                  className={`
                    relative overflow-hidden border-border/50 bg-card/80 backdrop-blur 
                    shadow-xl animate-fade-in-up card-hover
                    ${plan.popular ? 'border-primary/30 ring-2 ring-primary/20' : ''}
                  `}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {plan.popular && (
                    <div className="absolute top-4 right-4">
                      <Badge className="rounded-lg bg-gradient-to-r from-primary to-emerald-600 text-primary-foreground shadow-lg">
                        <Star className="w-3 h-3 mr-1" />
                        Recommandé
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                      <div className={`
                        w-12 h-12 rounded-xl flex items-center justify-center
                        ${plan.popular ? 'bg-gradient-to-br from-primary to-emerald-600' : 'bg-muted'}
                      `}>
                        {plan.id === 'pro' ? (
                          <Crown className={`w-6 h-6 ${plan.popular ? 'text-white' : 'text-primary'}`} />
                        ) : (
                          <Zap className={`w-6 h-6 ${plan.popular ? 'text-white' : 'text-primary'}`} />
                        )}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{plan.name}</CardTitle>
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-bold gradient-text">{plan.price}{plan.currency}</span>
                          <span className="text-sm text-muted-foreground">/{plan.period}</span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4 py-4">
                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                    <ul className="space-y-2">
                      {plan.features.slice(0, 5).map((feature, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  
                  <CardFooter className="pt-0">
                    <Button 
                      className={`w-full rounded-xl ${plan.popular ? 'btn-gradient shadow-lg shadow-primary/25' : ''}`}
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
                    <p className="text-xs text-center text-muted-foreground mt-2 w-full">
                      Annulation à tout moment
                    </p>
                  </CardFooter>
                </Card>
              ))}
          </div>
        </div>
      )}

      {/* Payment Methods */}
      <Card className="border-border/50 bg-card/80 backdrop-blur shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-primary" />
            Moyens de paiement
          </CardTitle>
          <CardDescription>
            Nous acceptons plusieurs méthodes de paiement adaptées à l'Afrique
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: CreditCard, name: 'Carte bancaire', sub: 'Visa, Mastercard', color: 'from-blue-500 to-blue-600' },
              { icon: Smartphone, name: 'MTN MoMo', sub: 'Cameroun, Ghana', color: 'from-yellow-500 to-yellow-600' },
              { icon: Smartphone, name: 'Orange Money', sub: 'Cameroun, Sénégal', color: 'from-orange-500 to-orange-600' },
              { icon: Smartphone, name: 'Wave', sub: 'Sénégal, CI', color: 'from-cyan-500 to-cyan-600' },
            ].map((method, i) => (
              <div key={i} className="p-4 rounded-xl border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all text-center group">
                <div className={`
                  w-10 h-10 rounded-xl bg-gradient-to-br ${method.color} flex items-center justify-center mx-auto mb-2
                  group-hover:scale-110 transition-transform
                `}>
                  <method.icon className="w-5 h-5 text-white" />
                </div>
                <p className="font-medium text-sm">{method.name}</p>
                <p className="text-xs text-muted-foreground">{method.sub}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Guarantees */}
      <div className="grid md:grid-cols-3 gap-4">
        {[
          { icon: Shield, title: 'Paiement sécurisé', desc: 'Données protégées par SSL' },
          { icon: Clock, title: 'Annulation facile', desc: 'À tout moment, sans engagement' },
          { icon: Sparkles, title: 'Satisfaction garantie', desc: '7 jours pour changer d\'avis' },
        ].map((guarantee, i) => (
          <div key={i} className="p-4 rounded-xl bg-card/80 border border-border/50 flex items-center gap-4">
            <div className={`
              w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center shrink-0
            `}>
              <guarantee.icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-medium text-sm">{guarantee.title}</p>
              <p className="text-xs text-muted-foreground">{guarantee.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-emerald-500/5">
        <CardContent className="py-8 text-center">
          <HelpCircle className="w-10 h-10 mx-auto text-primary mb-4" />
          <h3 className="text-xl font-bold mb-2">Besoin d'aide?</h3>
          <p className="text-muted-foreground mb-6">
            Notre équipe support est disponible pour répondre à vos questions.
          </p>
          <Link href="/help">
            <Button variant="outline" className="rounded-xl hover:bg-primary/10 hover:border-primary/30">
              Contacter le support
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
