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
  Sparkles,
  Zap,
  Target,
  Rocket,
  BarChart3,
  ArrowUpRight,
  FileStack,
  Layers,
  Timer
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
    <div className="space-y-10 animate-fade-in-up">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-[hsl(200,60%,40%)] flex items-center justify-center shadow-xl shadow-primary/25">
              <Sparkles className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">
                Bienvenue, <span className="gradient-text">{session?.user?.name || 'Entrepreneur'}</span> 👋
              </h1>
              <p className="text-muted-foreground">
                Gérez vos projets et générez vos documents business
              </p>
            </div>
          </div>
        </div>
        <Link href="/projects/new">
          <Button size="lg" className="btn-gradient gap-3 shadow-xl shadow-primary/30 hover:shadow-primary/50 hover:scale-105 transition-all px-8 py-6 text-base font-semibold">
            <Plus className="w-5 h-5" />
            Nouveau projet
            <ArrowUpRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Projets créés"
          value={projects.length.toString()}
          subtitle={limits.maxProjects === -1 ? 'Illimité' : `${limits.maxProjects - projects.length} restants`}
          icon={<FolderKanban className="w-5 h-5" />}
          color="navy"
          delay="0"
        />
        
        <StatCard
          title="Documents générés"
          value={(projectsData?.totalDocs || 0).toString()}
          subtitle="BMC, Lean Canvas, Business Plans"
          icon={<FileStack className="w-5 h-5" />}
          color="teal"
          delay="1"
        />
        
        <StatCard
          title="Plan actuel"
          value={userPlan}
          subtitle={userPlan === 'FREE' ? 'Passez à Pro →' : 'Toutes les fonctionnalités'}
          icon={<Layers className="w-5 h-5" />}
          color="gold"
          delay="2"
          link={userPlan === 'FREE' ? '/subscription' : undefined}
        />
        
        <StatCard
          title="Temps gagné"
          value={`~${projects.length * 20}h`}
          subtitle="vs création manuelle"
          icon={<Timer className="w-5 h-5" />}
          color="cyan"
          delay="3"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Recent Projects */}
        <Card className="lg:col-span-2 border-border/30 bg-card/80 backdrop-blur-sm shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <FolderKanban className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl">Projets récents</CardTitle>
                  <CardDescription>Vos derniers projets et leurs statuts</CardDescription>
                </div>
              </div>
              <Link href="/projects">
                <Button variant="ghost" size="sm" className="gap-2 hover:bg-primary/10 hover:text-primary font-medium">
                  Voir tout
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-24 skeleton rounded-xl" />
                ))}
              </div>
            ) : recentProjects.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto mb-8 rounded-2xl bg-gradient-to-br from-primary/10 to-[hsl(200,60%,40%)]/10 flex items-center justify-center">
                  <FolderKanban className="w-12 h-12 text-primary" />
                </div>
                <p className="text-xl font-semibold mb-3">Aucun projet pour le moment</p>
                <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
                  Créez votre premier projet pour commencer à générer vos documents business
                </p>
                <Link href="/projects/new">
                  <Button size="lg" className="btn-gradient gap-3 shadow-xl shadow-primary/30 px-8">
                    <Rocket className="w-5 h-5" />
                    Créer votre premier projet
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentProjects.map((project: { id: string; name: string; sector: string; status: string; createdAt: string }, index: number) => (
                  <Link 
                    key={project.id} 
                    href={`/projects/${project.id}`}
                    className="flex items-center justify-between p-5 rounded-xl border border-border/30 hover:bg-muted/50 hover:border-primary/30 transition-all group animate-slide-in-right"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-primary to-[hsl(200,60%,40%)] rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:shadow-primary/40 group-hover:scale-105 transition-all">
                        <Sparkles className="w-7 h-7 text-primary-foreground" />
                      </div>
                      <div>
                        <div className="font-semibold group-hover:text-primary transition-colors text-lg">{project.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {project.sector} • {new Date(project.createdAt).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                    </div>
                    <Badge 
                      variant={project.status === 'COMPLETED' ? 'default' : 'secondary'}
                      className={`font-medium ${project.status === 'COMPLETED' ? 'bg-gradient-to-r from-primary to-[hsl(200,60%,40%)] text-primary-foreground shadow-md' : ''}`}
                    >
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
          <Card className="border-border/30 bg-card/80 backdrop-blur-sm shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <CardTitle className="text-lg">Démarrage rapide</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/projects/new" className="block">
                <Button variant="outline" className="w-full justify-start gap-3 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all py-5 font-medium">
                  <Plus className="w-5 h-5" />
                  Nouveau projet
                </Button>
              </Link>
              <Link href="/assistant" className="block">
                <Button variant="outline" className="w-full justify-start gap-3 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all py-5 font-medium">
                  <Target className="w-5 h-5" />
                  Assistant IA
                </Button>
              </Link>
              <Link href="/help" className="block">
                <Button variant="outline" className="w-full justify-start gap-3 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all py-5 font-medium">
                  <FileText className="w-5 h-5" />
                  Guide d'utilisation
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Usage Limits */}
          <Card className="border-border/30 bg-card/80 backdrop-blur-sm shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-primary" />
                </div>
                <CardTitle className="text-lg">Utilisation</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground font-medium">Projets ce mois</span>
                  <span className="font-semibold">{projects.length} / {limits.maxProjects === -1 ? '∞' : limits.maxProjects}</span>
                </div>
                <Progress 
                  value={limits.maxProjects === -1 ? 0 : (projects.length / limits.maxProjects) * 100}
                  className="h-2.5 bg-muted"
                />
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground font-medium">Exports</span>
                  <span className="font-semibold">{projectsData?.exportsUsed || 0} / {limits.maxExports === -1 ? '∞' : limits.maxExports}</span>
                </div>
                <Progress 
                  value={limits.maxExports === -1 ? 0 : ((projectsData?.exportsUsed || 0) / limits.maxExports) * 100}
                  className="h-2.5 bg-muted"
                />
              </div>

              {userPlan === 'FREE' && limits.maxProjects - projects.length <= 1 && (
                <div className="p-4 bg-gradient-to-r from-primary/10 to-[hsl(200,60%,40%)]/10 rounded-xl border border-primary/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-5 h-5 text-primary" />
                    <p className="font-semibold text-primary">Limite atteinte !</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <Link href="/subscription" className="text-primary hover:underline font-semibold">
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

// Stat Card Component
function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  color,
  delay,
  link 
}: { 
  title: string; 
  value: string; 
  subtitle: string; 
  icon: React.ReactNode; 
  color: string;
  delay: string;
  link?: string;
}) {
  const colorClasses: Record<string, { bg: string; icon: string }> = {
    navy: { 
      bg: 'from-primary/15 to-[hsl(200,60%,40%)]/10', 
      icon: 'text-primary' 
    },
    teal: { 
      bg: 'from-[hsl(180,60%,40%)]/15 to-[hsl(180,50%,45%)]/10', 
      icon: 'text-[hsl(180,60%,35%)] dark:text-[hsl(180,60%,60%)]' 
    },
    cyan: { 
      bg: 'from-[hsl(190,70%,45%)]/15 to-[hsl(200,60%,50%)]/10', 
      icon: 'text-[hsl(190,70%,40%)] dark:text-[hsl(190,70%,60%)]' 
    },
    gold: { 
      bg: 'from-[hsl(35,90%,50%)]/15 to-[hsl(25,85%,55%)]/10', 
      icon: 'text-[hsl(35,90%,45%)] dark:text-[hsl(35,90%,60%)]' 
    },
    green: { 
      bg: 'from-[hsl(140,60%,40%)]/15 to-[hsl(150,55%,45%)]/10', 
      icon: 'text-[hsl(140,60%,35%)] dark:text-[hsl(140,60%,55%)]' 
    },
  };

  const content = (
    <Card 
      className={`stat-card border-border/30 bg-card/80 backdrop-blur-sm card-hover animate-fade-in-up shadow-lg`}
      style={{ animationDelay: `${parseInt(delay) * 100}ms` }}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${colorClasses[color]?.bg} flex items-center justify-center`}>
          <span className={colorClasses[color]?.icon}>{icon}</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold gradient-text">{value}</div>
        <p className={`text-sm mt-2 font-medium ${link ? 'text-primary hover:underline cursor-pointer' : 'text-muted-foreground'}`}>
          {subtitle}
        </p>
      </CardContent>
    </Card>
  );

  if (link) {
    return <Link href={link}>{content}</Link>;
  }

  return content;
}
