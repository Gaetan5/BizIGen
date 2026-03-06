'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Users, 
  FolderKanban, 
  Euro, 
  TrendingUp,
  Crown,
  Activity,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { authApi } from '@/lib/fastapi-client';

interface AdminStats {
  total_users: number;
  total_projects: number;
  total_revenue: number;
  active_subscriptions: number;
  projects_this_month: number;
  users_this_month: number;
  plan_distribution: Record<string, number>;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    
    const token = authApi.getToken();
    if (!token) {
      setError('Non authentifié');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/admin/stats?XTransformPort=3001', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des statistiques');
      }

      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-1" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-destructive mb-4">{error}</p>
            <button 
              onClick={fetchStats}
              className="text-primary hover:underline"
            >
              Réessayer
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Utilisateurs',
      value: stats?.total_users || 0,
      description: `${stats?.users_this_month || 0} nouveaux ce mois`,
      icon: Users,
      trend: 'up',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Projets',
      value: stats?.total_projects || 0,
      description: `${stats?.projects_this_month || 0} créés ce mois`,
      icon: FolderKanban,
      trend: 'up',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Revenus mensuels',
      value: `${(stats?.total_revenue || 0).toFixed(0)}€`,
      description: 'Basé sur les abonnements actifs',
      icon: Euro,
      trend: 'up',
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
    },
    {
      title: 'Abonnements actifs',
      value: stats?.active_subscriptions || 0,
      description: `${stats?.plan_distribution?.PRO || 0} Pro, ${stats?.plan_distribution?.BASIC || 0} Basic`,
      icon: Crown,
      trend: 'up',
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Admin</h1>
        <p className="text-muted-foreground">
          Vue d&apos;ensemble de la plateforme BizGen AI
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                {stat.trend === 'up' ? (
                  <ArrowUpRight className="h-3 w-3 text-green-500" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 text-red-500" />
                )}
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Distribution & Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Plan Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Distribution des Plans
            </CardTitle>
            <CardDescription>
              Répartition des utilisateurs par plan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-gray-100 dark:bg-gray-800">FREE</Badge>
                  <span className="text-sm">Plan gratuit</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{stats?.plan_distribution?.FREE || 0}</span>
                  <span className="text-xs text-muted-foreground">utilisateurs</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">BASIC</Badge>
                  <span className="text-sm">Plan Basic (7€/mois)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{stats?.plan_distribution?.BASIC || 0}</span>
                  <span className="text-xs text-muted-foreground">utilisateurs</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="bg-gradient-to-r from-purple-500 to-pink-500">PRO</Badge>
                  <span className="text-sm">Plan Pro (19€/mois)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{stats?.plan_distribution?.PRO || 0}</span>
                  <span className="text-xs text-muted-foreground">utilisateurs</span>
                </div>
              </div>
            </div>

            {/* Progress bars */}
            <div className="mt-6 space-y-2">
              {stats?.plan_distribution && (
                <>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-12">FREE</span>
                    <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-gray-400 h-full transition-all duration-500"
                        style={{ 
                          width: `${Math.max(5, ((stats.plan_distribution.FREE || 0) / (stats.total_users || 1)) * 100)}%` 
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-12">BASIC</span>
                    <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-blue-500 h-full transition-all duration-500"
                        style={{ 
                          width: `${Math.max(5, ((stats.plan_distribution.BASIC || 0) / (stats.total_users || 1)) * 100)}%` 
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-12">PRO</span>
                    <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all duration-500"
                        style={{ 
                          width: `${Math.max(5, ((stats.plan_distribution.PRO || 0) / (stats.total_users || 1)) * 100)}%` 
                        }}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Activité Récente
            </CardTitle>
            <CardDescription>
              Statistiques du mois en cours
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div>
                  <p className="text-sm text-muted-foreground">Nouveaux utilisateurs</p>
                  <p className="text-2xl font-bold">{stats?.users_this_month || 0}</p>
                </div>
                <div className="p-3 rounded-full bg-green-500/10">
                  <Users className="h-6 w-6 text-green-500" />
                </div>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div>
                  <p className="text-sm text-muted-foreground">Projets créés</p>
                  <p className="text-2xl font-bold">{stats?.projects_this_month || 0}</p>
                </div>
                <div className="p-3 rounded-full bg-blue-500/10">
                  <FolderKanban className="h-6 w-6 text-blue-500" />
                </div>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div>
                  <p className="text-sm text-muted-foreground">Revenus potentiels</p>
                  <p className="text-2xl font-bold">{(stats?.total_revenue || 0).toFixed(0)}€</p>
                </div>
                <div className="p-3 rounded-full bg-yellow-500/10">
                  <Euro className="h-6 w-6 text-yellow-500" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
