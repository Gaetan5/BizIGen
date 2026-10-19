'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  FolderKanban, 
  FileText, 
  TrendingUp, 
  DollarSign,
  Crown,
  Activity,
  ArrowUpRight,
  Loader2,
  CreditCard
} from 'lucide-react';
import Link from 'next/link';

interface AdminStats {
  users: {
    total: number;
    newThisMonth: number;
    growth: string;
  };
  subscriptions: {
    FREE: number;
    BASIC: number;
    PRO: number;
  };
  projects: {
    total: number;
    thisMonth: number;
  };
  documents: {
    total: number;
    thisMonth: number;
  };
  exports: {
    total: number;
    thisMonth: number;
  };
  revenue: {
    thisMonth: number;
    total: number;
  };
  charts: {
    sectorDistribution: Array<{ sector: string; count: number }>;
    countryDistribution: Array<{ country: string; count: number }>;
  };
}

async function fetchAdminStats(): Promise<AdminStats | null> {
  try {
    const response = await fetch('/api/admin/stats', {
      method: 'GET',
      credentials: 'include',
    });
    
    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    const loadData = async () => {
      const data = await fetchAdminStats();
      if (mounted) {
        setStats(data);
        setLoading(false);
      }
    };
    
    loadData();
    
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2">Accès refusé</h2>
        <p className="text-muted-foreground">
          Vous devez posséder le rôle Administrateur pour accéder à cette console de gestion.
        </p>
      </div>
    );
  }

  const totalPaidUsers = (stats.subscriptions.BASIC || 0) + (stats.subscriptions.PRO || 0);
  const totalUsers = stats.users.total || 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard Admin</h1>
          <p className="text-muted-foreground">
            Vue d'ensemble de votre plateforme BizGen AI
          </p>
        </div>
        <Badge variant="outline" className="gap-1">
          <Activity className="w-3 h-3" />
          Temps réel
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Utilisateurs</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.users.total}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.users.newThisMonth} ce mois ({stats.users.growth}% croissance)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Projets</CardTitle>
            <FolderKanban className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.projects.total}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.projects.thisMonth} créés ce mois
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Documents & Exports</CardTitle>
            <FileText className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.documents.total} docs</div>
            <p className="text-xs text-muted-foreground">
              {stats.exports.total} téléchargements ({stats.exports.thisMonth} ce mois)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Revenus mensuels estimés</CardTitle>
            <DollarSign className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.revenue.thisMonth} €
            </div>
            <p className="text-xs text-muted-foreground">
              {totalPaidUsers} abonnés payants
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Plan Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribution des abonnements</CardTitle>
            <CardDescription>Répartition des utilisateurs par formule active</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-2">
                  <Badge variant="secondary">FREE</Badge>
                  Gratuit
                </span>
                <span className="font-medium">{stats.subscriptions.FREE || 0}</span>
              </div>
              <Progress 
                value={((stats.subscriptions.FREE || 0) / totalUsers) * 100} 
                className="h-2"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-2">
                  <Badge className="bg-blue-500">BASIC</Badge>
                  7€/mois
                </span>
                <span className="font-medium">{stats.subscriptions.BASIC || 0}</span>
              </div>
              <Progress 
                value={((stats.subscriptions.BASIC || 0) / totalUsers) * 100} 
                className="h-2 [&>div]:bg-blue-500"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-2">
                  <Badge className="bg-amber-500">PRO</Badge>
                  19€/mois
                </span>
                <span className="font-medium">{stats.subscriptions.PRO || 0}</span>
              </div>
              <Progress 
                value={((stats.subscriptions.PRO || 0) / totalUsers) * 100} 
                className="h-2 [&>div]:bg-amber-500"
              />
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions & Sectors */}
        <Card>
          <CardHeader>
            <CardTitle>Actions & Secteurs Clés</CardTitle>
            <CardDescription>Navigation rapide et top secteurs</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Link href="/admin/users">
                <Button variant="outline" className="w-full justify-between">
                  <span className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Gérer les utilisateurs et rôles
                  </span>
                  <ArrowUpRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/admin/projects">
                <Button variant="outline" className="w-full justify-between">
                  <span className="flex items-center gap-2">
                    <FolderKanban className="w-4 h-4" />
                    Superviser tous les projets
                  </span>
                  <ArrowUpRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/admin/subscriptions">
                <Button variant="outline" className="w-full justify-between">
                  <span className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-amber-500" />
                    Abonnements & Finances
                  </span>
                  <ArrowUpRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/admin/monitoring">
                <Button variant="outline" className="w-full justify-between">
                  <span className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-cyan-500" />
                    Monitoring & Santé Système
                  </span>
                  <ArrowUpRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/admin/security">
                <Button variant="outline" className="w-full justify-between">
                  <span className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-red-500" />
                    Sécurité & Audit Logs
                  </span>
                  <ArrowUpRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            <div className="pt-2">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Top Secteurs d'activité
              </h4>
              <div className="flex flex-wrap gap-2">
                {stats.charts.sectorDistribution?.length > 0 ? (
                  stats.charts.sectorDistribution.map((item, idx) => (
                    <Badge key={idx} variant="outline" className="px-2.5 py-1">
                      {item.sector || 'Général'} : {item.count}
                    </Badge>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground">Aucun secteur enregistré</p>
                )}
              </div>
            </div>

            <div className="pt-2">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Top Pays cibles
              </h4>
              <div className="flex flex-wrap gap-2">
                {stats.charts.countryDistribution?.length > 0 ? (
                  stats.charts.countryDistribution.map((item, idx) => (
                    <Badge key={idx} variant="secondary" className="px-2.5 py-1">
                      {item.country || 'International'} : {item.count}
                    </Badge>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground">Aucun pays enregistré</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Conversion Rate */}
      <Card>
        <CardHeader>
          <CardTitle>Taux de conversion global</CardTitle>
          <CardDescription>Pourcentage d'utilisateurs convertis en forfaits payants</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="text-4xl font-bold text-primary">
              {totalUsers > 0 
                ? Math.round((totalPaidUsers / totalUsers) * 100) 
                : 0}%
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">
                {totalPaidUsers} client(s) payant(s) sur {totalUsers} compte(s) enregistré(s)
              </p>
              <Progress 
                value={(totalPaidUsers / totalUsers) * 100} 
                className="mt-2 h-3"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
