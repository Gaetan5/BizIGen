'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight, 
  Check, 
  Zap, 
  FileText, 
  Target, 
  Users, 
  TrendingUp,
  Clock,
  Shield,
  Globe,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { PRICING_PLANS } from '@/lib/constants';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl">BizGen AI</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
              Fonctionnalités
            </Link>
            <Link href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">
              Tarifs
            </Link>
            <Link href="#testimonials" className="text-muted-foreground hover:text-foreground transition-colors">
              Témoignages
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost">Connexion</Button>
            </Link>
            <Link href="/register">
              <Button>Commencer gratuitement</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4 px-4 py-1">
              <Zap className="w-3 h-3 mr-1" />
              Propulsé par l'IA
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              Votre <span className="gradient-text">Business Plan complet</span>
              <br />en 20 minutes au lieu de 40 heures
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Générez automatiquement votre Business Model Canvas, Lean Canvas et Business Plan 
              professionnel grâce à l'IA. Adapté aux entrepreneurs africains.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link href="/register">
                <Button size="lg" className="gap-2 px-8">
                  Commencer gratuitement
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="#demo">
                <Button variant="outline" size="lg">
                  Voir la démo
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div>
                <div className="text-3xl font-bold text-primary">500+</div>
                <div className="text-sm text-muted-foreground">Entrepreneurs</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">1,200+</div>
                <div className="text-sm text-muted-foreground">Documents générés</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">4.8/5</div>
                <div className="text-sm text-muted-foreground">Satisfaction</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Tout ce dont vous avez besoin</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Des outils professionnels pour structurer votre projet et convaincre vos partenaires
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={<FileText className="w-6 h-6" />}
              title="Business Model Canvas"
              description="Visualisez votre modèle économique avec les 9 blocs clés. Exportable en PNG ou PDF."
            />
            <FeatureCard
              icon={<Target className="w-6 h-6" />}
              title="Lean Canvas"
              description="Idéal pour les startups: problem-solution fit, métriques clés, avantage déloyal."
            />
            <FeatureCard
              icon={<FileText className="w-6 h-6" />}
              title="Business Plan complet"
              description="Document de 20-50 pages avec analyse marché, SWOT, prévisions financières."
            />
            <FeatureCard
              icon={<Clock className="w-6 h-6" />}
              title="Rapide & Efficace"
              description="Répondez à un formulaire intelligent en 15-20 min, obtenez vos documents instantanément."
            />
            <FeatureCard
              icon={<Globe className="w-6 h-6" />}
              title="Adapté à l'Afrique"
              description="Contextualisé pour les marchés africains: Mobile Money, réglementations locales, etc."
            />
            <FeatureCard
              icon={<Shield className="w-6 h-6" />}
              title="Sécurisé & Confidentiel"
              description="Vos données business sont chiffrées et ne sont jamais partagées."
            />
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Comment ça marche ?</h2>
            <p className="text-muted-foreground">3 étapes simples pour vos documents professionnels</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <StepCard
              number={1}
              title="Répondez au formulaire"
              description="Questions adaptées à votre secteur (tech, agriculture, services...). Sauvegarde automatique."
            />
            <StepCard
              number={2}
              title="L'IA génère vos documents"
              description="Business Model Canvas, Lean Canvas et Business Plan créés en moins de 45 secondes."
            />
            <StepCard
              number={3}
              title="Éditez et exportez"
              description="Personnalisez les résultats, exportez en PDF/Word, partagez avec vos partenaires."
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Tarifs simples et transparents</h2>
            <p className="text-muted-foreground">Commencez gratuitement, évoluez selon vos besoins</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {PRICING_PLANS.map((plan) => (
              <PricingCard key={plan.id} {...plan} />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Ils nous font confiance</h2>
            <p className="text-muted-foreground">Des entrepreneurs satisfaits à travers l'Afrique</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <TestimonialCard
              quote="J'ai pu présenter un business plan complet à mon investisseur en 2 jours au lieu de 3 semaines. L'IA a bien compris le contexte agricole camerounais."
              author="Marie N."
              role="Fondatrice, AgriConnect Douala"
              avatar="MN"
            />
            <TestimonialCard
              quote="Le Lean Canvas généré était déjà très pertinent. J'ai juste eu à ajuster 2-3 points. Gain de temps énorme pour ma startup tech."
              author="Jean-Pierre K."
              role="CEO, TechHub Yaoundé"
              avatar="JP"
            />
            <TestimonialCard
              quote="Enfin un outil qui comprend les réalités africaines: Mobile Money, chaînes d'approvisionnement locales, réglementations CEMAC..."
              author="Aminata D."
              role="Consultante, Dakar"
              avatar="AD"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Prêt à accélérer votre projet ?</h2>
          <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
            Rejoignez les 500+ entrepreneurs qui utilisent BizGen AI pour structurer leur business
          </p>
          <Link href="/register">
            <Button size="lg" variant="secondary" className="gap-2 px-8">
              Créer mon compte gratuit
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="font-bold text-xl">BizGen AI</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Plateforme SaaS d'automatisation de documents business pour entrepreneurs africains.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Produit</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#features" className="hover:text-foreground">Fonctionnalités</Link></li>
                <li><Link href="#pricing" className="hover:text-foreground">Tarifs</Link></li>
                <li><Link href="#" className="hover:text-foreground">Templates</Link></li>
                <li><Link href="#" className="hover:text-foreground">API</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Entreprise</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground">À propos</Link></li>
                <li><Link href="#" className="hover:text-foreground">Blog</Link></li>
                <li><Link href="#" className="hover:text-foreground">Carrières</Link></li>
                <li><Link href="#" className="hover:text-foreground">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Légal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground">Confidentialité</Link></li>
                <li><Link href="#" className="hover:text-foreground">CGU</Link></li>
                <li><Link href="#" className="hover:text-foreground">RGPD</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>© 2026 BizGen AI. Tous droits réservés. Fait avec ❤️ à Douala, Cameroun.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Component: Feature Card
function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-2">
          {icon}
        </div>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-base">{description}</CardDescription>
      </CardContent>
    </Card>
  );
}

// Component: Step Card
function StepCard({ number, title, description }: { number: number; title: string; description: string }) {
  return (
    <div className="text-center">
      <div className="w-14 h-14 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
        {number}
      </div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}

// Component: Pricing Card
function PricingCard({ 
  name, 
  price, 
  currency, 
  period, 
  description, 
  features, 
  cta, 
  popular 
}: { 
  name: string; 
  price: number; 
  currency: string; 
  period: string;
  description: string;
  features: string[];
  cta: string;
  popular: boolean;
}) {
  return (
    <Card className={`h-full relative ${popular ? 'border-primary shadow-lg' : ''}`}>
      {popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="bg-primary text-primary-foreground">Populaire</Badge>
        </div>
      )}
      <CardHeader className="text-center">
        <CardTitle>{name}</CardTitle>
        <div className="mt-4">
          <span className="text-4xl font-bold">{price === 0 ? 'Gratuit' : `${price}${currency}`}</span>
          {price > 0 && <span className="text-muted-foreground">/{period}</span>}
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {features.map((feature, i) => (
            <li key={i} className="flex items-start gap-2">
              <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Link href="/register" className="w-full">
          <Button className="w-full" variant={popular ? 'default' : 'outline'}>
            {cta}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

// Component: Testimonial Card
function TestimonialCard({ 
  quote, 
  author, 
  role, 
  avatar 
}: { 
  quote: string; 
  author: string; 
  role: string; 
  avatar: string;
}) {
  return (
    <Card className="h-full">
      <CardContent className="pt-6">
        <p className="text-muted-foreground italic mb-4">"{quote}"</p>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold text-sm">
            {avatar}
          </div>
          <div>
            <div className="font-semibold">{author}</div>
            <div className="text-sm text-muted-foreground">{role}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
// Force recompile 1772736899
