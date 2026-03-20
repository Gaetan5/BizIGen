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
  Loader2
} from 'lucide-react';
import Link from 'next/link';

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
  totalProjects: number;
  totalDocuments: number;
  totalExports: number;
  revenue: {
    monthly: number;
    currency: string;
  };
  planDistribution: {
    FREE: number;
    BASIC: number;
    PRO: number;
  };
}

async function fetchAdminStats(token: string): Promise<AdminStats | null> {
  try {
    const response = await fetch('/admin/stats?XTransformPort=3001', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
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
      const token = localStorage.getItem('bizgen_token');
      if (!token) {
        if (mounted) setLoading(false);
        return;
      }

      const data = await fetchAdminStats(token);
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
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2">Accès refusé</h2>
        <p className="text-muted-foreground">
          Vous devez être administrateur pour accéder à cette page.
        </p>
      </div>
    );
  }

  const totalPaidUsers = stats.planDistribution.BASIC + stats.planDistribution.PRO;

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
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.newUsersThisMonth} ce mois
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Projets</CardTitle>
            <FolderKanban className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProjects}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeUsers} utilisateurs actifs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Documents</CardTitle>
            <FileText className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDocuments}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalExports} exports
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Revenus mensuels</CardTitle>
            <DollarSign className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.revenue.monthly} {stats.revenue.currency}
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
            <CardTitle>Distribution des plans</CardTitle>
            <CardDescription>Répartition des utilisateurs par offre</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-2">
                  <Badge variant="secondary">FREE</Badge>
                  Gratuit
                </span>
                <span className="font-medium">{stats.planDistribution.FREE}</span>
              </div>
              <Progress 
                value={(stats.planDistribution.FREE / stats.totalUsers) * 100} 
                className="h-2"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-2">
                  <Badge className="bg-blue-500">BASIC</Badge>
                  7€/mois
                </span>
                <span className="font-medium">{stats.planDistribution.BASIC}</span>
              </div>
              <Progress 
                value={(stats.planDistribution.BASIC / stats.totalUsers) * 100} 
                className="h-2 [&>div]:bg-blue-500"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-2">
                  <Badge className="bg-amber-500">PRO</Badge>
                  19€/mois
                </span>
                <span className="font-medium">{stats.planDistribution.PRO}</span>
              </div>
              <Progress 
                value={(stats.planDistribution.PRO / stats.totalUsers) * 100} 
                className="h-2 [&>div]:bg-amber-500"
              />
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Actions rapides</CardTitle>
            <CardDescription>Gestion de la plateforme</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Link href="/admin/users">
              <Button variant="outline" className="w-full justify-between">
                <span className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Gérer les utilisateurs
                </span>
                <ArrowUpRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/admin/subscriptions">
              <Button variant="outline" className="w-full justify-between">
                <span className="flex items-center gap-2">
                  <Crown className="w-4 h-4" />
                  Gérer les abonnements
                </span>
                <ArrowUpRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/admin/projects">
              <Button variant="outline" className="w-full justify-between">
                <span className="flex items-center gap-2">
                  <FolderKanban className="w-4 h-4" />
                  Voir tous les projets
                </span>
                <ArrowUpRight className="w-4 h-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Conversion Rate */}
      <Card>
        <CardHeader>
          <CardTitle>Taux de conversion</CardTitle>
          <CardDescription>Utilisateurs passant de Free à un plan payant</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="text-4xl font-bold text-primary">
              {stats.totalUsers > 0 
                ? Math.round((totalPaidUsers / stats.totalUsers) * 100) 
                : 0}%
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">
                {totalPaidUsers} utilisateurs sur {stats.totalUsers} ont souscrit à un plan payant
              </p>
              <Progress 
                value={(totalPaidUsers / stats.totalUsers) * 100} 
                className="mt-2 h-3"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
