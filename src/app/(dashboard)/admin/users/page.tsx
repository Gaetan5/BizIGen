'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Search, Loader2, Pencil, Trash2, UserPlus, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface UserAdmin {
  id: string;
  email: string;
  name: string | null;
  role: string;
  plan: string;
  projectsCount: number;
  createdAt: string;
}

interface RawUserResponse {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
  subscription?: { plan: string; status: string } | null;
  projectCount?: number;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Dialogs
  const [selectedUser, setSelectedUser] = useState<UserAdmin | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editRole, setEditRole] = useState('USER');
  const [editPlan, setEditPlan] = useState('FREE');
  const [saving, setSaving] = useState(false);

  // New user dialog
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('USER');
  const [creating, setCreating] = useState(false);

  const loadUsers = useCallback(async (pageNum: number = 1, searchQuery: string = '') => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: pageNum.toString() });
      if (searchQuery.trim()) params.append('search', searchQuery.trim());

      const response = await fetch(`/api/admin/users?${params.toString()}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Accès refusé. Rôle administrateur requis.');
        } else {
          toast.error('Erreur lors du chargement des utilisateurs.');
        }
        setUsers([]);
        return;
      }

      const data = await response.json();
      const mapped: UserAdmin[] = (data.users || []).map((u: RawUserResponse) => ({
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role,
        plan: u.subscription?.plan || 'FREE',
        projectsCount: u.projectCount || 0,
        createdAt: u.createdAt,
      }));

      setUsers(mapped);
      if (data.pagination) {
        setPage(data.pagination.page);
        setTotalPages(data.pagination.totalPages || 1);
      }
    } catch (err) {
      console.error(err);
      toast.error('Erreur de connexion au serveur.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({ page: page.toString() });
        if (search.trim()) params.append('search', search.trim());

        const response = await fetch(`/api/admin/users?${params.toString()}`, {
          method: 'GET',
          credentials: 'include',
          signal: controller.signal,
        });

        if (!response.ok) {
          if (response.status === 401) {
            toast.error('Accès refusé. Rôle administrateur requis.');
          } else {
            toast.error('Erreur lors du chargement des utilisateurs.');
          }
          setUsers([]);
          return;
        }

        const data = await response.json();

        const mapped: UserAdmin[] = (data.users || []).map((u: RawUserResponse) => ({
          id: u.id,
          email: u.email,
          name: u.name,
          role: u.role,
          plan: u.subscription?.plan || 'FREE',
          projectsCount: u.projectCount || 0,
          createdAt: u.createdAt,
        }));

        setUsers(mapped);
        if (data.pagination) {
          setPage(data.pagination.page);
          setTotalPages(data.pagination.totalPages || 1);
        }
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        console.error(err);
        toast.error('Erreur de connexion au serveur.');
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [page, search]);

  const handleEditUser = (user: UserAdmin) => {
    setSelectedUser(user);
    setEditRole(user.role);
    setEditPlan(user.plan);
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedUser) return;
    try {
      setSaving(true);
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          userId: selectedUser.id,
          role: editRole,
          plan: editPlan,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Erreur lors de la mise à jour');
      }

      toast.success(`Utilisateur ${selectedUser.email} mis à jour avec succès`);
      setEditDialogOpen(false);
      loadUsers(page, search);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async (user: UserAdmin) => {
    if (!confirm(`Supprimer définitivement l'utilisateur ${user.email} ? Cette action est irréversible.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/users?userId=${user.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Erreur lors de la suppression');
      }

      toast.success(`Utilisateur ${user.email} supprimé`);
      loadUsers(page, search);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erreur inconnue');
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newPassword) {
      toast.error('Email et mot de passe requis');
      return;
    }

    try {
      setCreating(true);
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: newEmail,
          name: newName,
          password: newPassword,
          role: newRole,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Erreur lors de la création');
      }

      toast.success(`Utilisateur ${newEmail} créé avec succès`);
      setCreateDialogOpen(false);
      setNewEmail('');
      setNewName('');
      setNewPassword('');
      loadUsers(page, search);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setCreating(false);
    }
  };

  const getPlanBadge = (plan: string) => {
    const variants: Record<string, { className: string }> = {
      FREE: { className: 'bg-muted text-foreground' },
      BASIC: { className: 'bg-blue-600 text-white hover:bg-blue-700' },
      PRO: { className: 'bg-amber-600 text-white hover:bg-amber-700' },
    };
    const config = variants[plan] || variants.FREE;
    return <Badge className={config.className}>{plan}</Badge>;
  };

  const getRoleBadge = (role: string) => {
    if (role === 'ADMIN') {
      return <Badge className="bg-red-600 text-white hover:bg-red-700">Admin</Badge>;
    }
    return <Badge variant="outline">{role}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gestion des utilisateurs</h1>
          <p className="text-muted-foreground">
            Administration des comptes, des rôles et des forfaits de BizGen AI
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => loadUsers(page, search)} title="Actualiser">
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button className="gap-2" onClick={() => setCreateDialogOpen(true)}>
            <UserPlus className="w-4 h-4" />
            Nouvel utilisateur
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par email ou nom..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-9"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center min-h-75">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Aucun utilisateur trouvé.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Forfait</TableHead>
                  <TableHead>Projets</TableHead>
                  <TableHead>Inscription</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.name || 'Sans nom'}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>{getPlanBadge(user.plan)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{user.projectsCount} projet(s)</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditUser(user)}
                          title="Modifier le rôle ou forfait"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDeleteUser(user)}
                          title="Supprimer l'utilisateur"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Page {page} sur {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Précédent
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Suivant
            </Button>
          </div>
        </div>
      )}

      {/* Dialog Edit User */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier l'utilisateur</DialogTitle>
            <DialogDescription>
              Ajustez les privilèges d'accès et le forfait pour {selectedUser?.email}
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nom</label>
                <Input value={selectedUser.name || 'Sans nom'} disabled />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Rôle système</label>
                <Select value={editRole} onValueChange={setEditRole}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USER">Utilisateur standard (USER)</SelectItem>
                    <SelectItem value="ADMIN">Administrateur système (ADMIN)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Formule d'abonnement</label>
                <Select value={editPlan} onValueChange={setEditPlan}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FREE">Gratuit (FREE)</SelectItem>
                    <SelectItem value="BASIC">Basic (7 €/mois)</SelectItem>
                    <SelectItem value="PRO">Pro Illimité (19 €/mois)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)} disabled={saving}>
              Annuler
            </Button>
            <Button onClick={handleSaveEdit} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Enregistrer les modifications
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Create User */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Créer un nouvel utilisateur</DialogTitle>
            <DialogDescription>
              Ajouter manuellement un compte utilisateur ou administrateur.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateUser} className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nom complet</label>
              <Input
                placeholder="ex: Jean Dupont"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Adresse email *</label>
              <Input
                type="email"
                placeholder="jean@exemple.com"
                required
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Mot de passe temporaire *</label>
              <Input
                type="password"
                placeholder="Minimum 6 caractères"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Rôle</label>
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">Utilisateur standard</SelectItem>
                  <SelectItem value="ADMIN">Administrateur</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)} disabled={creating}>
                Annuler
              </Button>
              <Button type="submit" disabled={creating}>
                {creating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Créer le compte
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
