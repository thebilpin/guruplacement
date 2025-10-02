
'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/use-auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  LayoutDashboard,
  Bell,
  Search,
  Users,
  BookText,
  ClipboardCheck,
  Award,
  Bot,
  School,
  LogOut,
  User,
  BookOpen,
  AlertTriangle,
  MessageCircle,
  CheckSquare,
  FileText,
} from 'lucide-react';
import { Input } from '@/components/ui/input';

const navItems = [
    {
      group: 'Student Management',
      items: [
        { href: '/supervisor/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { href: '/supervisor/student-compliance', icon: ClipboardCheck, label: 'Student Compliance (Sign-off)' },
        { href: '/supervisor/digital-logbook', icon: BookOpen, label: 'Digital Logbook (Approve)' },
        { href: '/supervisor/assessment-tasks', icon: CheckSquare, label: 'Assessment Task Approval' },
        { href: '/supervisor/evaluations', icon: ClipboardCheck, label: 'Evaluations' },
      ]
    },
    {
      group: 'Reporting & Feedback',
      items: [
        { href: '/supervisor/logs', icon: BookText, label: 'Daily Logs' },
        { href: '/supervisor/feedback-forms', icon: MessageCircle, label: 'Feedback Forms' },
        { href: '/supervisor/student-reports', icon: FileText, label: 'Student Reports' },
        { href: '/supervisor/compliance-alerts', icon: AlertTriangle, label: 'Compliance Reminders' },
      ]
    },
    {
      group: 'Professional Development',
      items: [
        { href: '/supervisor/certificates', icon: Award, label: 'Certificates' },
        { href: '/supervisor/ai-helper', icon: Bot, label: 'AI Helper' },
        { href: '/supervisor/training', icon: School, label: 'Training' },
      ]
    },
  ];

const NavGroup = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div>
    <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400 md:group-data-[state=collapsed]:hidden">
      {title}
    </p>
    <div className="flex flex-col gap-1">{children}</div>
  </div>
);


export default function SupervisorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, userData, logOut } = useAuth();

  // Check if user is on invitation pages (allow access)
  const isInvitationPage = pathname.includes('/accept-invitation') || 
                          pathname.includes('/invitation-pending') ||
                          pathname.includes('/no-provider');

  // Access control for Supervisors
  React.useEffect(() => {
    if (userData && !isInvitationPage) {
      // Check if supervisor has been invited and accepted
      const invitationStatus = (userData as any).invitationStatus;
      const providerId = (userData as any).providerId;
      
      if (!invitationStatus || invitationStatus === 'invited') {
        // Supervisor has not accepted invitation yet
        const token = (userData as any).invitationToken;
        if (token) {
          router.push(`/accept-invitation?token=${token}`);
        } else {
          router.push('/supervisor/invitation-pending');
        }
        return;
      }
      
      if (invitationStatus === 'declined') {
        router.push('/supervisor/invitation-declined');
        return;
      }
      
      if (invitationStatus === 'expired') {
        router.push('/supervisor/invitation-expired');
        return;
      }
      
      if (!providerId) {
        router.push('/supervisor/no-provider');
        return;
      }
      
      // Only 'accepted' status with Provider linkage allows dashboard access
      if (invitationStatus !== 'accepted') {
        router.push('/supervisor/invitation-pending');
        return;
      }
    }
  }, [userData, pathname, router, isInvitationPage]);

  const handleLogout = async () => {
    if (confirm('Are you sure you want to logout?')) {
      await logOut();
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar>
          <SidebarHeader>
             <div className="flex h-10 w-full items-center group-data-[state=expanded]:ml-1 group-data-[state=collapsed]:justify-center">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-md shrink-0">
                    <Users className="text-white text-lg" />
                </div>
                <div className="ml-3 flex flex-col overflow-hidden md:group-data-[state=collapsed]:hidden">
                    <h1 className="text-lg font-bold text-sidebar-foreground whitespace-nowrap">
                        PlacementGuru
                    </h1>
                     <p className="text-xs text-slate-500 font-medium">
                        Supervisor Portal
                    </p>
                </div>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
               {navItems.map(group => (
                <NavGroup title={group.group} key={group.group}>
                    {group.items.map(item => (
                    <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                        asChild
                        isActive={pathname.startsWith(item.href)}
                        tooltip={item.label}
                        >
                        <Link href={item.href}>
                            <item.icon />
                            <span className="md:group-data-[state=collapsed]:hidden">{item.label}</span>
                        </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    ))}
                </NavGroup>
                ))}
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        <div className="flex-1 flex flex-col">
           <header
          id="header"
          className="sticky top-0 h-16 bg-background/80 backdrop-blur-sm border-b z-20"
        >
          <div className="flex items-center justify-between h-full px-6">
            <div className="flex items-center gap-4">
               <SidebarTrigger className="md:hidden"/>
               <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input placeholder="Search students..." className="pl-10 w-72" />
                </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <button className="p-3 text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-full transition-all duration-200 relative">
                  <Bell className="text-lg w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full">
                  </span>
                </button>
              </div>

              <div className="flex items-center space-x-3 pl-4 border-l border-slate-200">
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center space-x-3 hover:bg-slate-100 p-2 rounded-lg transition-colors cursor-pointer">
                    <Image
                      src={user?.photoURL || "https://picsum.photos/seed/supervisor/100/100"}
                      alt="Profile"
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
                    />
                    <div className="text-sm text-left">
                      <p className="text-slate-800 font-semibold">{userData?.name || user?.displayName || 'Supervisor'}</p>
                      <p className="text-slate-500 font-medium">Supervisor Account</p>
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem>
                      <User className="mr-2 h-4 w-4" />
                      Profile Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </header>

          <main id="main-content" className="flex-1 bg-slate-50">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
