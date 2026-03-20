'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight, 
  ArrowLeft, 
  Building2, 
  Lightbulb, 
  Users, 
  Coins, 
  Settings, 
  TrendingUp,
  Loader2,
  Sparkles,
  Check,
  Rocket,
  Globe,
  Zap,
  Target,
  Heart,
  Briefcase,
  ShoppingCart,
  Stethoscope,
  GraduationCap,
  Wrench,
  Truck
} from 'lucide-react';
import { SECTOR_LABELS, COUNTRIES, FORM_STEPS, SECTOR_QUESTIONS } from '@/lib/constants';
import type { Sector, FormQuestion } from '@/types';
import { toast } from 'sonner';

const stepIcons: Record<string, React.ElementType> = {
  'Building2': Building2,
  'Lightbulb': Lightbulb,
  'Users': Users,
  'Coins': Coins,
  'Settings': Settings,
  'TrendingUp': TrendingUp,
};

const sectorIcons: Record<string, React.ElementType> = {
  'tech': Zap,
  'agriculture': Target,
  'ecommerce': ShoppingCart,
  'fintech': Coins,
  'health': Stethoscope,
  'education': GraduationCap,
  'services': Wrench,
  'logistics': Truck,
};

const sectorColors: Record<string, string> = {
  'tech': 'from-blue-500 to-cyan-500',
  'agriculture': 'from-green-500 to-emerald-500',
  'ecommerce': 'from-purple-500 to-pink-500',
  'fintech': 'from-amber-500 to-orange-500',
  'health': 'from-red-500 to-rose-500',
  'education': 'from-indigo-500 to-violet-500',
  'services': 'from-teal-500 to-cyan-500',
  'logistics': 'from-orange-500 to-amber-500',
};

export default function NewProjectPage() {
  const router = useRouter();
  const { data: session } = useSession();
  
  // Project setup state
  const [sector, setSector] = useState<Sector | ''>('');
  const [country, setCountry] = useState('CM');
  const [projectName, setProjectName] = useState('');
  const [showForm, setShowForm] = useState(false);
  
  // Form state
  const [currentStep, setCurrentStep] = useState(1);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [projectId, setProjectId] = useState<string | null>(null);

  // Get questions for selected sector
  const questions = sector ? SECTOR_QUESTIONS[sector as Sector] || [] : [];
  const currentStepQuestions = questions.filter(q => q.step === currentStep);
  const totalSteps = FORM_STEPS.length;

  // Auto-save
  useEffect(() => {
    if (projectId && Object.keys(answers).length > 0) {
      const saveTimer = setTimeout(() => {
        saveAnswers();
      }, 2000);
      return () => clearTimeout(saveTimer);
    }
  }, [answers, projectId]);

  const saveAnswers = async () => {
    if (!projectId) return;
    
    try {
      await fetch(`/api/projects/${projectId}/inputs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ answers }),
      });
    } catch (error) {
      console.error('Auto-save error:', error);
    }
  };

  const handleSectorSelect = async (selectedSector: Sector) => {
    setSector(selectedSector);
    setIsSubmitting(true);

    try {
      // Create project
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: projectName || 'Nouveau projet',
          sector: selectedSector,
          country,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error);
      }

      setProjectId(data.project.id);
      setShowForm(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la création du projet');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAnswerChange = (key: string, value: string) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
  };

  const handleNextStep = () => {
    // Validate required questions
    const requiredQuestions = currentStepQuestions.filter(q => q.required);
    const missingRequired = requiredQuestions.filter(q => !answers[q.key]);
    
    if (missingRequired.length > 0) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleGenerate = async () => {
    // Validate all required questions
    const allRequiredQuestions = questions.filter(q => q.required);
    const missingRequired = allRequiredQuestions.filter(q => !answers[q.key]);
    
    if (missingRequired.length > 0) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Save final answers
      await saveAnswers();

      // Start generation
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          projectId,
          type: 'all',
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error);
      }

      toast.success('Génération en cours...');
      router.push(`/projects/${projectId}?generating=true`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la génération');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Sector Selection Screen
  if (!showForm) {
    return (
      <div className="max-w-5xl mx-auto space-y-8 animate-fade-in-up">
        {/* Header */}
        <div className="text-center mb-8">
          <Badge variant="outline" className="mb-4 px-4 py-1 border-primary/30">
            <Rocket className="w-3 h-3 mr-1" />
            Nouveau projet
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            Créons votre <span className="gradient-text">projet</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Sélectionnez votre secteur d'activité et laissez notre IA vous guider
          </p>
        </div>

        {/* Initial Settings Card */}
        <Card className="border-border/50 bg-card/80 backdrop-blur shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" />
              Paramètres initiaux
            </CardTitle>
            <CardDescription>
              Ces informations nous aideront à personnaliser votre expérience
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="projectName" className="text-base font-medium">Nom du projet</Label>
                <Input
                  id="projectName"
                  placeholder="Ex: MonProjet, MaStartup..."
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="h-12 rounded-xl border-border/50 focus:border-primary/50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-base font-medium">Pays</Label>
                <Select value={country} onValueChange={setCountry}>
                  <SelectTrigger className="h-12 rounded-xl border-border/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {COUNTRIES.map(c => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.flag} {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sector Selection */}
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-primary" />
            Sélectionnez votre secteur
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(SECTOR_LABELS).map(([key, value], index) => {
              const Icon = sectorIcons[key] || Briefcase;
              const colorClass = sectorColors[key] || 'from-gray-500 to-gray-600';
              
              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card 
                    className={`
                      cursor-pointer transition-all duration-300 group
                      border-border/50 bg-card/80 backdrop-blur
                      hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10
                      ${sector === key ? 'border-primary ring-2 ring-primary/20 bg-primary/5' : ''}
                    `}
                    onClick={() => handleSectorSelect(key as Sector)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between mb-2">
                        <div className={`
                          w-12 h-12 rounded-xl bg-gradient-to-br ${colorClass} 
                          flex items-center justify-center shadow-lg
                          group-hover:scale-110 transition-transform
                        `}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        {sector === key && (
                          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center animate-scale-in">
                            <Check className="w-4 h-4 text-primary-foreground" />
                          </div>
                        )}
                      </div>
                      <CardTitle className="text-lg">{value.label}</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <CardDescription className="text-sm">
                        {value.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Loading Overlay */}
        {isSubmitting && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
            <Card className="p-8 shadow-2xl border-border/50 animate-scale-in">
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center animate-pulse-glow">
                  <Sparkles className="w-8 h-8 text-primary-foreground" />
                </div>
                <div className="text-center">
                  <p className="text-lg font-medium">Création du projet...</p>
                  <p className="text-sm text-muted-foreground">Préparation de votre espace de travail</p>
                </div>
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            </Card>
          </div>
        )}
      </div>
    );
  }

  // Form Screen
  const currentStepInfo = FORM_STEPS[currentStep - 1];
  const StepIcon = stepIcons[currentStepInfo.icon] || Building2;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in-up">
      {/* Progress Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">
            <span className="gradient-text">{projectName || 'Votre projet'}</span>
          </h1>
          <p className="text-muted-foreground">
            Complétez les informations pour générer vos documents
          </p>
        </div>
        <Badge variant="outline" className="text-base px-4 py-1 border-primary/30">
          Étape {currentStep}/{totalSteps}
        </Badge>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-2 mb-6">
        {FORM_STEPS.map((step, idx) => (
          <div key={step.number} className="flex items-center flex-1">
            <div 
              className={`
                flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium transition-all
                ${idx + 1 < currentStep ? 'bg-primary text-primary-foreground' :
                  idx + 1 === currentStep ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30' :
                  'bg-muted text-muted-foreground'}
              `}
            >
              {idx + 1 < currentStep ? (
                <Check className="w-5 h-5" />
              ) : (
                step.number
              )}
            </div>
            {idx < FORM_STEPS.length - 1 && (
              <div className={`flex-1 h-1 mx-2 rounded-full transition-all ${
                idx + 1 < currentStep ? 'bg-primary' : 'bg-muted'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <Card className="border-border/50 bg-card/80 backdrop-blur shadow-xl">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center shadow-lg shadow-primary/25">
              <StepIcon className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-xl">{currentStepInfo.title}</CardTitle>
              <CardDescription className="text-base">{currentStepInfo.description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {currentStepQuestions.map((question, index) => (
            <motion.div 
              key={question.id} 
              className="space-y-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Label htmlFor={question.key} className="text-base font-medium">
                {question.label}
                {question.required && <span className="text-destructive ml-1">*</span>}
              </Label>
              
              {question.type === 'text' && (
                <Input
                  id={question.key}
                  placeholder={question.placeholder}
                  value={answers[question.key] || ''}
                  onChange={(e) => handleAnswerChange(question.key, e.target.value)}
                  className="h-12 rounded-xl border-border/50 focus:border-primary/50"
                />
              )}
              
              {question.type === 'textarea' && (
                <Textarea
                  id={question.key}
                  placeholder={question.placeholder}
                  value={answers[question.key] || ''}
                  onChange={(e) => handleAnswerChange(question.key, e.target.value)}
                  rows={4}
                  className="rounded-xl border-border/50 focus:border-primary/50 resize-none"
                />
              )}
              
              {question.type === 'number' && (
                <Input
                  id={question.key}
                  type="number"
                  placeholder={question.placeholder}
                  value={answers[question.key] || ''}
                  onChange={(e) => handleAnswerChange(question.key, e.target.value)}
                  className="h-12 rounded-xl border-border/50 focus:border-primary/50"
                />
              )}
              
              {question.type === 'select' && question.options && (
                <Select
                  value={answers[question.key] || ''}
                  onValueChange={(value) => handleAnswerChange(question.key, value)}
                >
                  <SelectTrigger className="h-12 rounded-xl border-border/50">
                    <SelectValue placeholder="Sélectionnez..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {question.options.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {question.type === 'multiselect' && question.options && (
                <div className="grid grid-cols-2 gap-3">
                  {question.options.map(opt => {
                    const selected = (answers[question.key] || '').split(',').filter(Boolean);
                    const isSelected = selected.includes(opt.value);
                    return (
                      <label
                        key={opt.value}
                        className={`
                          flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all
                          ${isSelected 
                            ? 'border-primary bg-primary/10 text-primary' 
                            : 'border-border/50 hover:border-primary/30 hover:bg-muted/50'
                          }
                        `}
                      >
                        <div className={`
                          w-5 h-5 rounded-md border flex items-center justify-center transition-all
                          ${isSelected ? 'bg-primary border-primary' : 'border-border'}
                        `}>
                          {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                        </div>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            const newSelected = e.target.checked
                              ? [...selected, opt.value]
                              : selected.filter(v => v !== opt.value);
                            handleAnswerChange(question.key, newSelected.join(','));
                          }}
                          className="sr-only"
                        />
                        <span className="text-sm">{opt.label}</span>
                      </label>
                    );
                  })}
                </div>
              )}

              {question.helpText && (
                <p className="text-sm text-muted-foreground">{question.helpText}</p>
              )}
            </motion.div>
          ))}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button
          variant="outline"
          onClick={handlePrevStep}
          disabled={currentStep === 1}
          className="gap-2 rounded-xl px-6 hover:bg-primary/10 hover:border-primary/30"
        >
          <ArrowLeft className="w-4 h-4" />
          Précédent
        </Button>

        {currentStep < totalSteps ? (
          <Button 
            onClick={handleNextStep} 
            className="btn-gradient gap-2 rounded-xl px-6 shadow-lg shadow-primary/25"
          >
            Suivant
            <ArrowRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button 
            onClick={handleGenerate} 
            disabled={isSubmitting} 
            className="btn-gradient gap-2 rounded-xl px-6 shadow-lg shadow-primary/25"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Génération...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Générer mes documents
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

// Import motion from framer-motion
import { motion } from 'framer-motion';
