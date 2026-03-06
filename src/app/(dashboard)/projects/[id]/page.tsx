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

// Fetch project data
async function fetchProject(id: string) {
  const res = await fetch(`/api/projects/${id}`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch project');
  return res.json();
}

function ProjectPageContent({ id }: { id: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isGenerating = searchParams.get('generating') === 'true';
  
  const [activeTab, setActiveTab] = useState('bmc');
  const [generating, setGenerating] = useState(isGenerating);

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

  // Check if generation is complete
  useEffect(() => {
    if (generating && generatedDoc?.status === 'COMPLETED') {
      setGenerating(false);
      toast.success('Documents générés avec succès !');
    }
  }, [generatedDoc?.status, generating]);

  const handleRegenerate = async (type: 'bmc' | 'lean' | 'all') => {
    setGenerating(true);
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
      
      // Download file
      window.open(data.url, '_blank');
      toast.success('Export téléchargé !');
    } catch (error) {
      toast.error('Erreur lors de l\'export');
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

      {/* Generation Status */}
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
              <Progress value={66} className="w-32" />
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
            <BusinessModelCanvas blocks={bmcBlocks} editable={true} />
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
            <LeanCanvas blocks={leanBlocks} editable={true} />
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
            <BusinessPlanViewer data={businessPlan} projectName={project.name} />
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

export default function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState<string>('');
  
  useEffect(() => {
    params.then(p => setId(p.id));
  }, [params]);

  if (!id) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    }>
      <ProjectPageContent id={id} />
    </Suspense>
  );
}
