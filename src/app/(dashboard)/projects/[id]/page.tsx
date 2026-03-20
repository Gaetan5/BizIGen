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
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Download, 
  FileText, 
  Loader2, 
  Share2,
  Edit,
  Trash2,
  RefreshCw,
  Sparkles,
  Target,
  Building2,
  Clock,
  CheckCircle2,
  MoreVertical,
  Eye,
  FileDown,
  Image as ImageIcon,
  File,
  ExternalLink
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  const [generationProgress, setGenerationProgress] = useState(0);

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

  // Generation progress simulation
  useEffect(() => {
    if (generating) {
      const interval = setInterval(() => {
        setGenerationProgress(prev => {
          if (prev >= 90) return prev;
          return prev + 10;
        });
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setGenerationProgress(0);
    }
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
    setGenerationProgress(0);
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
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center animate-pulse">
            <Sparkles className="w-6 h-6 text-primary-foreground" />
          </div>
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-muted flex items-center justify-center">
          <FileText className="w-8 h-8 text-muted-foreground" />
        </div>
        <p className="text-lg font-medium mb-2">Projet non trouvé</p>
        <p className="text-muted-foreground mb-6">Ce projet n'existe pas ou a été supprimé</p>
        <Link href="/projects">
          <Button className="btn-gradient">Retour aux projets</Button>
        </Link>
      </div>
    );
  }

  const hasDocuments = bmcBlocks || leanBlocks || businessPlan;

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col gap-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/projects" className="hover:text-primary transition-colors">
            Mes projets
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium">{project.name}</span>
        </div>

        {/* Title Row */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center shadow-lg shadow-primary/25">
              <Sparkles className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">
                <span className="gradient-text">{project.name}</span>
              </h1>
              <div className="flex items-center gap-3 mt-1">
                <Badge variant="secondary" className="bg-primary/10 text-primary border-0">
                  {project.sector}
                </Badge>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  {new Date(project.createdAt).toLocaleDateString('fr-FR')}
                </div>
                {generatedDoc?.status === 'COMPLETED' && (
                  <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-0">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Complet
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleRegenerate('all')} 
              disabled={generating}
              className="gap-2 rounded-xl hover:bg-primary/10 hover:border-primary/30"
            >
              <RefreshCw className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Régénérer</span>
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              className="gap-2 rounded-xl hover:bg-primary/10 hover:border-primary/30"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">Partager</span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="btn-gradient gap-2 shadow-lg shadow-primary/25 rounded-xl">
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Exporter</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl">
                <DropdownMenuItem onClick={() => handleExport('pdf')} className="gap-2 rounded-lg cursor-pointer">
                  <File className="w-4 h-4" />
                  Exporter en PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('docx')} className="gap-2 rounded-lg cursor-pointer">
                  <FileDown className="w-4 h-4" />
                  Exporter en Word
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('png')} className="gap-2 rounded-lg cursor-pointer">
                  <ImageIcon className="w-4 h-4" />
                  Exporter en PNG
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Generation Status */}
      {(generating || generatedDoc?.status === 'GENERATING') && (
        <Card className="border-primary/30 bg-gradient-to-r from-primary/5 to-emerald-500/5 shadow-xl animate-pulse-slow">
          <CardContent className="py-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center animate-pulse-glow">
                  <Sparkles className="w-7 h-7 text-primary-foreground" />
                </div>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-lg">Génération en cours...</p>
                <p className="text-sm text-muted-foreground">
                  L'IA analyse votre projet et crée vos documents
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <Progress value={generationProgress} className="flex-1 h-2" />
                  <span className="text-sm font-medium text-primary">{generationProgress}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      {hasDocuments && (
        <div className="grid grid-cols-3 gap-4">
          <Card className="border-border/50 bg-card/80 backdrop-blur card-hover">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Target className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{bmcBlocks ? 1 : 0}</p>
                <p className="text-xs text-muted-foreground">BMC</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-card/80 backdrop-blur card-hover">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <Target className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{leanBlocks ? 1 : 0}</p>
                <p className="text-xs text-muted-foreground">Lean Canvas</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-card/80 backdrop-blur card-hover">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{businessPlan ? '1' : '0'}</p>
                <p className="text-xs text-muted-foreground">Business Plan</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 max-w-lg h-12">
          <TabsTrigger value="bmc" className="gap-2 rounded-l-xl">
            <Target className="w-4 h-4" />
            <span className="hidden sm:inline">BMC</span>
          </TabsTrigger>
          <TabsTrigger value="lean" className="gap-2">
            <Target className="w-4 h-4" />
            <span className="hidden sm:inline">Lean</span>
          </TabsTrigger>
          <TabsTrigger value="bp" className="gap-2 rounded-r-xl">
            <Building2 className="w-4 h-4" />
            <span className="hidden sm:inline">BP</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bmc" className="mt-6">
          {bmcBlocks ? (
            <BusinessModelCanvas blocks={bmcBlocks} editable={true} />
          ) : (
            <EmptyState
              icon={Target}
              title="Business Model Canvas"
              description="Le BMC n'a pas encore été généré pour ce projet"
              onGenerate={() => handleRegenerate('bmc')}
              generating={generating}
            />
          )}
        </TabsContent>

        <TabsContent value="lean" className="mt-6">
          {leanBlocks ? (
            <LeanCanvas blocks={leanBlocks} editable={true} />
          ) : (
            <EmptyState
              icon={Target}
              title="Lean Canvas"
              description="Le Lean Canvas n'a pas encore été généré pour ce projet"
              onGenerate={() => handleRegenerate('lean')}
              generating={generating}
            />
          )}
        </TabsContent>

        <TabsContent value="bp" className="mt-6">
          {businessPlan ? (
            <BusinessPlanViewer data={businessPlan} projectName={project.name} />
          ) : (
            <EmptyState
              icon={Building2}
              title="Business Plan"
              description="Le Business Plan n'a pas encore été généré pour ce projet"
              onGenerate={() => handleRegenerate('all')}
              generating={generating}
              isLarge
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Empty State Component
function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  onGenerate, 
  generating,
  isLarge = false 
}: { 
  icon: React.ElementType;
  title: string;
  description: string;
  onGenerate: () => void;
  generating: boolean;
  isLarge?: boolean;
}) {
  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur shadow-xl">
      <CardContent className={`py-${isLarge ? '16' : '12'} text-center`}>
        <div className={`
          ${isLarge ? 'w-20 h-20' : 'w-16 h-16'} 
          mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary/10 to-emerald-500/10 
          flex items-center justify-center
        `}>
          <Icon className={`${isLarge ? 'w-10 h-10' : 'w-8 h-8'} text-primary`} />
        </div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">{description}</p>
        <Button 
          onClick={onGenerate} 
          disabled={generating}
          className="btn-gradient gap-2 shadow-lg shadow-primary/25"
          size="lg"
        >
          {generating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Génération en cours...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Générer
            </>
          )}
        </Button>
      </CardContent>
    </Card>
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
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center animate-pulse">
            <Sparkles className="w-6 h-6 text-primary-foreground" />
          </div>
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center animate-pulse">
            <Sparkles className="w-6 h-6 text-primary-foreground" />
          </div>
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    }>
      <ProjectPageContent id={id} />
    </Suspense>
  );
}
