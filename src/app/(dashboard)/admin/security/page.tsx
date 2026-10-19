'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Lock, 
  Key, 
  FileSearch, 
  RefreshCw, 
  Clock, 
  User, 
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { toast } from 'sonner';

interface AuditLogItem {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata: string | null;
  createdAt: string;
  user: {
    id: string;
    email: string;
    name: string | null;
    role: string;
  } | null;
}

interface SecurityData {
  logs: AuditLogItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  securityConfig: Record<string, string | boolean>;
}

export default function AdminSecurityPage() {
  const [data, setData] = useState<SecurityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const fetchSecurity = async (pageNum = 1) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/security?page=${pageNum}`);
      if (!res.ok) throw new Error('Impossible de charger les journaux');
      const json = await res.json();
      setData(json);
      setPage(pageNum);
    } catch (err: any) {
      toast.error(err.message || 'Erreur sécurité');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch(`/api/admin/security?page=1`);
        if (!res.ok || cancelled) return;
        const json = await res.json();
        if (!cancelled) {
          setData(json);
          setLoading(false);
        }
      } catch {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const getActionBadge = (action: string) => {
    if (action.includes('PASSWORD')) {
      return <Badge className="bg-amber-600 text-white font-mono text-xs">{action}</Badge>;
    }
    if (action.includes('DELETE')) {
      return <Badge className="bg-destructive text-white font-mono text-xs">{action}</Badge>;
    }
    if (action.includes('IMPERSONATION')) {
      return <Badge className="bg-purple-600 text-white font-mono text-xs">{action}</Badge>;
    }
    return <Badge variant="outline" className="font-mono text-xs">{action}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Lock className="w-6 h-6 text-primary" />
            Sécurité & Audit Logs
          </h1>
          <p className="text-muted-foreground text-sm">
            Traçabilité des actions sensibles, contrôles d'accès et posture de sécurité
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => fetchSecurity(page)} 
          disabled={loading}
          className="gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Rafraîchir
        </Button>
      </div>

      {/* Security Posture Cards */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            Contrôles de Sécurité Actifs
          </CardTitle>
          <CardDescription>
            Paramètres cryptographiques et défenses en profondeur appliqués à BizGen AI
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="p-3 border rounded-lg flex items-center justify-between">
              <div>
                <div className="font-semibold text-xs">Chiffrement en Transit</div>
                <div className="text-xs text-muted-foreground">TLS 1.3 / HTTPS forcé</div>
              </div>
              <Badge className="bg-emerald-600 text-white text-xs">Actif</Badge>
            </div>

            <div className="p-3 border rounded-lg flex items-center justify-between">
              <div>
                <div className="font-semibold text-xs">Cookies de Session</div>
                <div className="text-xs text-muted-foreground">HttpOnly + __Secure- + SameSite</div>
              </div>
              <Badge className="bg-emerald-600 text-white text-xs">Renforcé</Badge>
            </div>

            <div className="p-3 border rounded-lg flex items-center justify-between">
              <div>
                <div className="font-semibold text-xs">Hachage des Mots de Passe</div>
                <div className="text-xs text-muted-foreground">bcrypt (Salt rounds : 12)</div>
              </div>
              <Badge className="bg-emerald-600 text-white text-xs">Standard OWASP</Badge>
            </div>

            <div className="p-3 border rounded-lg flex items-center justify-between">
              <div>
                <div className="font-semibold text-xs">Contrôle d'Accès (RBAC)</div>
                <div className="text-xs text-muted-foreground">Isolation stricte des projets</div>
              </div>
              <Badge className="bg-emerald-600 text-white text-xs">Actif</Badge>
            </div>

            <div className="p-3 border rounded-lg flex items-center justify-between">
              <div>
                <div className="font-semibold text-xs">Clé API Inter-Services</div>
                <div className="text-xs text-muted-foreground">En-tête X-Internal-API-Key</div>
              </div>
              <Badge className="bg-emerald-600 text-white text-xs">Vérifié</Badge>
            </div>

            <div className="p-3 border rounded-lg flex items-center justify-between">
              <div>
                <div className="font-semibold text-xs">Audit Logging</div>
                <div className="text-xs text-muted-foreground">Traces immuables en base</div>
              </div>
              <Badge className="bg-emerald-600 text-white text-xs">Actif</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileSearch className="w-5 h-5 text-primary" />
            Journal d'Audit des Actions Sensibles ({data?.pagination.total ?? 0})
          </CardTitle>
          <CardDescription>
            Historique de toutes les opérations administratives et modifications de privilèges
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading && !data ? (
            <div className="text-center py-8 text-muted-foreground">Chargement des traces...</div>
          ) : !data?.logs || data.logs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucun événement d'audit enregistré pour le moment.
            </div>
          ) : (
            <div className="space-y-3">
              {data.logs.map((log) => (
                <div key={log.id} className="p-3 rounded-lg border bg-card/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {getActionBadge(log.action)}
                      <span className="text-xs text-muted-foreground">
                        Entité : <span className="font-medium text-foreground">{log.entityType}</span> ({log.entityId.slice(0, 8)}...)
                      </span>
                    </div>
                    {log.metadata && (
                      <p className="text-xs text-muted-foreground font-mono bg-muted/40 p-1 rounded max-w-xl truncate">
                        {log.metadata}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0">
                    {log.user && (
                      <span className="flex items-center gap-1 font-medium text-foreground">
                        <User className="w-3.5 h-3.5" />
                        {log.user.name || log.user.email}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(log.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}

              {/* Pagination */}
              {data.pagination.totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => fetchSecurity(page - 1)}
                  >
                    Précédent
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    Page {page} sur {data.pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= data.pagination.totalPages}
                    onClick={() => fetchSecurity(page + 1)}
                  >
                    Suivant
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
