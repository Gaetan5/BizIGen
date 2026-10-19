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
import { 
  Search, 
  Loader2, 
  Pencil, 
  Trash2, 
  UserPlus, 
  RefreshCw,
  LogIn,
  KeyRound,
  Copy,
  Check,
  ShieldAlert,
  RotateCcw
} from 'lucide-react';
import { toast } from 'sonner';

interface UserAdmin {
  id: string;
  email: string;
  name: string | null;
  role: string;
  plan: string;
  subStatus: string;
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
  
  // Dialog Edit User
  const [selectedUser, setSelectedUser] = useState<UserAdmin | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editRole, setEditRole] = useState('USER');
  const [editPlan, setEditPlan] = useState('FREE');
  const [editSubStatus, setEditSubStatus] = useState('ACTIVE');
  const [resetQuotas, setResetQuotas] = useState(false);
  const [saving, setSaving] = useState(false);

  // Dialog Reset Password
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);
  const [resetUser, setResetUser] = useState<UserAdmin | null>(null);
  const [customPassword, setCustomPassword] = useState('');
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [resetting, setResetting] = useState(false);
  const [copied, setCopied] = useState(false);

  // Impersonating state
  const [impersonatingId, setImpersonatingId] = useState<string | null>(null);

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
        subStatus: u.subscription?.status || 'ACTIVE',
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
    loadUsers(page, search);
  }, [loadUsers, page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadUsers(1, search);
  };

  const handleEditUser = (user: UserAdmin) => {
    setSelectedUser(user);
    setEditRole(user.role);
    setEditPlan(user.plan);
    setEditSubStatus(user.subStatus);
    setResetQuotas(false);
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
          subStatus: editSubStatus,
          resetQuotas,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Erreur lors de la mise à jour');
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

  // Impersonate (Connexion à distance)
  const handleImpersonate = async (user: UserAdmin) => {
    if (!confirm(`Démarrer une session à distance pour l'utilisateur ${user.email} ? Vous naviguerez dans son espace client.`)) {
      return;
    }

    try {
      setImpersonatingId(user.id);
      const res = await fetch('/api/admin/impersonate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ targetUserId: user.id }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur de connexion à distance');

      toast.success(`Connecté en tant que ${user.email} !`);
      window.location.href = data.redirectUrl || '/dashboard';
    } catch (err: any) {
      toast.error(err.message || 'Erreur impersonate');
      setImpersonatingId(null);
    }
  };

  // Open reset password modal
  const handleOpenResetPassword = (user: UserAdmin) => {
    setResetUser(user);
    setCustomPassword('');
    setGeneratedPassword('');
    setCopied(false);
    setResetPasswordOpen(true);
  };

  const handleExecuteResetPassword = async () => {
    if (!resetUser) return;
    try {
      setResetting(true);
      const res = await fetch('/api/admin/users/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          userId: resetUser.id,
          customPassword: customPassword.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur réinitialisation');

      setGeneratedPassword(data.tempPassword);
      toast.success(`Mot de passe réinitialisé pour ${resetUser.email} !`);
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la réinitialisation');
    } finally {
      setResetting(false);
    }
  };

  const handleCopyPassword = () => {
    if (!generatedPassword) return;
    navigator.clipboard.writeText(generatedPassword);
    setCopied(true);
    toast.success('Mot de passe copié dans le presse-papier !');
    setTimeout(() => setCopied(false), 3000);
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

  const getPlanBadge = (plan: string, status: string) => {
    const isInactive = status === 'INACTIVE' || status === 'CANCELED';
    const variants: Record<string, { className: string }> = {
      FREE: { className: 'bg-muted text-foreground' },
      BASIC: { className: isInactive ? 'bg-slate-400 text-white' : 'bg-blue-600 text-white' },
      PRO: { className: isInactive ? 'bg-slate-400 text-white' : 'bg-amber-600 text-white' },
    };
    const config = variants[plan] || variants.FREE;
    return (
      <div className="flex items-center gap-1.5">
        <Badge className={config.className}>{plan}</Badge>
        {status !== 'ACTIVE' && (
          <Badge variant="outline" className="text-xs text-destructive border-destructive/50">
            {status}
          </Badge>
        )}
      </div>
    );
  };

  const getRoleBadge = (role: string) => {
    if (role === 'ADMIN') {
      return <Badge className="bg-red-600 text-white hover:bg-red-700">Admin</Badge>;
    }
    if (role === 'CONSULTANT') {
      return <Badge className="bg-purple-600 text-white hover:bg-purple-700">Consultant</Badge>;
    }
    return <Badge variant="outline">{role}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Gestion des Utilisateurs & Accès</h1>
          <p className="text-muted-foreground text-sm">
            Supervision des comptes, attribution des forfaits, réinitialisation de mot de passe et connexion à distance
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => loadUsers(page, search)} disabled={loading} className="gap-2">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
          <Button size="sm" onClick={() => setCreateDialogOpen(true)} className="gap-2">
            <UserPlus className="w-4 h-4" />
            Nouvel utilisateur
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom ou email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button type="submit" variant="secondary">Rechercher</Button>
          </form>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          {loading && users.length === 0 ? (
            <div className="flex items-center justify-center py-12">
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
                  <TableHead>Forfait & Statut</TableHead>
                  <TableHead>Projets</TableHead>
                  <TableHead>Date d'inscription</TableHead>
                  <TableHead className="text-right">Actions Super-Admin</TableHead>
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
                    <TableCell>{getPlanBadge(user.plan, user.subStatus)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{user.projectsCount} projet(s)</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {/* Impersonate button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 gap-1 text-xs"
                          onClick={() => handleImpersonate(user)}
                          disabled={impersonatingId === user.id}
                          title="Se connecter à distance en tant que cet utilisateur"
                        >
                          {impersonatingId === user.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <LogIn className="w-3.5 h-3.5" />
                          )}
                          <span className="hidden lg:inline">Accès à distance</span>
                        </Button>

                        {/* Reset password button */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenResetPassword(user)}
                          title="Réinitialiser le mot de passe"
                        >
                          <KeyRound className="w-4 h-4 text-amber-600" />
                        </Button>

                        {/* Edit plan/role */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditUser(user)}
                          title="Modifier le forfait ou rôle"
                        >
                          <Pencil className="w-4 h-4 text-blue-600" />
                        </Button>

                        {/* Delete */}
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
            <DialogTitle>Modifier l'utilisateur & Forfait</DialogTitle>
            <DialogDescription>
              Ajustez les privilèges d'accès, le forfait et les quotas pour {selectedUser?.email}
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-4 py-2">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Utilisateur</label>
                <div className="text-sm font-semibold">{selectedUser.name || 'Sans nom'} ({selectedUser.email})</div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium">Rôle système</label>
                <Select value={editRole} onValueChange={setEditRole}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USER">Utilisateur standard (USER)</SelectItem>
                    <SelectItem value="CONSULTANT">Consultant expert (CONSULTANT)</SelectItem>
                    <SelectItem value="ADMIN">Administrateur système (ADMIN)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium">Formule de Forfait</label>
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

                <div className="space-y-1">
                  <label className="text-xs font-medium">Statut de l'abonnement</label>
                  <Select value={editSubStatus} onValueChange={setEditSubStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Actif (ACTIVE)</SelectItem>
                      <SelectItem value="INACTIVE">Inactif (INACTIVE)</SelectItem>
                      <SelectItem value="PAST_DUE">En retard (PAST_DUE)</SelectItem>
                      <SelectItem value="CANCELED">Annulé (CANCELED)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="p-3 border rounded-lg bg-muted/20 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold">Réinitialiser les quotas d'usage</div>
                  <div className="text-xs text-muted-foreground">Remet les compteurs de projets et d'exports à 0</div>
                </div>
                <Button
                  type="button"
                  variant={resetQuotas ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setResetQuotas(!resetQuotas)}
                  className="gap-1 text-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  {resetQuotas ? 'Quotas réinitialisés' : 'Réinitialiser'}
                </Button>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)} disabled={saving}>
              Annuler
            </Button>
            <Button onClick={handleSaveEdit} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Reset Password */}
      <Dialog open={resetPasswordOpen} onOpenChange={setResetPasswordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-amber-600" />
              Réinitialiser le mot de passe
            </DialogTitle>
            <DialogDescription>
              Définissez un mot de passe ou générez-en un nouveau automatiquement pour {resetUser?.email}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {!generatedPassword ? (
              <>
                <div className="space-y-1">
                  <label className="text-xs font-medium">Nouveau mot de passe personnalisé (optionnel)</label>
                  <Input
                    type="text"
                    placeholder="Laisser vide pour générer un mot de passe sécurisé"
                    value={customPassword}
                    onChange={(e) => setCustomPassword(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Si vide, un mot de passe temporaire fort (ex: BizGen#728193!) sera généré automatiquement.
                  </p>
                </div>

                <DialogFooter className="pt-2">
                  <Button variant="outline" onClick={() => setResetPasswordOpen(false)} disabled={resetting}>
                    Annuler
                  </Button>
                  <Button onClick={handleExecuteResetPassword} disabled={resetting} className="bg-amber-600 hover:bg-amber-700">
                    {resetting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Générer & Réinitialiser
                  </Button>
                </DialogFooter>
              </>
            ) : (
              <div className="space-y-3">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <div className="text-xs text-emerald-800 font-semibold mb-1">Mot de passe réinitialisé avec succès !</div>
                  <div className="flex items-center justify-between bg-white p-2 border rounded font-mono text-sm">
                    <span>{generatedPassword}</span>
                    <Button variant="ghost" size="sm" onClick={handleCopyPassword} className="gap-1 h-7 text-xs">
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? 'Copié' : 'Copier'}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Transmettez ce mot de passe à l'utilisateur. Il pourra le modifier dans ses paramètres.
                  </p>
                </div>

                <DialogFooter>
                  <Button onClick={() => setResetPasswordOpen(false)}>
                    Fermer
                  </Button>
                </DialogFooter>
              </div>
            )}
          </div>
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

          <form onSubmit={handleCreateUser} className="space-y-3 py-2">
            <div className="space-y-1">
              <label className="text-xs font-medium">Nom complet</label>
              <Input
                placeholder="ex: Jean Dupont"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Adresse email *</label>
              <Input
                type="email"
                placeholder="jean@exemple.com"
                required
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Mot de passe initial *</label>
              <Input
                type="text"
                placeholder="Minimum 6 caractères"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Rôle</label>
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">Utilisateur standard</SelectItem>
                  <SelectItem value="CONSULTANT">Consultant</SelectItem>
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
