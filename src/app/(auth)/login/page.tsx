'use client';

import { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { BizGenLogo } from '@/components/ui/logo';
import { Mail, Lock, Loader2, ArrowLeft, Rocket, Zap, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        toast.error('Email ou mot de passe incorrect');
      } else {
        toast.success('Connexion réussie !');
        router.push(callbackUrl);
      }
    } catch (error) {
      toast.error('Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    await signIn('google', { callbackUrl });
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-primary via-[hsl(35,85%,45%)] to-[hsl(40,80%,40%)]">
        {/* Background Pattern */}
        <div className="absolute inset-0 hero-mesh opacity-10" />
        <div className="absolute inset-0 pattern-circuit opacity-30" />
        <div className="absolute inset-0 pattern-african opacity-20" />
        
        {/* Decorative Elements */}
        <motion.div 
          className="absolute top-20 left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"
          animate={{ y: [0, -30, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 6, repeat: Infinity }}
        />
        <motion.div 
          className="absolute top-40 right-20 w-64 h-64 bg-white/5 rounded-full blur-3xl"
          animate={{ y: [0, 20, 0], x: [0, -20, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div 
          className="absolute bottom-20 left-1/4 w-48 h-48 bg-white/10 rounded-full blur-2xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 5, repeat: Infinity }}
        />
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center p-14 text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <BizGenLogo size="lg" showText animated className="mb-14" />
          </motion.div>
          
          <motion.h1 
            className="text-4xl md:text-5xl font-bold mb-8 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Votre Business Plan complet en <span className="text-white underline decoration-wavy decoration-white/50">20 minutes</span>
          </motion.h1>
          
          <motion.p 
            className="text-lg text-white/80 mb-10 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Rejoignez les 500+ entrepreneurs africains qui utilisent BizGen AI pour structurer leur business et convaincre leurs partenaires.
          </motion.p>
          
          <motion.div 
            className="space-y-5"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <FeatureItem icon={<Rocket className="w-6 h-6" />} text="Démarrage en moins de 2 minutes" delay={0} />
            <FeatureItem icon={<Zap className="w-6 h-6" />} text="Génération IA instantanée" delay={0.1} />
            <FeatureItem icon={<Shield className="w-6 h-6" />} text="Données 100% sécurisées" delay={0.2} />
          </motion.div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-background via-background to-muted/20">
        <motion.div 
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-10">
            <BizGenLogo size="md" showText showSlogan animated />
          </div>

          <Card className="border-border/30 bg-card/80 backdrop-blur-sm shadow-2xl">
            <CardHeader className="text-center pb-4 pt-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary/10 to-gold-500/10 flex items-center justify-center">
                  <Lock className="w-8 h-8 text-primary" />
                </div>
              </motion.div>
              <CardTitle className="text-2xl font-bold">Connexion</CardTitle>
              <CardDescription className="text-base">
                Connectez-vous à votre compte pour continuer
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-5 px-8">
              <Button 
                variant="outline" 
                className="w-full rounded-xl border-border/50 hover:bg-primary/5 hover:border-primary/30 transition-all py-6 font-medium" 
                onClick={handleGoogleSignIn}
                disabled={isLoading}
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continuer avec Google
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-4 text-muted-foreground font-medium">Ou</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="font-medium">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="vous@exemple.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-12 rounded-xl border-border/50 focus:border-primary/50 transition-all py-6"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="font-medium">Mot de passe</Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-12 rounded-xl border-border/50 focus:border-primary/50 transition-all py-6"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full btn-gradient rounded-xl shadow-xl shadow-primary/30 hover:shadow-primary/50 py-6 text-base font-semibold" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Connexion...
                    </>
                  ) : (
                    'Se connecter'
                  )}
                </Button>
              </form>
            </CardContent>

            <CardFooter className="flex flex-col gap-4 pt-4 pb-6">
              <p className="text-sm text-muted-foreground text-center">
                Pas encore de compte ?{' '}
                <Link href="/register" className="text-primary hover:underline font-semibold">
                  Créer un compte
                </Link>
              </p>
            </CardFooter>
          </Card>

          {/* Back to Home */}
          <Link href="/" className="flex items-center justify-center gap-2 mt-8 text-muted-foreground hover:text-primary transition-colors font-medium">
            <ArrowLeft className="w-4 h-4" />
            <span>Retour à l'accueil</span>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

// Feature Item Component
function FeatureItem({ icon, text, delay }: { icon: React.ReactNode; text: string; delay: number }) {
  return (
    <motion.div 
      className="flex items-center gap-4 p-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.4 + delay }}
    >
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-white/20 to-white/10 flex items-center justify-center shadow-lg">
        {icon}
      </div>
      <span className="text-white/90 font-medium">{text}</span>
    </motion.div>
  );
}

function LoginLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-gold-500/5">
      <motion.div 
        className="flex flex-col items-center gap-6"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <BizGenLogo size="lg" animated />
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginForm />
    </Suspense>
  );
}
