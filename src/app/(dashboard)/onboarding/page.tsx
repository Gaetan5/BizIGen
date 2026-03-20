'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Sparkles, 
  ArrowRight, 
  Building2, 
  Target, 
  Rocket,
  Loader2,
  Check
} from 'lucide-react';
import { SECTOR_LABELS, COUNTRIES } from '@/lib/constants';
import type { Sector } from '@/types';
import { toast } from 'sonner';

const ONBOARDING_STEPS = [
  {
    id: 'welcome',
    title: 'Bienvenue sur BizGen AI',
    description: 'Créez vos documents business en quelques minutes avec l\'IA',
    icon: Sparkles,
  },
  {
    id: 'profile',
    title: 'Votre profil',
    description: 'Parlez-nous de votre projet',
    icon: Target,
  },
  {
    id: 'start',
    title: 'C\'est parti !',
    description: 'Créez votre premier projet',
    icon: Rocket,
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form state
  const [projectName, setProjectName] = useState('');
  const [sector, setSector] = useState<Sector | ''>('');
  const [country, setCountry] = useState('CM');

  const progress = ((currentStep + 1) / ONBOARDING_STEPS.length) * 100;
  const step = ONBOARDING_STEPS[currentStep];
  const StepIcon = step.icon;

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleCreateProject = async () => {
    if (!projectName || !sector) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: projectName,
          sector,
          country,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la création');
      }

      toast.success('Projet créé avec succès !');
      router.push(`/projects/${data.project.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    router.push('/dashboard');
  };

  // Show loading while checking session
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (status !== 'authenticated') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex flex-col">
      {/* Header */}
      <header className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg">BizGen AI</span>
        </div>
        <Button variant="ghost" onClick={handleSkip}>
          Passer
        </Button>
      </header>

      {/* Progress */}
      <div className="px-4 py-2">
        <Progress value={progress} className="h-2" />
        <div className="flex justify-between mt-2 text-sm text-muted-foreground">
          {ONBOARDING_STEPS.map((s, idx) => (
            <div 
              key={s.id}
              className={`flex items-center gap-1 ${idx <= currentStep ? 'text-primary' : ''}`}
            >
              {idx < currentStep ? (
                <Check className="w-4 h-4" />
              ) : (
                <span>{idx + 1}</span>
              )}
              <span className="hidden sm:inline">{s.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <StepIcon className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">{step.title}</CardTitle>
            <CardDescription>{step.description}</CardDescription>
          </CardHeader>
          
          <CardContent>
            {/* Step 0: Welcome */}
            {currentStep === 0 && (
              <div className="space-y-6">
                <div className="text-center space-y-4">
                  <p className="text-muted-foreground">
                    Bienvenue <strong>{session?.user?.name || 'Entrepreneur'}</strong> ! 
                    Vous êtes sur le point de créer vos premiers documents business professionnels.
                  </p>
                  
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-primary">20</div>
                      <div className="text-sm text-muted-foreground">minutes</div>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-primary">3</div>
                      <div className="text-sm text-muted-foreground">documents</div>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-primary">100%</div>
                      <div className="text-sm text-muted-foreground">personnalisé</div>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    Vous allez générer : Business Model Canvas, Lean Canvas et Business Plan
                  </p>
                </div>
                
                <Button onClick={handleNext} className="w-full gap-2">
                  Commencer
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            )}

            {/* Step 1: Profile */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="projectName">Nom de votre projet</Label>
                    <Input
                      id="projectName"
                      placeholder="Ex: MaStartup Agricole"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Secteur d'activité</Label>
                    <Select value={sector} onValueChange={(v) => setSector(v as Sector)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez votre secteur" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(SECTOR_LABELS).map(([key, value]) => (
                          <SelectItem key={key} value={key}>
                            {value.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Pays</Label>
                    <Select value={country} onValueChange={setCountry}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {COUNTRIES.map((c) => (
                          <SelectItem key={c.value} value={c.value}>
                            {c.flag} {c.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleBack} className="flex-1">
                    Retour
                  </Button>
                  <Button 
                    onClick={handleNext} 
                    className="flex-1 gap-2"
                    disabled={!projectName || !sector}
                  >
                    Suivant
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Start */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center space-y-4">
                  <div className="w-full p-4 bg-muted rounded-lg text-left space-y-2">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-primary" />
                      <span className="font-medium">{projectName}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {SECTOR_LABELS[sector as Sector]?.label} • {COUNTRIES.find(c => c.value === country)?.label}
                    </div>
                  </div>

                  <p className="text-muted-foreground">
                    Vous allez répondre à quelques questions sur votre projet, 
                    puis l'IA générera vos documents personnalisés.
                  </p>

                  <div className="flex items-center justify-center gap-2 text-sm text-primary">
                    <Sparkles className="w-4 h-4" />
                    <span>Prêt à générer avec l'IA</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleBack} className="flex-1">
                    Retour
                  </Button>
                  <Button 
                    onClick={handleCreateProject} 
                    className="flex-1 gap-2"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Création...
                      </>
                    ) : (
                      <>
                        <Rocket className="w-4 h-4" />
                        Créer mon projet
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
