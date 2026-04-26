'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  ArrowLeft,
  Download,
  FileText,
  Loader2,
  Share2,
  Edit,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { BusinessModelCanvas } from '@/components/canvas/business-model-canvas';
import { LeanCanvas } from '@/components/canvas/lean-canvas';
import { BusinessPlanViewer } from '@/components/canvas/business-plan-viewer';
import { toast } from 'sonner';
import { useExportPDF } from '@/lib/export-pdf';

// Fetch project data
async function fetchProject(id: string) {
  const res = await fetch(`/api/projects/${id}`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch project');
  return res.json();
}

// Fetch generation status
async function fetchGenerationStatus(id: string) {
  const res = await fetch(`/api/projects/${id}/status`, { credentials: 'include' });
  if (!res.ok) return null;
  return res.json();
}

export function ProjectPageContent({ id }: { id: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isGenerating = searchParams.get('generating') === 'true';
  const { exportCanvasToPDF, exportBusinessPlanToPDF } = useExportPDF();

  const [activeTab, setActiveTab] = useState('bmc');
  const [generating, setGenerating] = useState(isGenerating);
  const [generationProgress, setGenerationProgress] = useState(10);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['project', id],
    queryFn: () => fetchProject(id),
    refetchInterval: generating ? 3000 : false,
  });

  const project = data?.project;
  const generatedDoc = project?.generatedDoc;
  const canvases = generatedDoc?.canvases || [];

  const bmcCanvas = canvases.find((c: { canvasType: string }) => c.canvasType === 'BUSINESS_MODEL_CANVAS');
  const leanCanvas = canvases.find((c: { canvasType: string }) => c.canvasType === 'LEAN_CANVAS');

  // Parse blocks from JSON string
  const bmcBlocks = bmcCanvas ? JSON.parse(bmcCanvas.blocks) : null;
  const leanBlocks = leanCanvas ? JSON.parse(leanCanvas.blocks) : null;

  // Parse Business Plan from rawContent
  const businessPlan = generatedDoc?.rawContent ? JSON.parse(generatedDoc.rawContent) : null;

  // Progression dynamique pendant la génération (m1 fix)
  useEffect(() => {
    if (!generating) {
      setGenerationProgress(10);
      return;
    }
    const interval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 90) return 90; // Plafonner à 90% tant que non terminé
        return prev + Math.floor(Math.random() * 8) + 3;
      });
    }, 2500);
    return () => clearInterval(interval);
  }, [generating]);

  // Check if generation is complete
  useEffect(() => {
    if (generating && generatedDoc?.status === 'COMPLETED') {
      setGenerating(false);
      setGenerationProgress(100);
      toast.success('Documents générés avec succès !');
    }
  }, [generatedDoc?.status, generating]);

  const handleRegenerate = async (type: 'bmc' | 'lean' | 'all') => {
    setGenerating(true);
    setGenerationProgress(10);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ projectId: id, type }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      toast.success('Régénération en cours...');
      refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la régénération');
      setGenerating(false);
    }
  };

  const handleExport = async (format: 'pdf' | 'png' | 'docx') => {
    try {
      const response = await fetch(`/api/export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          projectId: id,
          type: activeTab,
          format
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      // Génération côté client à partir des données canvas retournées par l'API (C2 fix)
      if (data.canvasData || data.businessPlanData) {
        if (format === 'pdf') {
          await generatePDF(data, activeTab);
        } else if (format === 'png') {
          await generatePNG(data, activeTab);
        } else {
          toast.info('Export DOCX disponible prochainement.');
        }
      } else {
        toast.error('Aucune donnée disponible pour l\'export.');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de l\'export');
    }
  };

  // Génération PDF côté client via jsPDF (C2 fix)
  const generatePDF = async (data: any, type: string) => {
    try {
      if (type === 'bp') {
        await exportBusinessPlanToPDF({
          data: data.businessPlanData,
          projectName: data.projectName
        });
      } else {
        await exportCanvasToPDF({
          elementId: 'canvas-export-target',
          fileName: `${type === 'bmc' ? 'Business_Model_Canvas' : 'Lean_Canvas'}_${data.projectName}`,
          title: type === 'bmc' ? 'Business Model Canvas' : 'Lean Canvas',
          subtitle: data.projectName
        });
      }
      toast.success('Document PDF généré avec succès !');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Erreur lors de la génération PDF.');
    }
  };

  // Génération PNG côté client via html2canvas (C2 fix)
  const generatePNG = async (data: Record<string, unknown>, type: string) => {
    try {
      const element = document.getElementById('canvas-export-target');
      if (!element) {
        toast.error('Élément de capture introuvable. Assurez-vous que le canvas est affiché.');
        return;
      }
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(element, { scale: 2, useCORS: true });
      const link = document.createElement('a');
      link.download = `${type}_${data.projectName}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      toast.success('PNG téléchargé !');
    } catch {
      toast.error('Erreur lors de la génération PNG.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">Projet non trouvé</p>
        <Link href="/projects">
          <Button>Retour aux projets</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/projects">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{project.name}</h1>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Badge variant="secondary">{project.sector}</Badge>
              <span>•</span>
              <span>Créé le {new Date(project.createdAt).toLocaleDateString('fr-FR')}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => handleRegenerate('all')} disabled={generating}>
            <RefreshCw className={`w-4 h-4 mr-2 ${generating ? 'animate-spin' : ''}`} />
            Régénérer
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="w-4 h-4 mr-2" />
            Partager
          </Button>
          <Button size="sm" onClick={() => handleExport('pdf')}>
            <Download className="w-4 h-4 mr-2" />
            Exporter PDF
          </Button>
        </div>
      </div>

      {/* Generation Status (m1 fix : progress dynamique) */}
      {(generating || generatedDoc?.status === 'GENERATING') && (
        <Card className="border-primary">
          <CardContent className="py-4">
            <div className="flex items-center gap-4">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <div className="flex-1">
                <p className="font-medium">Génération en cours...</p>
                <p className="text-sm text-muted-foreground">
                  Vos documents sont en cours de création par l'IA
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Progress value={generationProgress} className="w-32" />
                <span className="text-xs text-muted-foreground">{generationProgress}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="bmc">Business Model Canvas</TabsTrigger>
          <TabsTrigger value="lean">Lean Canvas</TabsTrigger>
          <TabsTrigger value="bp">Business Plan</TabsTrigger>
        </TabsList>

        <TabsContent value="bmc" className="mt-6">
          {bmcBlocks ? (
            <div id="canvas-export-target">
              <BusinessModelCanvas blocks={bmcBlocks} editable={true} />
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">
                  Le Business Model Canvas n'a pas encore été généré
                </p>
                <Button onClick={() => handleRegenerate('bmc')} disabled={generating}>
                  Générer le BMC
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="lean" className="mt-6">
          {leanBlocks ? (
            <div id="canvas-export-target">
              <LeanCanvas blocks={leanBlocks} editable={true} />
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">
                  Le Lean Canvas n'a pas encore été généré
                </p>
                <Button onClick={() => handleRegenerate('lean')} disabled={generating}>
                  Générer le Lean Canvas
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="bp" className="mt-6">
          {businessPlan ? (
            <div id="canvas-export-target">
              <BusinessPlanViewer data={businessPlan} projectName={project.name} />
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">
                  Le Business Plan n'a pas encore été généré
                </p>
                <Button onClick={() => handleRegenerate('all')} disabled={generating}>
                  Générer tous les documents
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
