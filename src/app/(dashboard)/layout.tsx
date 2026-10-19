'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  LayoutDashboard, 
  FolderKanban, 
  CreditCard, 
  Settings, 
  HelpCircle,
  LogOut,
  ChevronDown,
  Plus,
  Bot,
  Shield,
  Users,
  Activity,
  Lock,
  UserCheck,
  EyeOff,
  ArrowRightLeft
} from 'lucide-react';
import { toast } from 'sonner';
import { Suspense } from 'react';

// Navigation Espace Client / Utilisateur
const clientSidebarItems = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Mes projets',
    url: '/projects',
    icon: FolderKanban,
  },
  {
    title: 'Assistant IA',
    url: '/assistant',
    icon: Bot,
  },
  {
    title: 'Abonnement',
    url: '/subscription',
    icon: CreditCard,
  },
  {
    title: 'Paramètres',
    url: '/settings',
    icon: Settings,
  },
  {
    title: 'Aide',
    url: '/help',
    icon: HelpCircle,
  },
];

// Navigation Espace Super-Admin
const adminSidebarItems = [
  {
    title: 'Vue d\'ensemble',
    url: '/admin',
    icon: Shield,
    color: 'text-primary',
  },
  {
    title: 'Utilisateurs & Accès',
    url: '/admin/users',
    icon: Users,
    color: 'text-blue-500',
  },
  {
    title: 'Évaluation des Projets',
    url: '/admin/projects',
    icon: FolderKanban,
    color: 'text-emerald-500',
  },
  {
    title: 'Abonnements & Finances',
    url: '/admin/subscriptions',
    icon: CreditCard,
    color: 'text-amber-500',
  },
  {
    title: 'Monitoring Système',
    url: '/admin/monitoring',
    icon: Activity,
    color: 'text-cyan-500',
  },
  {
    title: 'Sécurité & Audit Logs',
    url: '/admin/security',
    icon: Lock,
    color: 'text-red-500',
  },
];

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [stoppingImpersonate, setStoppingImpersonate] = useState(false);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  const userPlan = (session?.user as { plan?: string })?.plan || 'FREE';
  const userRole = (session?.user as { role?: string })?.role || 'USER';
  const isImpersonating = Boolean((session?.user as any)?.isImpersonating);
  const isAdmin = userRole === 'ADMIN' || isImpersonating;
  const isInAdminSection = pathname.startsWith('/admin');

  const handleStopImpersonate = async () => {
    try {
      setStoppingImpersonate(true);
      const res = await fetch('/api/admin/impersonate', { method: 'DELETE' });
      if (res.ok) {
        toast.success('Session à distance terminée. Retour au panneau Admin.');
        window.location.href = '/admin/users';
      } else {
        toast.error('Erreur lors de la déconnexion à distance');
      }
    } catch {
      toast.error('Erreur réseau');
    } finally {
      setStoppingImpersonate(false);
    }
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="border-b pb-3">
          <Link href="/" className="flex items-center gap-2 px-2 py-1">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-sm">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base leading-none">BizGen AI</span>
              {isAdmin && (
                <span className="text-[10px] text-primary font-semibold tracking-wider uppercase mt-1">
                  {isImpersonating ? 'Mode Assisté' : 'Super-Admin'}
                </span>
              )}
            </div>
          </Link>

          {/* Quick Space Switcher for Admin */}
          {userRole === 'ADMIN' && (
            <div className="px-2 pt-2">
              <Link href={isInAdminSection ? '/dashboard' : '/admin'}>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className={`w-full text-xs justify-start gap-2 h-8 font-medium ${isInAdminSection ? 'border-primary/50 text-primary hover:bg-primary/10' : 'bg-primary/10 text-primary border-primary/30 hover:bg-primary/20'}`}
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  {isInAdminSection ? 'Vers mon Espace Client' : '🛡️ Mode Super-Admin'}
                </Button>
              </Link>
            </div>
          )}
        </SidebarHeader>
        
        <SidebarContent>
          {/* Section Super-Admin (toujours visible pour l'ADMIN) */}
          {userRole === 'ADMIN' && (
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-bold text-primary flex items-center gap-1.5 uppercase tracking-wider">
                <Shield className="w-3.5 h-3.5" />
                Administration
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {adminSidebarItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        isActive={pathname === item.url || (item.url !== '/admin' && pathname.startsWith(item.url))}
                      >
                        <Link href={item.url} className="flex items-center gap-2.5">
                          <item.icon className={`w-4 h-4 ${item.color}`} />
                          <span className="font-medium">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}

          {/* Section Navigation Utilisateur / Client */}
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs uppercase tracking-wider">
              {userRole === 'ADMIN' ? 'Espace Personnel Client' : 'Navigation'}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {clientSidebarItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={pathname === item.url || (item.url !== '/dashboard' && pathname.startsWith(item.url + '/'))}
                    >
                      <Link href={item.url} className="flex items-center gap-2.5">
                        <item.icon className="w-4 h-4 text-muted-foreground" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Actions rapides */}
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs uppercase tracking-wider">Actions rapides</SidebarGroupLabel>
            <SidebarGroupContent>
              <Link href="/projects/new">
                <Button className="w-full gap-2 shadow-sm" size="sm">
                  <Plus className="w-4 h-4" />
                  Nouveau projet
                </Button>
              </Link>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        
        <SidebarFooter className="border-t">
          <div className="p-2 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Formule</span>
              <div className="flex items-center gap-1">
                <Badge variant={userPlan === 'PRO' ? 'default' : 'secondary'} className="text-[10px] h-5">
                  {userPlan}
                </Badge>
                {userRole === 'ADMIN' && (
                  <Badge className="bg-red-600 text-white text-[10px] h-5">ADMIN</Badge>
                )}
              </div>
            </div>
            {userPlan === 'FREE' && userRole !== 'ADMIN' && (
              <Link href="/subscription">
                <Button variant="outline" size="sm" className="w-full text-xs h-7">
                  Passer à Pro
                </Button>
              </Link>
            )}
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        {/* Persistent Banner when Impersonating */}
        {isImpersonating && (
          <div className="bg-purple-700 text-white px-4 py-2 text-xs flex items-center justify-between shadow-md sticky top-0 z-50">
            <div className="flex items-center gap-2 font-medium">
              <UserCheck className="w-4 h-4" />
              <span>
                Mode Accès à Distance Actif : Vous naviguez sur le compte de <strong>{session?.user?.email}</strong>
              </span>
            </div>
            <Button
              size="sm"
              variant="secondary"
              className="h-6 text-xs bg-white text-purple-900 hover:bg-purple-100 gap-1 font-semibold"
              onClick={handleStopImpersonate}
              disabled={stoppingImpersonate}
            >
              <EyeOff className="w-3.5 h-3.5" />
              Quitter l'accès à distance
            </Button>
          </div>
        )}

        <header className="flex h-14 items-center gap-4 border-b bg-background/95 backdrop-blur px-4 lg:px-6 sticky top-0 z-40">
          <SidebarTrigger className="-ml-1" />
          
          {/* Breadcrumb indicator for Admin */}
          {isInAdminSection && (
            <div className="hidden sm:flex items-center gap-2">
              <Badge className="bg-primary/10 text-primary border-primary/20 text-xs font-semibold gap-1">
                <Shield className="w-3 h-3" />
                Panel Super-Admin
              </Badge>
            </div>
          )}

          <div className="flex-1" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={session?.user?.image ?? undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary font-bold">
                    {session?.user?.name?.charAt(0) || session?.user?.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col text-left hidden md:flex">
                  <span className="text-xs font-medium leading-none">{session?.user?.name || session?.user?.email}</span>
                  <span className="text-[10px] text-muted-foreground mt-0.5">
                    {userRole === 'ADMIN' ? 'Administrateur' : userPlan}
                  </span>
                </div>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard">Espace Client Personnel</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings">Paramètres</Link>
              </DropdownMenuItem>
              {userRole === 'ADMIN' && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="text-xs font-semibold text-primary">Super-Admin</DropdownMenuLabel>
                  <DropdownMenuItem asChild>
                    <Link href="/admin" className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-primary" />
                      Vue d'ensemble Admin
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/admin/users" className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-500" />
                      Gestion Utilisateurs
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/admin/projects" className="flex items-center gap-2">
                      <FolderKanban className="w-4 h-4 text-emerald-500" />
                      Évaluation Projets
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/admin/monitoring" className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-cyan-500" />
                      Monitoring Système
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/admin/security" className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-red-500" />
                      Sécurité & Audit Logs
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="text-destructive"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Déconnexion
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <main className="flex-1 overflow-auto p-4 lg:p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    }>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </Suspense>
  );
}
