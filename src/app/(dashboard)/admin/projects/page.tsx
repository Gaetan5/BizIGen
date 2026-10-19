'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  FolderKanban, 
  Search, 
  Trash2, 
  ArrowLeft, 
  ExternalLink, 
  Loader2, 
  FileText,
  User,
  Calendar,
  Tag,
  Globe
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ProjectItem {
  id: string;
  name: string;
  sector: string;
  country: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    plan: string;
  };
  hasDocument: boolean;
  canvasesCount: number;
  formInputsCount: number;
}

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sectorFilter, setSectorFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchProjectsManual = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        search,
        status: statusFilter,
        sector: sectorFilter,
      });

      const res = await fetch(`/api/admin/projects?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setProjects(data.projects || []);
        setTotalPages(data.pagination.totalPages || 1);
        setTotalCount(data.pagination.total || 0);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const loadProjects = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          page: page.toString(),
          limit: '10',
          search,
          status: statusFilter,
          sector: sectorFilter,
        });

        const res = await fetch(`/api/admin/projects?${params.toString()}`);
        if (res.ok && !cancelled) {
          const data = await res.json();
          setProjects(data.projects || []);
          setTotalPages(data.pagination.totalPages || 1);
          setTotalCount(data.pagination.total || 0);
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadProjects();

    return () => { cancelled = true; };
  }, [page, statusFilter, sectorFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchProjectsManual();
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Supprimer définitivement le projet "${name}" ?`)) return;
    try {
      const res = await fetch(`/api/admin/projects?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProjects(prev => prev.filter(p => p.id !== id));
      } else {
        alert('Erreur lors de la suppression');
      }
    } catch {
      alert('Erreur serveur');
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
              <FolderKanban className="w-6 h-6 text-primary" />
              Évaluation & Audit des Projets
            </h1>
          </div>
          <p className="text-muted-foreground text-sm">
            Espace réservé à l'administrateur pour examiner, évaluer et relire tous les BMC, Lean Canvas et Business Plans de chaque utilisateur ({totalCount} projets au total).
          </p>
        </div>
      </div>

      {/* Filters & Search */}
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par titre de projet ou email créateur..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val); setPage(1); }}>
              <SelectTrigger className="w-full md:w-45">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tous les statuts</SelectItem>
                <SelectItem value="DRAFT">Brouillon</SelectItem>
                <SelectItem value="IN_PROGRESS">En cours</SelectItem>
                <SelectItem value="COMPLETED">Complété</SelectItem>
                <SelectItem value="ARCHIVED">Archivé</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sectorFilter} onValueChange={(val) => { setSectorFilter(val); setPage(1); }}>
              <SelectTrigger className="w-full md:w-45">
                <SelectValue placeholder="Secteur" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tous secteurs</SelectItem>
                <SelectItem value="TECH">Technologie</SelectItem>
                <SelectItem value="AGRO">Agriculture</SelectItem>
                <SelectItem value="AGRO_ALIMENTAIRE">Agro-alimentaire</SelectItem>
                <SelectItem value="SERVICES">Services</SelectItem>
                <SelectItem value="COMMERCE">Commerce</SelectItem>
                <SelectItem value="AUTRE">Autre</SelectItem>
              </SelectContent>
            </Select>

            <Button type="submit">Filtrer</Button>
          </form>
        </CardContent>
      </Card>

      {/* Projects List */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des projets ({totalCount})</CardTitle>
          <CardDescription>Tous les modèles et formulaires associés</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Aucun projet ne correspond aux critères de recherche.
            </div>
          ) : (
            <div className="space-y-4">
              {projects.map((p) => (
                <div
                  key={p.id}
                  className="p-4 rounded-lg border bg-card/50 hover:bg-muted/30 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-lg">{p.name}</span>
                      <Badge variant={p.status === 'COMPLETED' ? 'default' : 'secondary'}>
                        {p.status}
                      </Badge>
                      {p.hasDocument && (
                        <Badge variant="outline" className="border-green-500/50 text-green-600 gap-1">
                          <FileText className="w-3 h-3" />
                          Document IA prêt ({p.canvasesCount} canvas)
                        </Badge>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5" />
                        {p.user.name || p.user.email} ({p.user.plan})
                      </span>
                      {p.sector && (
                        <span className="flex items-center gap-1">
                          <Tag className="w-3.5 h-3.5" />
                          {p.sector}
                        </span>
                      )}
                      {p.country && (
                        <span className="flex items-center gap-1">
                          <Globe className="w-3.5 h-3.5" />
                          {p.country}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        Créé le {new Date(p.createdAt).toLocaleDateString()}
                      </span>
                      <span>{p.formInputsCount} réponses au questionnaire</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center">
                    <Link href={`/projects/${p.id}`}>
                      <Button variant="outline" size="sm" className="gap-1 border-primary/40 text-primary hover:bg-primary/10">
                        <ExternalLink className="w-4 h-4" />
                        Inspecter & Évaluer
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(p.id, p.name)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
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
    </div>
  );
}
