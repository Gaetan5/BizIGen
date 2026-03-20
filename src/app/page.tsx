'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BizGenLogo } from '@/components/ui/logo';
import { 
  ArrowRight, 
  Check, 
  Zap, 
  FileText, 
  Target, 
  Users, 
  Clock,
  Shield,
  Globe,
  Sparkles,
  Play,
  Star,
  Rocket,
  Lightbulb,
  BarChart3,
  MessageSquare,
  Building2,
  TrendingUp,
  Heart,
  Award
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { PRICING_PLANS } from '@/lib/constants';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <BizGenLogo size="md" showText animated />
          
          <nav className="hidden md:flex items-center gap-8">
            <NavLink href="#features">Fonctionnalités</NavLink>
            <NavLink href="#pricing">Tarifs</NavLink>
            <NavLink href="#testimonials">Témoignages</NavLink>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="hover:bg-primary/10 hover:text-primary font-medium">Connexion</Button>
            </Link>
            <Link href="/register">
              <Button className="btn-gradient shadow-lg shadow-primary/30 font-medium">
                Commencer gratuitement
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-24 md:py-36 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 hero-gradient" />
        <div className="absolute inset-0 hero-mesh opacity-20" />
        <div className="absolute inset-0 pattern-circuit" />
        
        {/* Floating Orbs */}
        <motion.div 
          className="absolute top-20 left-10 w-72 h-72 bg-primary/15 rounded-full blur-3xl"
          animate={{ 
            y: [0, -30, 0],
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute top-40 right-20 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl"
          animate={{ 
            y: [0, 20, 0],
            x: [0, -20, 0],
            scale: [1, 1.15, 1]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-20 left-1/3 w-64 h-64 bg-primary/10 rounded-full blur-2xl"
          animate={{ 
            y: [0, 15, 0],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Animated lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30">
          <motion.line
            x1="0%" y1="30%" x2="100%" y2="70%"
            stroke="url(#lineGradient)"
            strokeWidth="1"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.3 }}
            transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
          />
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(25, 90%, 50%)" />
              <stop offset="100%" stopColor="hsl(40, 85%, 50%)" />
            </linearGradient>
          </defs>
        </svg>
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-5xl mx-auto text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge variant="secondary" className="mb-8 px-5 py-2.5 text-sm font-medium border border-primary/30 bg-primary/5 backdrop-blur-sm gap-2">
                <Zap className="w-4 h-4 text-primary" />
                Propulsé par l'Intelligence Artificielle
                <Sparkles className="w-4 h-4 text-primary animate-pulse" />
              </Badge>
            </motion.div>
            
            {/* Headline */}
            <motion.h1 
              className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-8 leading-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Votre <span className="gradient-text-animated">Business Plan</span>
              <br />complet en <span className="relative inline-block">
                <span className="text-primary">20 minutes</span>
                <motion.svg 
                  className="absolute -bottom-2 left-0 w-full" 
                  viewBox="0 0 200 8" 
                  fill="none"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1, delay: 0.8 }}
                >
                  <motion.path 
                    d="M2 6C50 2 150 2 198 6" 
                    stroke="hsl(25, 90%, 50%)" 
                    strokeWidth="3" 
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.5, delay: 0.5 }}
                  />
                </motion.svg>
              </span>
            </motion.h1>
            
            {/* Subheadline */}
            <motion.p 
              className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Générez automatiquement votre <strong className="text-foreground">Business Model Canvas</strong>, <strong className="text-foreground">Lean Canvas</strong> et <strong className="text-foreground">Business Plan</strong> professionnel. 
              <span className="block mt-2 text-primary font-semibold">✓ Adapté aux entrepreneurs africains</span>
            </motion.p>

            {/* CTA Buttons */}
            <motion.div 
              className="flex flex-col sm:flex-row items-center justify-center gap-5 mb-20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Link href="/register">
                <Button size="lg" className="btn-gradient gap-3 px-10 py-7 text-lg shadow-2xl shadow-primary/30 hover:shadow-primary/50 hover:scale-105 transition-all font-semibold group">
                  <Rocket className="w-5 h-5 group-hover:animate-bounce" />
                  Commencer gratuitement
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/demo">
                <Button variant="outline" size="lg" className="gap-3 px-10 py-7 text-lg border-2 border-primary/30 hover:bg-primary/5 hover:border-primary font-semibold group">
                  <Play className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                  Voir la démo
                </Button>
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div 
              className="grid grid-cols-3 gap-6 max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <StatCard number="500+" label="Entrepreneurs" icon={<Users className="w-5 h-5" />} delay={0} />
              <StatCard number="1,200+" label="Documents générés" icon={<FileText className="w-5 h-5" />} delay={0.1} />
              <StatCard number="4.8/5" label="Satisfaction" icon={<Star className="w-5 h-5" />} delay={0.2} />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="py-16 border-y bg-muted/30 relative overflow-hidden">
        <div className="absolute inset-0 pattern-african opacity-50" />
        <div className="container mx-auto px-4 relative">
          <p className="text-center text-muted-foreground mb-8 font-medium">Ils nous font confiance</p>
          <div className="flex flex-wrap justify-center items-center gap-12">
            <TrustBadge icon={<Building2 className="w-8 h-8" />} name="TechHub" />
            <TrustBadge icon={<Award className="w-8 h-8" />} name="AgriConnect" />
            <TrustBadge icon={<TrendingUp className="w-8 h-8" />} name="StartupAfrica" />
            <TrustBadge icon={<Globe className="w-8 h-8" />} name="CEMAC Ventures" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-muted/50 via-background to-muted/30" />
        <div className="absolute inset-0 pattern-circuit opacity-50" />
        
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Badge variant="outline" className="mb-6 px-5 py-2 border-primary/30 text-primary font-medium">Fonctionnalités</Badge>
              <h2 className="text-3xl md:text-5xl font-bold mb-6">
                Tout ce dont vous avez <span className="gradient-text">besoin</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Des outils professionnels pour structurer votre projet et convaincre vos partenaires
              </p>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<FileText className="w-7 h-7" />}
              title="Business Model Canvas"
              description="Visualisez votre modèle économique avec les 9 blocs clés. Exportable en PNG ou PDF."
              color="orange"
              delay={0}
            />
            <FeatureCard
              icon={<Target className="w-7 h-7" />}
              title="Lean Canvas"
              description="Idéal pour les startups: problem-solution fit, métriques clés, avantage déloyal."
              color="gold"
              delay={0.1}
            />
            <FeatureCard
              icon={<BarChart3 className="w-7 h-7" />}
              title="Business Plan complet"
              description="Document de 20-50 pages avec analyse marché, SWOT, prévisions financières."
              color="orange"
              delay={0.2}
            />
            <FeatureCard
              icon={<Clock className="w-7 h-7" />}
              title="Rapide & Efficace"
              description="Répondez à un formulaire intelligent en 15-20 min, obtenez vos documents instantanément."
              color="gold"
              delay={0.3}
            />
            <FeatureCard
              icon={<Globe className="w-7 h-7" />}
              title="Adapté à l'Afrique"
              description="Contextualisé pour les marchés africains: Mobile Money, réglementations locales, etc."
              color="orange"
              delay={0.4}
            />
            <FeatureCard
              icon={<Shield className="w-7 h-7" />}
              title="Sécurisé & Confidentiel"
              description="Vos données business sont chiffrées et ne sont jamais partagées."
              color="gold"
              delay={0.5}
            />
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-28 bg-muted/30 relative overflow-hidden">
        <div className="absolute inset-0 pattern-african opacity-30" />
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-20">
            <Badge variant="outline" className="mb-6 px-5 py-2 border-primary/30 text-primary font-medium">Comment ça marche</Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              3 étapes <span className="gradient-text">simples</span>
            </h2>
            <p className="text-lg text-muted-foreground">Pour vos documents professionnels en quelques minutes</p>
          </div>

          <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto">
            <StepCard
              number={1}
              title="Répondez au formulaire"
              description="Questions adaptées à votre secteur (tech, agriculture, services...). Sauvegarde automatique."
              icon={<MessageSquare className="w-7 h-7" />}
              delay={0}
            />
            <StepCard
              number={2}
              title="L'IA génère vos documents"
              description="Business Model Canvas, Lean Canvas et Business Plan créés en moins de 45 secondes."
              icon={<Sparkles className="w-7 h-7" />}
              delay={0.2}
            />
            <StepCard
              number={3}
              title="Éditez et exportez"
              description="Personnalisez les résultats, exportez en PDF/Word, partagez avec vos partenaires."
              icon={<FileText className="w-7 h-7" />}
              delay={0.4}
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-muted/50 via-background to-transparent" />
        <div className="absolute inset-0 pattern-circuit opacity-30" />
        
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-20">
            <Badge variant="outline" className="mb-6 px-5 py-2 border-primary/30 text-primary font-medium">Tarifs</Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Des tarifs <span className="gradient-text">simples et transparents</span>
            </h2>
            <p className="text-lg text-muted-foreground">Commencez gratuitement, évoluez selon vos besoins</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {PRICING_PLANS.map((plan, index) => (
              <PricingCard key={plan.id} {...plan} delay={index * 0.1} />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-28 bg-muted/30 relative overflow-hidden">
        <div className="absolute inset-0 pattern-african opacity-30" />
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-20">
            <Badge variant="outline" className="mb-6 px-5 py-2 border-primary/30 text-primary font-medium">Témoignages</Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Ils nous font <span className="gradient-text">confiance</span>
            </h2>
            <p className="text-lg text-muted-foreground">Des entrepreneurs satisfaits à travers l'Afrique</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <TestimonialCard
              quote="J'ai pu présenter un business plan complet à mon investisseur en 2 jours au lieu de 3 semaines. L'IA a bien compris le contexte agricole camerounais."
              author="Marie N."
              role="Fondatrice, AgriConnect Douala"
              avatar="MN"
              rating={5}
              delay={0}
            />
            <TestimonialCard
              quote="Le Lean Canvas généré était déjà très pertinent. J'ai juste eu à ajuster 2-3 points. Gain de temps énorme pour ma startup tech."
              author="Jean-Pierre K."
              role="CEO, TechHub Yaoundé"
              avatar="JP"
              rating={5}
              delay={0.1}
            />
            <TestimonialCard
              quote="Enfin un outil qui comprend les réalités africaines: Mobile Money, chaînes d'approvisionnement locales, réglementations CEMAC..."
              author="Aminata D."
              role="Consultante, Dakar"
              avatar="AD"
              rating={5}
              delay={0.2}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-[hsl(35,85%,45%)] to-[hsl(40,80%,40%)]" />
        <div className="absolute inset-0 hero-mesh opacity-10" />
        <div className="absolute inset-0 pattern-african opacity-20" />
        
        {/* Animated circles */}
        <motion.div 
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 6, repeat: Infinity }}
        />
        <motion.div 
          className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-white/5 rounded-full blur-3xl"
          animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        
        <div className="container mx-auto px-4 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-20 h-20 mx-auto mb-8 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center">
              <Lightbulb className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-8 text-white leading-tight">
              Prêt à accélérer votre projet ?
            </h2>
            <p className="text-xl opacity-90 mb-12 max-w-2xl mx-auto text-white/90 leading-relaxed">
              Rejoignez les 500+ entrepreneurs qui utilisent BizGen AI pour structurer leur business
            </p>
            <Link href="/register">
              <Button size="lg" variant="secondary" className="gap-3 px-12 py-7 text-lg shadow-2xl hover:scale-105 transition-all font-semibold group">
                <Rocket className="w-5 h-5 group-hover:animate-bounce" />
                Créer mon compte gratuit
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-12">
            <div>
              <BizGenLogo size="md" showText showSlogan animated />
              <p className="text-muted-foreground leading-relaxed mt-4">
                Plateforme SaaS d'automatisation de documents business pour entrepreneurs africains.
              </p>
            </div>
            
            <FooterColumn title="Produit" links={[
              { label: 'Fonctionnalités', href: '#features' },
              { label: 'Tarifs', href: '#pricing' },
              { label: 'Templates', href: '#' },
              { label: 'API', href: '#' },
            ]} />
            
            <FooterColumn title="Entreprise" links={[
              { label: 'À propos', href: '#' },
              { label: 'Blog', href: '#' },
              { label: 'Carrières', href: '#' },
              { label: 'Contact', href: '#' },
            ]} />
            
            <FooterColumn title="Légal" links={[
              { label: 'Confidentialité', href: '#' },
              { label: 'CGU', href: '#' },
              { label: 'RGPD', href: '#' },
            ]} />
          </div>
          
          <div className="border-t mt-16 pt-8">
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-muted-foreground">
              <p>© 2025 BizGen AI. Tous droits réservés.</p>
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground/60">by</span>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[hsl(25,90%,50%)]/10 to-[hsl(40,85%,50%)]/10 border border-primary/20">
                  <img 
                    src="/interact-logo.jpeg" 
                    alt="INTERACT" 
                    className="h-6 w-auto object-contain"
                  />
                  <span className="font-semibold text-primary">INTERACT</span>
                </div>
                <span className="text-muted-foreground/60">• Développé par</span>
                <span className="font-semibold text-foreground">Mr.X</span>
              </div>
            </div>
            <p className="text-center text-sm text-muted-foreground/60 mt-4">
              Fait avec ❤️ à Douala, Cameroun
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Component: Navigation Link
function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="text-muted-foreground hover:text-primary transition-colors relative group font-medium">
      {children}
      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300 rounded-full" />
    </Link>
  );
}

// Component: Stat Card
function StatCard({ number, label, icon, delay }: { number: string; label: string; icon: React.ReactNode; delay: number }) {
  return (
    <motion.div 
      className="text-center p-8 rounded-2xl bg-card/80 backdrop-blur border border-border/50 card-hover group"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
    >
      <motion.div 
        className="w-14 h-14 mx-auto mb-5 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300"
        whileHover={{ scale: 1.1, rotate: 5 }}
      >
        {icon}
      </motion.div>
      <div className="text-3xl md:text-4xl font-bold gradient-text">{number}</div>
      <div className="text-sm text-muted-foreground mt-2 font-medium">{label}</div>
    </motion.div>
  );
}

// Component: Trust Badge
function TrustBadge({ icon, name }: { icon: React.ReactNode; name: string }) {
  return (
    <motion.div 
      className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors cursor-pointer"
      whileHover={{ scale: 1.05 }}
    >
      {icon}
      <span className="text-xl font-bold">{name}</span>
    </motion.div>
  );
}

// Component: Feature Card
function FeatureCard({ icon, title, description, color, delay }: { icon: React.ReactNode; title: string; description: string; color: string; delay: number }) {
  const gradients: Record<string, string> = {
    orange: 'from-primary/20 to-gold-500/10 text-primary',
    gold: 'from-gold-500/20 to-primary/10 text-gold-600',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
    >
      <Card className="h-full card-hover card-shine border-border/30 bg-card/80 backdrop-blur group">
        <CardHeader className="pb-4">
          <motion.div 
            className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradients[color]} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}
            whileHover={{ rotate: 5 }}
          >
            {icon}
          </motion.div>
          <CardTitle className="text-xl font-semibold">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-base leading-relaxed">{description}</CardDescription>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Component: Step Card
function StepCard({ number, title, description, icon, delay }: { number: number; title: string; description: string; icon: React.ReactNode; delay: number }) {
  return (
    <motion.div 
      className="text-center p-10 rounded-3xl bg-card border border-border/30 card-hover relative overflow-hidden group"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
    >
      <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-3xl transform translate-x-10 -translate-y-10 group-hover:bg-primary/10 transition-colors" />
      
      <div className="relative">
        <motion.div 
          className="w-20 h-20 mx-auto mb-8 rounded-2xl bg-gradient-to-br from-primary to-gold-500 flex items-center justify-center text-white shadow-xl shadow-primary/25 group-hover:shadow-primary/40 transition-shadow"
          whileHover={{ scale: 1.1, rotate: 5 }}
        >
          {icon}
        </motion.div>
        <motion.div 
          className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center shadow-lg"
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 300, delay: delay + 0.3 }}
        >
          {number}
        </motion.div>
      </div>
      
      <h3 className="font-semibold text-xl mb-4">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </motion.div>
  );
}

// Component: Pricing Card
function PricingCard({ 
  name, price, currency, period, description, features, cta, popular, delay 
}: { 
  name: string; price: number; currency: string; period: string;
  description: string; features: string[]; cta: string; popular: boolean; delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
    >
      <Card className={`h-full relative card-hover ${popular ? 'border-primary shadow-2xl shadow-primary/20 scale-105 bg-card' : 'border-border/30 bg-card/80 backdrop-blur'}`}>
        {popular && (
          <motion.div 
            className="absolute -top-4 left-1/2 -translate-x-1/2"
            initial={{ y: -20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: delay + 0.2 }}
          >
            <Badge className="bg-gradient-to-r from-primary to-gold-500 text-white px-5 py-1.5 font-medium">
              <Star className="w-3.5 h-3.5 mr-1.5" />
              Populaire
            </Badge>
          </motion.div>
        )}
        <CardHeader className="text-center pb-4 pt-8">
          <CardTitle className="text-xl font-semibold">{name}</CardTitle>
          <div className="mt-6">
            <span className="text-5xl font-bold gradient-text">
              {price === 0 ? 'Gratuit' : `${price}${currency}`}
            </span>
            {price > 0 && <span className="text-muted-foreground">/{period}</span>}
          </div>
          <CardDescription className="mt-3 text-base">{description}</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <ul className="space-y-4">
            {features.map((feature, i) => (
              <motion.li 
                key={i} 
                className="flex items-start gap-3"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: delay + 0.1 * i }}
              >
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-primary" />
                </div>
                <span className="text-sm">{feature}</span>
              </motion.li>
            ))}
          </ul>
        </CardContent>
        <CardFooter className="pt-6">
          <Link href="/register" className="w-full">
            <Button 
              className={`w-full font-semibold ${popular ? 'btn-gradient shadow-xl shadow-primary/30' : ''}`} 
              variant={popular ? 'default' : 'outline'}
              size="lg"
            >
              {cta}
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </motion.div>
  );
}

// Component: Testimonial Card
function TestimonialCard({ 
  quote, author, role, avatar, rating, delay 
}: { 
  quote: string; author: string; role: string; avatar: string; rating: number; delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
    >
      <Card className="h-full card-hover border-border/30 bg-card/80 backdrop-blur">
        <CardContent className="pt-10 pb-8 px-8">
          <div className="flex gap-1.5 mb-6">
            {Array.from({ length: rating }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: delay + 0.1 * i, type: "spring" }}
              >
                <Star className="w-5 h-5 fill-primary text-primary" />
              </motion.div>
            ))}
          </div>
          
          <p className="text-foreground/90 italic mb-8 leading-relaxed text-lg">"{quote}"</p>
          
          <div className="flex items-center gap-4">
            <motion.div 
              className="w-14 h-14 bg-gradient-to-br from-primary to-gold-500 rounded-full flex items-center justify-center text-white font-semibold shadow-lg shadow-primary/25"
              whileHover={{ scale: 1.1 }}
            >
              {avatar}
            </motion.div>
            <div>
              <div className="font-semibold text-lg">{author}</div>
              <div className="text-sm text-muted-foreground">{role}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Component: Footer Column
function FooterColumn({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <h4 className="font-semibold mb-6 text-lg">{title}</h4>
      <ul className="space-y-4">
        {links.map((link) => (
          <li key={link.label}>
            <Link href={link.href} className="text-muted-foreground hover:text-primary transition-colors">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
