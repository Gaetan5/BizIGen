'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CreditCard, 
  ArrowLeft, 
  DollarSign, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  Loader2,
  Calendar,
  User,
  ShieldAlert
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SubscriptionItem {
  id: string;
  userId: string;
  plan: 'FREE' | 'BASIC' | 'PRO';
  status: 'ACTIVE' | 'INACTIVE' | 'PAST_DUE' | 'CANCELED';
  projectsUsed: number;
  exportsUsed: number;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  updatedAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    createdAt: string;
  };
}

interface PaymentItem {
  id: string;
  amount: number;
  currency: string;
  provider: string;
  providerRef: string;
  status: string;
  createdAt: string;
}

export default function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<SubscriptionItem[]>([]);
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [metrics, setMetrics] = useState({ mrr: 0, activeSubscriptions: 0, totalTracked: 0 });
  const [loading, setLoading] = useState(true);
  const [planFilter, setPlanFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    let cancelled = false;

    const loadSubscriptions = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          page: page.toString(),
          limit: '10',
          plan: planFilter,
          status: statusFilter,
        });

        const res = await fetch(`/api/admin/subscriptions?${params.toString()}`);
        if (res.ok && !cancelled) {
          const data = await res.json();
          setSubscriptions(data.subscriptions || []);
          setPayments(data.recentPayments || []);
          setMetrics(data.metrics || { mrr: 0, activeSubscriptions: 0, totalTracked: 0 });
          setTotalPages(data.pagination.totalPages || 1);
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadSubscriptions();

    return () => { cancelled = true; };
  }, [page, planFilter, statusFilter]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge className="bg-green-600">Actif</Badge>;
      case 'PAST_DUE':
        return <Badge variant="destructive">Paiement échoué</Badge>;
      case 'CANCELED':
        return <Badge variant="secondary">Résilié</Badge>;
      default:
        return <Badge variant="outline">Inactif</Badge>;
    }
  };

  const getPlanBadge = (plan: string) => {
    switch (plan) {
      case 'PRO':
        return <Badge className="bg-amber-500 font-semibold">PRO (19€)</Badge>;
      case 'BASIC':
        return <Badge className="bg-blue-500 font-semibold">BASIC (7€)</Badge>;
      default:
        return <Badge variant="secondary">FREE (0€)</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/admin">
              <Button variant="ghost" size="sm" className="gap-1 px-2">
                <ArrowLeft className="w-4 h-4" />
                Admin
              </Button>
            </Link>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-primary" />
              Gestion des Abonnements & Revenus
            </h1>
          </div>
          <p className="text-muted-foreground text-sm">
            Monétisation, formules tarifaires et historique des transactions.
          </p>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">MRR Récurrent Estimé</CardTitle>
            <DollarSign className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold">{metrics.mrr} € <span className="text-sm font-normal text-muted-foreground">/ mois</span></div>
            <p className="text-xs text-muted-foreground mt-1">Revenu récurrent mensuel des comptes actifs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Abonnements Actifs</CardTitle>
            <CheckCircle2 className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold">{metrics.activeSubscriptions}</div>
            <p className="text-xs text-muted-foreground mt-1">Clients actuellement facturés</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Suivi</CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold">{metrics.totalTracked}</div>
            <p className="text-xs text-muted-foreground mt-1">Historique d'abonnements créés</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex gap-3 w-full sm:w-auto">
          <Select value={planFilter} onValueChange={(val) => { setPlanFilter(val); setPage(1); }}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Formule" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Toutes les formules</SelectItem>
              <SelectItem value="FREE">FREE</SelectItem>
              <SelectItem value="BASIC">BASIC</SelectItem>
              <SelectItem value="PRO">PRO</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val); setPage(1); }}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tous les statuts</SelectItem>
              <SelectItem value="ACTIVE">Actif</SelectItem>
              <SelectItem value="INACTIVE">Inactif</SelectItem>
              <SelectItem value="PAST_DUE">En retard</SelectItem>
              <SelectItem value="CANCELED">Annulé</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Subscriptions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Comptes abonnés</CardTitle>
          <CardDescription>Détail des quotas de projets et exports consommés</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : subscriptions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Aucun abonnement trouvé.
            </div>
          ) : (
            <div className="space-y-4">
              {subscriptions.map((s) => (
                <div
                  key={s.id}
                  className="p-4 rounded-lg border bg-card/50 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{s.user.name || s.user.email}</span>
                      {getPlanBadge(s.plan)}
                      {getStatusBadge(s.status)}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5" />
                        {s.user.email}
                      </span>
                      <span>Projets utilisés : {s.projectsUsed}</span>
                      <span>Exports consommés : {s.exportsUsed}</span>
                      {s.currentPeriodEnd && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          Renouvellement : {new Date(s.currentPeriodEnd).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <Link href={`/admin/users`}>
                    <Button variant="outline" size="sm">
                      Gérer l'utilisateur
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-6 border-t mt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
              >
                Précédent
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} sur {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
              >
                Suivant
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Payments Log */}
      {payments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Dernières transactions</CardTitle>
            <CardDescription>Flux de facturation en direct</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {payments.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-md border text-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      €
                    </div>
                    <div>
                      <div className="font-medium">{(p.amount / 100).toFixed(2)} {p.currency}</div>
                      <div className="text-xs text-muted-foreground">
                        {p.provider} · Réf: {p.providerRef.slice(0, 16)}...
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={p.status === 'COMPLETED' ? 'default' : 'secondary'}>
                      {p.status}
                    </Badge>
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
