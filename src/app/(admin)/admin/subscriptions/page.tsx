'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  CreditCard, 
  AlertCircle, 
  RefreshCw,
  Crown,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp
} from 'lucide-react';
import { authApi } from '@/lib/fastapi-client';

interface AdminSubscription {
  id: string;
  user_id: string;
  user_email: string;
  user_name: string | null;
  plan: string;
  status: string;
  projects_used: number;
  exports_used: number;
  current_period_end: string | null;
  created_at: string;
}

export default function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<AdminSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [planFilter, setPlanFilter] = useState<string>('');

  const fetchSubscriptions = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    const token = authApi.getToken();
    if (!token) {
      setError('Non authentifié');
      setLoading(false);
      return;
    }

    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (planFilter) params.append('plan', planFilter);

      const response = await fetch(`/admin/subscriptions?${params}&XTransformPort=3001`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des abonnements');
      }

      const data = await response.json();
      setSubscriptions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, planFilter]);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <CheckCircle className="h-3 w-3" />;
      case 'INACTIVE':
        return <XCircle className="h-3 w-3" />;
      case 'PAST_DUE':
        return <Clock className="h-3 w-3" />;
      case 'CANCELED':
        return <XCircle className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  const getStatusBadgeVariant = (status: string): "default" | "secondary" | "outline" | "destructive" => {
    switch (status) {
      case 'ACTIVE':
        return 'default';
      case 'INACTIVE':
        return 'secondary';
      case 'PAST_DUE':
        return 'destructive';
      case 'CANCELED':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getPlanBadgeVariant = (plan: string): "default" | "secondary" | "outline" => {
    switch (plan) {
      case 'PRO':
        return 'default';
      case 'BASIC':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getPlanPrice = (plan: string): string => {
    switch (plan) {
      case 'PRO':
        return '19€/mois';
      case 'BASIC':
        return '7€/mois';
      default:
        return 'Gratuit';
    }
  };

  // Calculate stats
  const stats = {
    total: subscriptions.length,
    active: subscriptions.filter(s => s.status === 'ACTIVE').length,
    pro: subscriptions.filter(s => s.plan === 'PRO').length,
    basic: subscriptions.filter(s => s.plan === 'BASIC').length,
  };

  const totalRevenue = (stats.pro * 19) + (stats.basic * 7);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestion des Abonnements</h1>
        <p className="text-muted-foreground">
          Gérer les abonnements et les paiements
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">abonnements</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Actifs</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
            <p className="text-xs text-muted-foreground">abonnements actifs</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pro</CardTitle>
            <Crown className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pro}</div>
            <p className="text-xs text-muted-foreground">plans Pro</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Revenus</CardTitle>
            <TrendingUp className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRevenue}€</div>
            <p className="text-xs text-muted-foreground">revenus mensuels</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Filtrer par statut</label>
              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value === 'all' ? '' : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tous les statuts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="ACTIVE">Actif</SelectItem>
                  <SelectItem value="INACTIVE">Inactif</SelectItem>
                  <SelectItem value="PAST_DUE">En retard</SelectItem>
                  <SelectItem value="CANCELED">Annulé</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Filtrer par plan</label>
              <Select
                value={planFilter}
                onValueChange={(value) => setPlanFilter(value === 'all' ? '' : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tous les plans" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les plans</SelectItem>
                  <SelectItem value="PRO">Pro</SelectItem>
                  <SelectItem value="BASIC">Basic</SelectItem>
                  <SelectItem value="FREE">Free</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                size="icon"
                onClick={() => fetchSubscriptions()}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscriptions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des Abonnements</CardTitle>
          <CardDescription>
            Tous les abonnements de la plateforme
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {error ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="h-12 w-12 text-destructive mb-4" />
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={fetchSubscriptions} variant="outline">
                Réessayer
              </Button>
            </div>
          ) : loading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-3 w-[150px]" />
                  </div>
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
          ) : subscriptions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CreditCard className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Aucun abonnement trouvé</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-center">Projets</TableHead>
                    <TableHead className="text-center">Exports</TableHead>
                    <TableHead>Fin de période</TableHead>
                    <TableHead>Créé le</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscriptions.map((sub) => (
                    <TableRow key={sub.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              {sub.user_name?.charAt(0) || sub.user_email.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{sub.user_name || 'Sans nom'}</p>
                            <p className="text-sm text-muted-foreground">{sub.user_email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge variant={getPlanBadgeVariant(sub.plan)} className="w-fit">
                            {sub.plan === 'PRO' && <Crown className="h-3 w-3 mr-1" />}
                            {sub.plan}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{getPlanPrice(sub.plan)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(sub.status)} className="gap-1">
                          {getStatusIcon(sub.status)}
                          {sub.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-medium">{sub.projects_used}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-medium">{sub.exports_used}</span>
                      </TableCell>
                      <TableCell>
                        {sub.current_period_end ? (
                          new Date(sub.current_period_end).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(sub.created_at).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
