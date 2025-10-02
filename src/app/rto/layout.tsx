
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
  GraduationCap,
  LayoutDashboard,
  Users,
  Briefcase,
  FileText,
  Building,
  Bell,
  Search,
  ShieldCheck,
  PiggyBank,
  MessageSquare,
  Map,
  LogOut,
  User,
  ClipboardCheck,
  Calendar,
  AlertTriangle,
  BookOpen,
  TrendingUp,
  Download,
  Eye,
  Award,
} from 'lucide-react';
import { Input } from '@/components/ui/input';

const navItems = [
    {
      group: 'Management',
      items: [
        { href: '/rto/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { href: '/rto/placements', icon: Briefcase, label: 'Placements' },
        { href: '/rto/reports', icon: FileText, label: 'Reports' },
        { href: '/rto/funding', icon: PiggyBank, label: 'Funding' },
        { href: '/rto/messaging', icon: MessageSquare, label: 'Messaging' },
      ]
    },
    {
      group: 'Compliance & Quality',
      items: [
        { href: '/rto/compliance', icon: ShieldCheck, label: 'Compliance Overview' },
        { href: '/rto/student-compliance', icon: ClipboardCheck, label: 'Student Compliance Tracker' },
        { href: '/rto/trainer-credentials', icon: Award, label: 'Trainer/Assessor Credentials' },
        { href: '/rto/audit-scheduler', icon: Calendar, label: 'Audit Scheduler & Alerts' },
        { href: '/rto/compliance-heatmap', icon: TrendingUp, label: 'Compliance Risk Dashboard' },
        { href: '/rto/compliance-alerts', icon: AlertTriangle, label: 'RTO-wide Compliance Alerts' },
      ]
    },
    {
      group: 'Student Management',
      items: [
        { href: '/rto/students', icon: Users, label: 'Students' },
        { href: '/rto/digital-logbook', icon: BookOpen, label: 'Digital Logbook (View)' },
        { href: '/rto/assessment-tasks', icon: ClipboardCheck, label: 'Assessment Task Monitor' },
        { href: '/rto/portfolio-export', icon: Download, label: 'Portfolio/Evidence Export' },
        { href: '/rto/ncver-export', icon: FileText, label: 'NCVER/AVETMISS Export' },
      ]
    },
    {
      group: 'Data & Analytics',
      items: [
        { href: '/rto/providers', icon: Building, label: 'Providers' },
        { href: '/rto/feedback-logs', icon: MessageSquare, label: 'Feedback & Improvement' },
        { href: '/rto/audit-logs', icon: FileText, label: 'RTO Audit Log & Evidence' },
        { href: '/rto/map', icon: Map, label: 'Map View' },
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

export default function RTOLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, userData, logOut } = useAuth();

  // Check if user is on verification pages (allow access)
  const isVerificationPage = pathname.includes('/verification-') || 
                            pathname.includes('/account-suspended');

    // Access control for RTOs
  React.useEffect(() => {
    if (userData && !isVerificationPage) {
      // Debug: Log user data to console
      console.log('🔍 RTO Layout - User Data:', {
        email: (userData as any).email,
        role: (userData as any).role,
        verificationStatus: (userData as any).verificationStatus,
        emailVerified: (userData as any).emailVerified,
        pathname: pathname
      });
      
      const verificationStatus = (userData as any).verificationStatus;
      const userRole = (userData as any).role;
      const userEmail = (userData as any).email;
      
      // Special case: Always allow rto@placementhero.com.au full access
      if (userEmail === 'rto@placementhero.com.au') {
        console.log('✅ RTO Layout - PlacementHero RTO user - Full access granted');
        // If they're on verification pending page, redirect to dashboard
        if (pathname === '/rto/verification-pending') {
          console.log('🔄 Redirecting PlacementHero RTO from verification to dashboard');
          router.push('/rto/dashboard');
        }
        return;
      }
      
      // For other RTO users, check verification status
      if (userRole === 'rto_admin' || userRole === 'rto') {
        
        // If verified, allow access and redirect away from verification pages
        if (verificationStatus === 'verified') {
          console.log('✅ RTO Layout - Verified user - Full access granted');
          // If they're on verification pending page, redirect to dashboard
          if (pathname === '/rto/verification-pending') {
            console.log('🔄 Redirecting verified user from verification to dashboard');
            router.push('/rto/dashboard');
          }
          return;
        }
        
        // Handle non-verified statuses
        if (verificationStatus === 'rejected') {
          console.log('❌ RTO Layout - Redirecting to rejected');
          router.push('/rto/verification-rejected');
          return;
        }
        
        if (verificationStatus === 'suspended') {
          console.log('❌ RTO Layout - Redirecting to suspended');
          router.push('/rto/account-suspended');
          return;
        }
        
        // Default: pending or missing verification
        if (!verificationStatus || verificationStatus === 'pending') {
          console.log('⏳ RTO Layout - Redirecting to pending verification');
          router.push('/rto/verification-pending');
          return;
        }
      }
    }
  }, [userData, pathname, router, isVerificationPage]);

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
                    <GraduationCap className="text-white text-lg" />
                </div>
                <div className="ml-3 flex flex-col overflow-hidden md:group-data-[state=collapsed]:hidden">
                    <h1 className="text-lg font-bold text-sidebar-foreground whitespace-nowrap">
                        PlacementGuru
                    </h1>
                    <p className="text-xs text-slate-500 font-medium">
                        RTO Portal
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
                    <Input placeholder="Search students, providers..." className="pl-10 w-72" />
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
                      src={user?.photoURL || "https://picsum.photos/seed/rto-admin/100/100"}
                      alt="Profile"
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
                    />
                    <div className="text-sm text-left">
                      <p className="text-slate-800 font-semibold">{userData?.name || user?.displayName || 'RTO Admin'}</p>
                      <p className="text-slate-500 font-medium">RTO Account</p>
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
