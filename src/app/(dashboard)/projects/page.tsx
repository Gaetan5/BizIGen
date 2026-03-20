'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  FolderKanban, 
  MoreVertical,
  Sparkles,
  Calendar,
  Loader2,
  Rocket,
  FileText,
  Clock,
  CheckCircle2,
  ArrowUpRight
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SECTOR_LABELS } from '@/lib/constants';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

// Fetch projects
async function fetchProjects() {
  const res = await fetch('/api/projects', { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch projects');
  return res.json();
}

export default function ProjectsPage() {
  const router = useRouter();
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['projects'],
    queryFn: fetchProjects,
  });

  const projects = data?.projects || [];

  const handleDelete = async (projectId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) return;

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to delete project');
      
      toast.success('Projet supprimé');
      refetch();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-[hsl(200,60%,40%)] flex items-center justify-center animate-pulse shadow-2xl shadow-primary/30">
            <Sparkles className="w-8 h-8 text-primary-foreground" />
          </div>
          <div className="flex items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="text-muted-foreground font-medium">Chargement des projets...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 mx-auto mb-8 rounded-2xl bg-destructive/10 flex items-center justify-center">
          <FolderKanban className="w-10 h-10 text-destructive" />
        </div>
        <p className="text-xl font-semibold mb-3">Erreur lors du chargement</p>
        <p className="text-muted-foreground mb-8">Impossible de charger vos projets</p>
        <Button onClick={() => refetch()} className="btn-gradient shadow-xl shadow-primary/30">Réessayer</Button>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-[hsl(200,60%,40%)] flex items-center justify-center shadow-xl shadow-primary/25">
            <FolderKanban className="w-7 h-7 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              Mes <span className="gradient-text">projets</span>
            </h1>
            <p className="text-muted-foreground mt-1">
              Gérez vos projets et documents business
            </p>
          </div>
        </div>
        <Link href="/projects/new">
          <Button size="lg" className="btn-gradient gap-3 shadow-xl shadow-primary/30 hover:shadow-primary/50 hover:scale-105 transition-all px-8">
            <Plus className="w-5 h-5" />
            Nouveau projet
            <ArrowUpRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <Card className="py-20 border-border/30 bg-card/80 backdrop-blur-sm shadow-xl">
          <CardContent className="text-center">
            <div className="w-24 h-24 mx-auto mb-8 rounded-2xl bg-gradient-to-br from-primary/10 to-[hsl(200,60%,40%)]/10 flex items-center justify-center">
              <FolderKanban className="w-12 h-12 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold mb-3">Aucun projet pour le moment</h2>
            <p className="text-muted-foreground mb-10 max-w-lg mx-auto text-lg">
              Créez votre premier projet pour générer votre Business Model Canvas, Lean Canvas et Business Plan
            </p>
            <Link href="/projects/new">
              <Button size="lg" className="btn-gradient gap-3 shadow-xl shadow-primary/30 px-10 py-6 text-base font-semibold">
                <Rocket className="w-5 h-5" />
                Créer mon premier projet
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project: { 
            id: string; 
            name: string; 
            sector: string; 
            status: string; 
            createdAt: string;
            generatedDoc?: { status: string } | null;
          }, index: number) => (
            <Card 
              key={project.id} 
              className="group card-hover card-shine border-border/30 bg-card/80 backdrop-blur-sm shadow-lg animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-primary to-[hsl(200,60%,40%)] rounded-xl flex items-center justify-center shadow-lg shadow-primary/25 group-hover:shadow-primary/40 group-hover:scale-105 transition-all">
                      <Sparkles className="w-7 h-7 text-primary-foreground" />
                    </div>
                    <div>
                      <CardTitle className="text-lg line-clamp-1 group-hover:text-primary transition-colors">
                        {project.name}
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {SECTOR_LABELS[project.sector as keyof typeof SECTOR_LABELS]?.label || project.sector}
                      </CardDescription>
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 hover:bg-muted rounded-xl transition-all">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-xl border-border/50 shadow-xl">
                      <DropdownMenuItem onClick={() => router.push(`/projects/${project.id}`)} className="rounded-lg cursor-pointer">
                        Voir les détails
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDelete(project.id)}
                        className="text-destructive focus:text-destructive rounded-lg cursor-pointer"
                      >
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-5">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    {new Date(project.createdAt).toLocaleDateString('fr-FR')}
                  </div>
                  <StatusBadge status={project.status} />
                </div>

                {project.generatedDoc && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary" className="text-xs bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20">BMC</Badge>
                    <Badge variant="secondary" className="text-xs bg-[hsl(180,60%,40%)]/10 text-[hsl(180,60%,35%)] dark:text-[hsl(180,60%,60%)] hover:bg-[hsl(180,60%,40%)]/20 border border-[hsl(180,60%,40%)]/20">Lean</Badge>
                    <Badge variant="secondary" className="text-xs bg-[hsl(35,90%,50%)]/10 text-[hsl(35,90%,45%)] dark:text-[hsl(35,90%,60%)] hover:bg-[hsl(35,90%,50%)]/20 border border-[hsl(35,90%,50%)]/20">BP</Badge>
                  </div>
                )}

                <Link 
                  href={`/projects/${project.id}`}
                  className="block"
                >
                  <Button 
                    variant="outline" 
                    className="w-full rounded-xl hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all py-5 font-medium"
                  >
                    {project.status === 'COMPLETED' ? (
                      <>
                        <FileText className="w-4 h-4 mr-2" />
                        Voir les documents
                      </>
                    ) : project.status === 'GENERATING' ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Voir la progression
                      </>
                    ) : (
                      <>
                        <Clock className="w-4 h-4 mr-2" />
                        Continuer le formulaire
                      </>
                    )}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// Status Badge Component
function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
    COMPLETED: {
      label: 'Complété',
      className: 'bg-[hsl(140,60%,40%)]/10 text-[hsl(140,60%,35%)] dark:text-[hsl(140,60%,55%)] border border-[hsl(140,60%,40%)]/20',
      icon: <CheckCircle2 className="w-3 h-3 mr-1" />
    },
    GENERATING: {
      label: 'En cours',
      className: 'bg-[hsl(35,90%,50%)]/10 text-[hsl(35,90%,45%)] dark:text-[hsl(35,90%,60%)] border border-[hsl(35,90%,50%)]/20',
      icon: <Loader2 className="w-3 h-3 mr-1 animate-spin" />
    },
    IN_PROGRESS: {
      label: 'Brouillon',
      className: 'bg-muted text-muted-foreground border border-border',
      icon: <Clock className="w-3 h-3 mr-1" />
    },
    default: {
      label: 'Nouveau',
      className: 'bg-primary/10 text-primary border border-primary/20',
      icon: <Sparkles className="w-3 h-3 mr-1" />
    }
  };

  const config = statusConfig[status] || statusConfig.default;

  return (
    <Badge variant="secondary" className={`text-xs font-medium ${config.className}`}>
      {config.icon}
      {config.label}
    </Badge>
  );
}
