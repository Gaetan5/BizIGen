'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  Database, 
  Server, 
  Cpu, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  HardDrive,
  Users,
  FolderKanban,
  FileText,
  Download,
  ShieldCheck,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';

interface MonitoringData {
  status: string;
  checkedAt: string;
  responseTimeMs: number;
  services: {
    database: {
      name: string;
      status: string;
      latencyMs: number;
    };
    apiBackend: {
      name: string;
      status: string;
      latencyMs: number;
      details?: any;
    };
    frontend: {
      name: string;
      status: string;
      systemInfo: {
        nodeVersion: string;
        platform: string;
        uptimeSeconds: number;
        memory: {
          rssMb: number;
          heapUsedMb: number;
          heapTotalMb: number;
        };
      };
    };
  };
  counts: {
    users: number;
    projects: number;
    generatedDocuments: number;
    exports: number;
    auditLogs: number;
  };
}

export default function AdminMonitoringPage() {
  const [data, setData] = useState<MonitoringData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMonitoring = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/monitoring');
      if (!res.ok) throw new Error('Impossible de charger les métriques');
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      toast.error(err.message || 'Erreur monitoring');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch('/api/admin/monitoring');
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
    const interval = setInterval(load, 20000); // Poll every 20s
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const getStatusBadge = (status: string) => {
    if (status === 'healthy' || status === 'HEALTHY') {
      return (
        <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Opérationnel
        </Badge>
      );
    }
    if (status === 'degraded' || status === 'DEGRADED') {
      return (
        <Badge className="bg-amber-600 hover:bg-amber-700 text-white gap-1">
          <AlertTriangle className="w-3.5 h-3.5" />
          Dégradé
        </Badge>
      );
    }
    return (
      <Badge className="bg-destructive text-white gap-1">
        <XCircle className="w-3.5 h-3.5" />
        Hors-ligne
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Activity className="w-6 h-6 text-primary" />
            Monitoring & Santé du Système
          </h1>
          <p className="text-muted-foreground text-sm">
            Surveillance en temps réel des micro-services, de la base de données et de la charge serveur
          </p>
        </div>
        <div className="flex items-center gap-2">
          {data && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              Mis à jour : {new Date(data.checkedAt).toLocaleTimeString()}
            </span>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchMonitoring} 
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Rafraîchir
          </Button>
        </div>
      </div>

      {/* Global Status Banner */}
      {data && (
        <Card className={`border-l-4 ${data.status === 'HEALTHY' ? 'border-l-emerald-500 bg-emerald-50/20' : 'border-l-amber-500 bg-amber-50/20'}`}>
          <CardContent className="py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShieldCheck className={`w-6 h-6 ${data.status === 'HEALTHY' ? 'text-emerald-600' : 'text-amber-600'}`} />
              <div>
                <h3 className="font-semibold text-base">État Global de la Plateforme : {data.status}</h3>
                <p className="text-xs text-muted-foreground">
                  Tous les composants critiques répondent en {data.responseTimeMs} ms
                </p>
              </div>
            </div>
            {getStatusBadge(data.status)}
          </CardContent>
        </Card>
      )}

      {/* Service Health Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* PostgreSQL */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-500" />
              PostgreSQL 16
            </CardTitle>
            {data && getStatusBadge(data.services.database.status)}
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between py-1 border-b text-xs">
              <span className="text-muted-foreground">Type</span>
              <span className="font-medium">Relationnel (Prisma + SQLAlchemy)</span>
            </div>
            <div className="flex justify-between py-1 border-b text-xs">
              <span className="text-muted-foreground">Latence requête</span>
              <span className="font-medium text-emerald-600 font-mono">
                {data?.services.database.latencyMs ?? '--'} ms
              </span>
            </div>
            <div className="flex justify-between py-1 text-xs">
              <span className="text-muted-foreground">Persistance</span>
              <span className="font-medium">Volume Docker persistant</span>
            </div>
          </CardContent>
        </Card>

        {/* FastAPI Backend */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Server className="w-5 h-5 text-emerald-500" />
              FastAPI Core API
            </CardTitle>
            {data && getStatusBadge(data.services.apiBackend.status)}
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between py-1 border-b text-xs">
              <span className="text-muted-foreground">Rôle</span>
              <span className="font-medium">Moteur IA & Générations</span>
            </div>
            <div className="flex justify-between py-1 border-b text-xs">
              <span className="text-muted-foreground">Latence healthcheck</span>
              <span className="font-medium text-emerald-600 font-mono">
                {data?.services.apiBackend.latencyMs ?? '--'} ms
              </span>
            </div>
            <div className="flex justify-between py-1 text-xs">
              <span className="text-muted-foreground">Version API</span>
              <span className="font-medium font-mono">
                {data?.services.apiBackend.details?.version || 'v0.2.0'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Next.js Frontend */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Cpu className="w-5 h-5 text-indigo-500" />
              Next.js Frontend
            </CardTitle>
            {data && getStatusBadge(data.services.frontend.status)}
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between py-1 border-b text-xs">
              <span className="text-muted-foreground">Environnement Node</span>
              <span className="font-medium font-mono">{data?.services.frontend.systemInfo.nodeVersion || 'Node.js'}</span>
            </div>
            <div className="flex justify-between py-1 border-b text-xs">
              <span className="text-muted-foreground">Mémoire Heap utilisée</span>
              <span className="font-medium font-mono">{data?.services.frontend.systemInfo.memory.heapUsedMb ?? '--'} Mo</span>
            </div>
            <div className="flex justify-between py-1 text-xs">
              <span className="text-muted-foreground">Uptime service</span>
              <span className="font-medium">
                {data?.services.frontend.systemInfo.uptimeSeconds 
                  ? `${Math.floor(data.services.frontend.systemInfo.uptimeSeconds / 60)} min`
                  : '--'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Database Objects Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-primary" />
            Volumétrie des Données en Production
          </CardTitle>
          <CardDescription>
            Nombre d'enregistrements actifs stockés dans la base de données
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-center">
            <div className="p-4 rounded-lg border bg-muted/20">
              <Users className="w-5 h-5 mx-auto text-blue-500 mb-1" />
              <div className="text-2xl font-bold">{data?.counts.users ?? '--'}</div>
              <div className="text-xs text-muted-foreground">Utilisateurs</div>
            </div>
            <div className="p-4 rounded-lg border bg-muted/20">
              <FolderKanban className="w-5 h-5 mx-auto text-emerald-500 mb-1" />
              <div className="text-2xl font-bold">{data?.counts.projects ?? '--'}</div>
              <div className="text-xs text-muted-foreground">Projets créés</div>
            </div>
            <div className="p-4 rounded-lg border bg-muted/20">
              <FileText className="w-5 h-5 mx-auto text-amber-500 mb-1" />
              <div className="text-2xl font-bold">{data?.counts.generatedDocuments ?? '--'}</div>
              <div className="text-xs text-muted-foreground">Docs IA générés</div>
            </div>
            <div className="p-4 rounded-lg border bg-muted/20">
              <Download className="w-5 h-5 mx-auto text-purple-500 mb-1" />
              <div className="text-2xl font-bold">{data?.counts.exports ?? '--'}</div>
              <div className="text-xs text-muted-foreground">Exports (PDF/PNG)</div>
            </div>
            <div className="p-4 rounded-lg border bg-muted/20">
              <ShieldCheck className="w-5 h-5 mx-auto text-red-500 mb-1" />
              <div className="text-2xl font-bold">{data?.counts.auditLogs ?? '--'}</div>
              <div className="text-xs text-muted-foreground">Traces d'Audit</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
