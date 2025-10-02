
'use client';

import * as React from 'react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { StudentNav } from './components/nav';
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
  Bell,
  Bolt,
  LogOut,
  User,
} from 'lucide-react';

export default function StudentLayout({
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
                          pathname.includes('/no-rto');

  // Access control for Students
  React.useEffect(() => {
    if (userData && !isInvitationPage) {
      // Check if student has been invited and accepted
      const invitationStatus = (userData as any).invitationStatus;
      const rtoId = (userData as any).rtoId;
      
      if (!invitationStatus || invitationStatus === 'invited') {
        // Student has not accepted invitation yet
        const token = (userData as any).invitationToken;
        if (token) {
          router.push(`/accept-invitation?token=${token}`);
        } else {
          router.push('/student/invitation-pending');
        }
        return;
      }
      
      if (invitationStatus === 'declined') {
        router.push('/student/invitation-declined');
        return;
      }
      
      if (invitationStatus === 'expired') {
        router.push('/student/invitation-expired');
        return;
      }
      
      if (!rtoId) {
        router.push('/student/no-rto');
        return;
      }
      
      // Only 'accepted' status with RTO linkage allows dashboard access
      if (invitationStatus !== 'accepted') {
        router.push('/student/invitation-pending');
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
                <GraduationCap className="text-white text-lg" />
              </div>
              <div className="ml-3 flex flex-col overflow-hidden md:group-data-[state=collapsed]:hidden">
                <h1 className="text-lg font-bold text-sidebar-foreground whitespace-nowrap">
                  PlacementGuru
                </h1>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent>
              <StudentNav />
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
               <h2 className="text-lg font-bold text-slate-800">
                {pathname.split('/').pop()?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Dashboard'}
              </h2>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-primary/10 px-3 py-1.5 rounded-full border-2 border-primary/20">
                <Bolt className="text-primary w-5 h-5" />
                <span className="text-base text-primary font-bold">
                  1,247 XP
                </span>
              </div>

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
                      src={user?.photoURL || "https://picsum.photos/seed/student/100/100"}
                      alt="Profile"
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
                    />
                    <div className="text-sm text-left">
                      <p className="text-slate-800 font-semibold">{userData?.name || user?.displayName || 'Student'}</p>
                      <p className="text-slate-500 font-medium">Student Account</p>
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

        <main id="main-content" className="flex-1">
          {children}
        </main>
      </div>
    </div>
    </SidebarProvider>
  );
}
