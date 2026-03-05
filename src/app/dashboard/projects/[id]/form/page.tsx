'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase';
import { Project } from '@/lib/types';

const questions = {
  general: [
    { id: 'company_name', label: 'Nom de l\'entreprise', type: 'text', required: true },
    { id: 'location', label: 'Localisation (ville, pays)', type: 'text', required: true },
    { id: 'team_size', label: 'Taille de l\'équipe', type: 'select', options: ['1', '2-5', '6-10', '11+'], required: true },
  ],
  tech: [
    { id: 'product_type', label: 'Type de produit (SaaS, app mobile, etc.)', type: 'text', required: true },
    { id: 'target_users', label: 'Utilisateurs cibles', type: 'text', required: true },
  ],
  agro: [
    { id: 'supply_chain', label: 'Chaîne d\'approvisionnement', type: 'textarea', required: true },
    { id: 'market_size', label: 'Taille du marché estimé', type: 'text', required: true },
  ],
  commerce: [
    { id: 'business_model', label: 'Modèle commercial', type: 'select', options: ['B2B', 'B2C', 'B2B2C'], required: true },
  ],
  services: [
    { id: 'service_type', label: 'Type de service', type: 'text', required: true },
  ],
};

export default function ProjectForm() {
  const params = useParams();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const fetchProject = async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', params.id)
        .single();

      if (error || !data) {
        router.push('/dashboard');
        return;
      }

      setProject(data);
      setAnswers(data.form_data as Record<string, string>);
    };

    fetchProject();
  }, [params.id, router, supabase]);

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const saveProgress = async () => {
    if (!project) return;

    await supabase
      .from('projects')
      .update({ form_data: answers })
      .eq('id', project.id);
  };

  const handleGenerate = async () => {
    setLoading(true);
    await saveProgress();

    // Navigate to generation page
    router.push(`/dashboard/projects/${project?.id}/generate`);
  };

  if (!project) return <div>Loading...</div>;

  const sectorQuestions = questions[project.sector as keyof typeof questions] || [];
  const allQuestions = [...questions.general, ...sectorQuestions];

  return (
    <div className="max-w-4xl mx-auto p-8">
      <Card>
        <CardHeader>
          <CardTitle>Formulaire d'Audit - {project.name}</CardTitle>
          <p className="text-muted-foreground">Secteur: {project.sector}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {allQuestions.map((question, index) => (
            <div key={question.id}>
              <Label htmlFor={question.id}>
                {index + 1}. {question.label}
                {question.required && <span className="text-red-500">*</span>}
              </Label>
              {question.type === 'select' ? (
                <select
                  id={question.id}
                  aria-label={question.label}
                  value={answers[question.id] || ''}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  className="w-full p-2 border rounded-md mt-1"
                  required={question.required}
                >
                  <option value="">Sélectionnez une option</option>
                  {question.options?.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : question.type === 'textarea' ? (
                <textarea
                  id={question.id}
                  value={answers[question.id] || ''}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  className="w-full p-2 border rounded-md mt-1"
                  rows={3}
                  required={question.required}
                />
              ) : (
                <Input
                  id={question.id}
                  value={answers[question.id] || ''}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  required={question.required}
                />
              )}
            </div>
          ))}

          <div className="flex gap-4 pt-6">
            <Button onClick={saveProgress} variant="outline">
              Sauvegarder
            </Button>
            <Button onClick={handleGenerate} disabled={loading}>
              {loading ? 'Génération...' : 'Générer Documents'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
