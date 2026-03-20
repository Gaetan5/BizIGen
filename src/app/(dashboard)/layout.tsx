'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
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
import { BizGenLogo } from '@/components/ui/logo';
import { 
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
  Zap,
  Crown
} from 'lucide-react';
import { PLAN_LIMITS } from '@/types';
import { Suspense } from 'react';
import { motion } from 'framer-motion';

const sidebarItems = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: LayoutDashboard,
    gradient: 'from-primary to-gold-500',
  },
  {
    title: 'Mes projets',
    url: '/projects',
    icon: FolderKanban,
    gradient: 'from-gold-500 to-orange-400',
  },
  {
    title: 'Assistant IA',
    url: '/assistant',
    icon: Bot,
    gradient: 'from-orange-400 to-primary',
  },
  {
    title: 'Abonnement',
    url: '/subscription',
    icon: CreditCard,
    gradient: 'from-primary to-gold-400',
  },
  {
    title: 'Paramètres',
    url: '/settings',
    icon: Settings,
    gradient: 'from-gold-400 to-orange-500',
  },
  {
    title: 'Aide',
    url: '/help',
    icon: HelpCircle,
    gradient: 'from-orange-500 to-primary',
  },
];

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-gold-500/5">
        <motion.div 
          className="flex flex-col items-center gap-6"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <BizGenLogo size="lg" animated />
          <motion.div 
            className="flex items-center gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent"></div>
            <span className="text-muted-foreground font-medium">Chargement...</span>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  const userPlan = (session?.user as { plan?: string })?.plan || 'FREE';
  const userRole = (session?.user as { role?: string })?.role || 'USER';

  return (
    <SidebarProvider>
      <Sidebar className="border-r border-border/30 bg-gradient-to-b from-card via-card to-muted/20">
        <SidebarHeader className="p-5 border-b border-border/20">
          <BizGenLogo size="sm" showText animated />
        </SidebarHeader>
        
        <SidebarContent className="px-3 py-4">
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground px-3 mb-3 uppercase tracking-wider">
              Navigation
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1.5">
                {sidebarItems.map((item, index) => {
                  const isActive = pathname === item.url || pathname.startsWith(item.url + '/');
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild
                        isActive={isActive}
                        className={`
                          relative overflow-hidden rounded-xl transition-all duration-300
                          ${isActive 
                            ? 'bg-primary/10 text-primary font-semibold border-l-4 border-primary' 
                            : 'hover:bg-muted/80 hover:text-primary'
                          }
                        `}
                      >
                        <Link href={item.url} className="flex items-center gap-3 px-4 py-3">
                          <motion.div 
                            className={`
                              w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-300
                              ${isActive 
                                ? `bg-gradient-to-br ${item.gradient} text-white shadow-lg` 
                                : 'bg-muted/80 text-muted-foreground'
                              }
                            `}
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <item.icon className="w-4.5 h-4.5" />
                          </motion.div>
                          <span className="font-medium">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup className="mt-8">
            <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground px-3 mb-3 uppercase tracking-wider">
              Actions rapides
            </SidebarGroupLabel>
            <SidebarGroupContent className="px-3">
              <Link href="/projects/new" className="block">
                <Button className="w-full gap-2 btn-gradient shadow-xl shadow-primary/30 hover:shadow-primary/50 hover:scale-[1.02] transition-all py-6 text-base font-semibold">
                  <Plus className="w-5 h-5" />
                  Nouveau projet
                </Button>
              </Link>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        
        <SidebarFooter className="p-4 border-t border-border/20">
          <div className="p-4 rounded-xl bg-gradient-to-br from-muted/80 to-muted/40 border border-border/20 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Plan actuel</span>
              <Badge 
                variant={userPlan === 'PRO' ? 'default' : 'secondary'}
                className={`font-semibold ${userPlan === 'PRO' ? 'bg-gradient-to-r from-primary to-gold-500 text-white shadow-lg shadow-primary/25' : ''}`}
              >
                {userPlan === 'PRO' && <Crown className="w-3.5 h-3.5 mr-1.5" />}
                {userPlan}
              </Badge>
            </div>
            {userPlan === 'FREE' && (
              <Link href="/subscription" className="block">
                <Button variant="outline" size="sm" className="w-full hover:bg-primary hover:text-white hover:border-primary transition-all font-medium">
                  <Zap className="w-4 h-4 mr-2" />
                  Passer à Pro
                </Button>
              </Link>
            )}
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="flex h-16 items-center gap-4 border-b border-border/20 bg-background/95 backdrop-blur-xl px-4 lg:px-8 sticky top-0 z-40">
          <SidebarTrigger className="-ml-1 hover:bg-muted rounded-xl p-2" />
          
          <div className="flex-1" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-3 hover:bg-muted rounded-xl px-4 py-2">
                <Avatar className="h-9 w-9 ring-2 ring-primary/30 ring-offset-2 ring-offset-background">
                  <AvatarImage src={session?.user?.image ?? undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-gold-500 text-white text-sm font-semibold">
                    {session?.user?.name?.charAt(0) || session?.user?.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block text-left">
                  <div className="font-semibold text-sm">{session?.user?.name || 'Utilisateur'}</div>
                  <div className="text-xs text-muted-foreground">{session?.user?.email}</div>
                </div>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 rounded-xl border-border/30 shadow-2xl">
              <DropdownMenuLabel className="font-normal p-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-gradient-to-br from-primary to-gold-500 text-white">
                      {session?.user?.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <p className="font-semibold">{session?.user?.name || 'Utilisateur'}</p>
                    <p className="text-xs text-muted-foreground">{session?.user?.email}</p>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="rounded-lg cursor-pointer px-3 py-2.5">
                <Link href="/settings" className="flex items-center gap-3">
                  <Settings className="w-4 h-4 text-muted-foreground" />
                  Paramètres
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="rounded-lg cursor-pointer px-3 py-2.5">
                <Link href="/subscription" className="flex items-center gap-3">
                  <CreditCard className="w-4 h-4 text-muted-foreground" />
                  Abonnement
                </Link>
              </DropdownMenuItem>
              {userRole === 'ADMIN' && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="rounded-lg cursor-pointer px-3 py-2.5">
                    <Link href="/admin" className="flex items-center gap-3 text-primary font-medium">
                      <Shield className="w-4 h-4" />
                      Panel Admin
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="text-destructive focus:text-destructive rounded-lg cursor-pointer px-3 py-2.5"
              >
                <LogOut className="w-4 h-4 mr-3" />
                Déconnexion
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <main className="flex-1 overflow-auto p-6 lg:p-10 bg-gradient-to-br from-muted/20 via-background to-muted/10 min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-gold-500/5">
        <motion.div 
          className="flex flex-col items-center gap-6"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <BizGenLogo size="lg" animated />
          <motion.div 
            className="flex items-center gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent"></div>
            <span className="text-muted-foreground font-medium">Chargement...</span>
          </motion.div>
        </motion.div>
      </div>
    }>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </Suspense>
  );
}
