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
  Loader2
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
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">Erreur lors du chargement des projets</p>
        <Button onClick={() => refetch()}>Réessayer</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Mes projets</h1>
          <p className="text-muted-foreground">
            Gérez vos projets et documents business
          </p>
        </div>
        <Link href="/projects/new">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Nouveau projet
          </Button>
        </Link>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <Card className="py-12">
          <CardContent className="text-center">
            <FolderKanban className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Aucun projet pour le moment</h2>
            <p className="text-muted-foreground mb-6">
              Créez votre premier projet pour générer votre Business Model Canvas et Business Plan
            </p>
            <Link href="/projects/new">
              <Button size="lg" className="gap-2">
                <Plus className="w-4 h-4" />
                Créer mon premier projet
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project: { 
            id: string; 
            name: string; 
            sector: string; 
            status: string; 
            createdAt: string;
            generatedDoc?: { status: string } | null;
          }) => (
            <Card key={project.id} className="group hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg line-clamp-1">{project.name}</CardTitle>
                      <CardDescription className="text-sm">
                        {SECTOR_LABELS[project.sector as keyof typeof SECTOR_LABELS]?.label || project.sector}
                      </CardDescription>
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => router.push(`/projects/${project.id}`)}>
                        Voir les détails
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDelete(project.id)}
                        className="text-destructive"
                      >
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    {new Date(project.createdAt).toLocaleDateString('fr-FR')}
                  </div>
                  <Badge 
                    variant={
                      project.status === 'COMPLETED' ? 'default' :
                      project.status === 'GENERATING' ? 'secondary' :
                      'outline'
                    }
                  >
                    {project.status === 'COMPLETED' ? 'Complété' :
                     project.status === 'GENERATING' ? 'En cours' :
                     project.status === 'IN_PROGRESS' ? 'Brouillon' :
                     'Nouveau'}
                  </Badge>
                </div>

                {project.generatedDoc && (
                  <div className="mt-3 pt-3 border-t">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="secondary" className="text-xs">BMC</Badge>
                      <Badge variant="secondary" className="text-xs">Lean</Badge>
                      <Badge variant="secondary" className="text-xs">BP</Badge>
                    </div>
                  </div>
                )}

                <Link 
                  href={`/projects/${project.id}`}
                  className="block mt-3"
                >
                  <Button variant="outline" className="w-full">
                    {project.status === 'COMPLETED' ? 'Voir les documents' :
                     project.status === 'GENERATING' ? 'Voir la progression' :
                     'Continuer le formulaire'}
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
