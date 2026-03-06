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
import { 
  FolderKanban, 
  AlertCircle, 
  RefreshCw,
  CheckCircle,
  Clock,
  Loader2,
  FileText
} from 'lucide-react';
import { authApi } from '@/lib/fastapi-client';

interface AdminProject {
  id: string;
  name: string;
  sector: string;
  status: string;
  user_id: string;
  user_email: string;
  created_at: string;
}

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [sectorFilter, setSectorFilter] = useState<string>('');

  const fetchProjects = useCallback(async () => {
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
      if (sectorFilter) params.append('sector', sectorFilter);

      const response = await fetch(`/admin/projects?${params}&XTransformPort=3001`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des projets');
      }

      const data = await response.json();
      setProjects(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, sectorFilter]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-3 w-3" />;
      case 'GENERATING':
        return <Loader2 className="h-3 w-3 animate-spin" />;
      case 'IN_PROGRESS':
        return <Clock className="h-3 w-3" />;
      default:
        return <FileText className="h-3 w-3" />;
    }
  };

  const getStatusBadgeVariant = (status: string): "default" | "secondary" | "outline" | "destructive" => {
    switch (status) {
      case 'COMPLETED':
        return 'default';
      case 'GENERATING':
        return 'secondary';
      case 'IN_PROGRESS':
        return 'secondary';
      case 'ARCHIVED':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'COMPLETED':
        return 'Terminé';
      case 'GENERATING':
        return 'Génération';
      case 'IN_PROGRESS':
        return 'En cours';
      case 'ARCHIVED':
        return 'Archivé';
      default:
        return 'Brouillon';
    }
  };

  const getSectorLabel = (sector: string): string => {
    const sectorLabels: Record<string, string> = {
      TECH: 'Technologie',
      AGRO: 'Agriculture',
      AGRO_ALIMENTAIRE: 'Agroalimentaire',
      SERVICES: 'Services',
      COMMERCE: 'Commerce',
      AUTRE: 'Autre',
    };
    return sectorLabels[sector] || sector;
  };

  // Calculate stats
  const stats = {
    total: projects.length,
    completed: projects.filter(p => p.status === 'COMPLETED').length,
    inProgress: projects.filter(p => p.status === 'IN_PROGRESS' || p.status === 'GENERATING').length,
    draft: projects.filter(p => p.status === 'DRAFT').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestion des Projets</h1>
        <p className="text-muted-foreground">
          Tous les projets créés sur la plateforme
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">projets</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Terminés</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">projets terminés</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">En cours</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inProgress}</div>
            <p className="text-xs text-muted-foreground">projets en cours</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Brouillons</CardTitle>
            <FileText className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.draft}</div>
            <p className="text-xs text-muted-foreground">projets en brouillon</p>
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
                  <SelectItem value="COMPLETED">Terminé</SelectItem>
                  <SelectItem value="IN_PROGRESS">En cours</SelectItem>
                  <SelectItem value="GENERATING">Génération</SelectItem>
                  <SelectItem value="DRAFT">Brouillon</SelectItem>
                  <SelectItem value="ARCHIVED">Archivé</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Filtrer par secteur</label>
              <Select
                value={sectorFilter}
                onValueChange={(value) => setSectorFilter(value === 'all' ? '' : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tous les secteurs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les secteurs</SelectItem>
                  <SelectItem value="TECH">Technologie</SelectItem>
                  <SelectItem value="AGRO">Agriculture</SelectItem>
                  <SelectItem value="AGRO_ALIMENTAIRE">Agroalimentaire</SelectItem>
                  <SelectItem value="SERVICES">Services</SelectItem>
                  <SelectItem value="COMMERCE">Commerce</SelectItem>
                  <SelectItem value="AUTRE">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                size="icon"
                onClick={() => fetchProjects()}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Projects Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des Projets</CardTitle>
          <CardDescription>
            Tous les projets créés par les utilisateurs
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {error ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="h-12 w-12 text-destructive mb-4" />
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={fetchProjects} variant="outline">
                Réessayer
              </Button>
            </div>
          ) : loading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-3 w-[150px]" />
                  </div>
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FolderKanban className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Aucun projet trouvé</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Projet</TableHead>
                    <TableHead>Secteur</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Créé le</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projects.map((project) => (
                    <TableRow key={project.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                            <FolderKanban className="h-5 w-5 text-primary" />
                          </div>
                          <span className="font-medium">{project.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getSectorLabel(project.sector)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(project.status)} className="gap-1">
                          {getStatusIcon(project.status)}
                          {getStatusLabel(project.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{project.user_email}</span>
                      </TableCell>
                      <TableCell>
                        {new Date(project.created_at).toLocaleDateString('fr-FR', {
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
