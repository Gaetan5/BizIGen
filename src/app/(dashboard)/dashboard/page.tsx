'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  FolderKanban, 
  FileText, 
  TrendingUp, 
  Clock,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { PLAN_LIMITS } from '@/types';
import { useQuery } from '@tanstack/react-query';

// Fetch projects
async function fetchProjects() {
  const res = await fetch('/api/projects', { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch projects');
  return res.json();
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const userPlan = (session?.user as { plan?: string })?.plan || 'FREE';
  const limits = PLAN_LIMITS[userPlan as keyof typeof PLAN_LIMITS];

  const { data: projectsData, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: fetchProjects,
  });

  const projects = projectsData?.projects || [];
  const recentProjects = projects.slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            Bienvenue, {session?.user?.name || 'Entrepreneur'} 👋
          </h1>
          <p className="text-muted-foreground">
            Gérez vos projets et générez vos documents business
          </p>
        </div>
        <Link href="/projects/new">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Nouveau projet
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Projets créés</CardTitle>
            <FolderKanban className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projects.length}</div>
            <p className="text-xs text-muted-foreground">
              {limits.maxProjects === -1 ? 'Illimité' : `${limits.maxProjects - projects.length} restants`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Documents générés</CardTitle>
            <FileText className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projectsData?.totalDocs || 0}</div>
            <p className="text-xs text-muted-foreground">
              BMC, Lean Canvas, Business Plans
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Plan actuel</CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userPlan}</div>
            {userPlan === 'FREE' && (
              <Link href="/subscription" className="text-xs text-primary hover:underline">
                Passer à Pro →
              </Link>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Temps gagné</CardTitle>
            <Clock className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ~{projects.length * 20}h
            </div>
            <p className="text-xs text-muted-foreground">
              vs création manuelle
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Projects */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Projets récents</CardTitle>
              <Link href="/projects">
                <Button variant="ghost" size="sm" className="gap-1">
                  Voir tout
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
            <CardDescription>Vos derniers projets et leurs statuts</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : recentProjects.length === 0 ? (
              <div className="text-center py-8">
                <FolderKanban className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">
                  Aucun projet pour le moment
                </p>
                <Link href="/projects/new">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Créer votre premier projet
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentProjects.map((project: { id: string; name: string; sector: string; status: string; createdAt: string }) => (
                  <Link 
                    key={project.id} 
                    href={`/projects/${project.id}`}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">{project.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {project.sector} • {new Date(project.createdAt).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                    </div>
                    <Badge variant={project.status === 'COMPLETED' ? 'default' : 'secondary'}>
                      {project.status}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions & Usage */}
        <div className="space-y-6">
          {/* Quick Start */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Démarrage rapide</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/projects/new" className="block">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Plus className="w-4 h-4" />
                  Nouveau projet
                </Button>
              </Link>
              <Link href="/help" className="block">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <FileText className="w-4 h-4" />
                  Guide d'utilisation
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Usage Limits */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Utilisation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Projets ce mois</span>
                  <span>{projects.length} / {limits.maxProjects === -1 ? '∞' : limits.maxProjects}</span>
                </div>
                <Progress 
                  value={limits.maxProjects === -1 ? 0 : (projects.length / limits.maxProjects) * 100} 
                />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Exports</span>
                  <span>{projectsData?.exportsUsed || 0} / {limits.maxExports === -1 ? '∞' : limits.maxExports}</span>
                </div>
                <Progress 
                  value={limits.maxExports === -1 ? 0 : ((projectsData?.exportsUsed || 0) / limits.maxExports) * 100} 
                />
              </div>

              {userPlan === 'FREE' && limits.maxProjects - projects.length <= 1 && (
                <div className="p-3 bg-primary/10 rounded-lg text-sm">
                  <p className="font-medium">Limite atteinte !</p>
                  <p className="text-muted-foreground">
                    <Link href="/subscription" className="text-primary hover:underline">
                      Passez à Pro
                    </Link>{' '}
                    pour plus de projets
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
