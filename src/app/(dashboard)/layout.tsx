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
  Menu,
  Bot,
  Shield
} from 'lucide-react';
import { PLAN_LIMITS } from '@/types';
import { Suspense } from 'react';

const sidebarItems = [
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

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

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

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <Link href="/" className="flex items-center gap-2 px-2 py-1">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">BizGen AI</span>
          </Link>
        </SidebarHeader>
        
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {sidebarItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={pathname === item.url || pathname.startsWith(item.url + '/')}
                    >
                      <Link href={item.url}>
                        <item.icon className="w-4 h-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>Actions rapides</SidebarGroupLabel>
            <SidebarGroupContent>
              <Link href="/projects/new">
                <Button className="w-full gap-2" size="sm">
                  <Plus className="w-4 h-4" />
                  Nouveau projet
                </Button>
              </Link>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        
        <SidebarFooter>
          <div className="p-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Plan actuel</span>
              <Badge variant={userPlan === 'PRO' ? 'default' : 'secondary'}>
                {userPlan}
              </Badge>
            </div>
            {userPlan === 'FREE' && (
              <Link href="/subscription">
                <Button variant="outline" size="sm" className="w-full">
                  Passer à Pro
                </Button>
              </Link>
            )}
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="flex h-14 items-center gap-4 border-b bg-background/95 backdrop-blur px-4 lg:px-6">
          <SidebarTrigger className="-ml-1" />
          
          <div className="flex-1" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={session?.user?.image ?? undefined} />
                  <AvatarFallback>
                    {session?.user?.name?.charAt(0) || session?.user?.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden md:inline">{session?.user?.name || session?.user?.email}</span>
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/settings">Paramètres</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/subscription">Abonnement</Link>
              </DropdownMenuItem>
              {userRole === 'ADMIN' && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/admin" className="flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Panel Admin
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
