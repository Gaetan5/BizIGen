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
  Check
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

export default function NewProjectPage() {
  const router = useRouter();
  const { data: session } = useSession();
  
  // Project setup state
  const [sector, setSector] = useState<Sector | ''>('');
  const [country, setCountry] = useState('CM');
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
          name: 'Nouveau projet',
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
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">Créer un nouveau projet</h1>
          <p className="text-muted-foreground">
            Sélectionnez votre secteur d'activité pour commencer
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Paramètres initiaux</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Pays</Label>
                <Select value={country} onValueChange={setCountry}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
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

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(SECTOR_LABELS).map(([key, value]) => (
            <Card 
              key={key}
              className={`cursor-pointer transition-all hover:border-primary hover:shadow-md ${
                sector === key ? 'border-primary ring-2 ring-primary/20' : ''
              }`}
              onClick={() => handleSectorSelect(key as Sector)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">{value.label}</Badge>
                  {sector === key && <Check className="w-5 h-5 text-primary" />}
                </div>
                <CardTitle className="text-lg">{value.label}</CardTitle>
                <CardDescription>{value.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        {isSubmitting && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur flex items-center justify-center z-50">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p>Création du projet...</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Form Screen
  const currentStepInfo = FORM_STEPS[currentStep - 1];
  const StepIcon = stepIcons[currentStepInfo.icon] || Building2;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Progress Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Formulaire de projet</h1>
        <Badge variant="outline">
          Étape {currentStep}/{totalSteps}
        </Badge>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <Progress value={(currentStep / totalSteps) * 100} />
        <div className="flex justify-between text-sm text-muted-foreground">
          {FORM_STEPS.map((step, idx) => (
            <div 
              key={step.number}
              className={`flex items-center gap-1 ${idx + 1 <= currentStep ? 'text-primary' : ''}`}
            >
              {idx + 1 < currentStep ? (
                <Check className="w-4 h-4" />
              ) : (
                <span>{step.number}</span>
              )}
              <span className="hidden md:inline">{step.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <StepIcon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle>{currentStepInfo.title}</CardTitle>
              <CardDescription>{currentStepInfo.description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {currentStepQuestions.map((question) => (
            <div key={question.id} className="space-y-2">
              <Label htmlFor={question.key}>
                {question.label}
                {question.required && <span className="text-destructive ml-1">*</span>}
              </Label>
              
              {question.type === 'text' && (
                <Input
                  id={question.key}
                  placeholder={question.placeholder}
                  value={answers[question.key] || ''}
                  onChange={(e) => handleAnswerChange(question.key, e.target.value)}
                />
              )}
              
              {question.type === 'textarea' && (
                <Textarea
                  id={question.key}
                  placeholder={question.placeholder}
                  value={answers[question.key] || ''}
                  onChange={(e) => handleAnswerChange(question.key, e.target.value)}
                  rows={4}
                />
              )}
              
              {question.type === 'number' && (
                <Input
                  id={question.key}
                  type="number"
                  placeholder={question.placeholder}
                  value={answers[question.key] || ''}
                  onChange={(e) => handleAnswerChange(question.key, e.target.value)}
                />
              )}
              
              {question.type === 'select' && question.options && (
                <Select
                  value={answers[question.key] || ''}
                  onValueChange={(value) => handleAnswerChange(question.key, value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez..." />
                  </SelectTrigger>
                  <SelectContent>
                    {question.options.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {question.type === 'multiselect' && question.options && (
                <div className="space-y-2">
                  {question.options.map(opt => {
                    const selected = (answers[question.key] || '').split(',').filter(Boolean);
                    const isSelected = selected.includes(opt.value);
                    return (
                      <label
                        key={opt.value}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            const newSelected = e.target.checked
                              ? [...selected, opt.value]
                              : selected.filter(v => v !== opt.value);
                            handleAnswerChange(question.key, newSelected.join(','));
                          }}
                          className="rounded border-input"
                        />
                        <span>{opt.label}</span>
                      </label>
                    );
                  })}
                </div>
              )}

              {question.helpText && (
                <p className="text-sm text-muted-foreground">{question.helpText}</p>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevStep}
          disabled={currentStep === 1}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Précédent
        </Button>

        {currentStep < totalSteps ? (
          <Button onClick={handleNextStep} className="gap-2">
            Suivant
            <ArrowRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button onClick={handleGenerate} disabled={isSubmitting} className="gap-2">
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
