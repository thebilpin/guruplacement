'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { APP_CONFIG, ADMIN_CONTENT, getContent } from '@/lib/content';
import {
  Sidebar,
  SidebarProvider,
  SidebarHeader,
  SidebarContent,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  Shield,
  CreditCard,
  Database,
  Puzzle,
  Megaphone,
  LifeBuoy,
  BarChart,
  Palette,
  Settings,
  Beaker,
  GraduationCap,
  Search,
  Bell,
  LogOut,
  User,
  ClipboardCheck,
  Calendar,
  AlertTriangle,
  MessageCircle,
  Download,
  FileText,
  Activity,
  TrendingUp,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const navItems = [
  {
    group: ADMIN_CONTENT.layout.navigation.groups.general,
    items: [
      { href: '/admin/dashboard', icon: LayoutDashboard, label: ADMIN_CONTENT.layout.navigation.items.dashboard },
      { href: '/admin/users', icon: Users, label: ADMIN_CONTENT.layout.navigation.items.users },
      { href: '/admin/verification', icon: ShieldCheck, label: ADMIN_CONTENT.layout.navigation.items.verification },
      { href: '/admin/announcements', icon: Megaphone, label: ADMIN_CONTENT.layout.navigation.items.announcements },
      { href: '/admin/support', icon: LifeBuoy, label: ADMIN_CONTENT.layout.navigation.items.support },
    ],
  },
  {
    group: ADMIN_CONTENT.layout.navigation.groups.compliance,
    items: [
      { href: '/admin/compliance', icon: Shield, label: ADMIN_CONTENT.layout.navigation.items.compliance },
      { href: '/admin/student-compliance', icon: ClipboardCheck, label: ADMIN_CONTENT.layout.navigation.items.studentCompliance },
      { href: '/admin/trainer-credentials', icon: GraduationCap, label: ADMIN_CONTENT.layout.navigation.items.trainerCredentials },
      { href: '/admin/audit-scheduler', icon: Calendar, label: ADMIN_CONTENT.layout.navigation.items.auditScheduler },
      { href: '/admin/compliance-heatmap', icon: TrendingUp, label: ADMIN_CONTENT.layout.navigation.items.complianceHeatmap },
      { href: '/admin/compliance-alerts', icon: AlertTriangle, label: ADMIN_CONTENT.layout.navigation.items.complianceAlerts },
    ],
  },
  {
    group: ADMIN_CONTENT.layout.navigation.groups.content,
    items: [
      { href: '/admin/feedback-logs', icon: MessageCircle, label: ADMIN_CONTENT.layout.navigation.items.feedbackLogs },
      { href: '/admin/audit-logs', icon: FileText, label: ADMIN_CONTENT.layout.navigation.items.auditLogs },
      { href: '/admin/finance', icon: CreditCard, label: ADMIN_CONTENT.layout.navigation.items.finance },
      { href: '/admin/data-tools', icon: Database, label: ADMIN_CONTENT.layout.navigation.items.dataTools },
      { href: '/admin/analytics', icon: BarChart, label: ADMIN_CONTENT.layout.navigation.items.analytics },
    ],
  },
  {
    group: ADMIN_CONTENT.layout.navigation.groups.configuration,
    items: [
      { href: '/admin/integrations', icon: Puzzle, label: ADMIN_CONTENT.layout.navigation.items.integrations },
      { href: '/admin/theming', icon: Palette, label: ADMIN_CONTENT.layout.navigation.items.theming },
      { href: '/admin/settings', icon: Settings, label: ADMIN_CONTENT.layout.navigation.items.settings },
      { href: '/admin/sandbox', icon: Beaker, label: ADMIN_CONTENT.layout.navigation.items.sandbox },
    ]
  }
];

const NavGroup = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400 md:group-data-[state=collapsed]:hidden">
      {title}
    </p>
    <div className="flex flex-col gap-1">{children}</div>
  </div>
);

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, userData, logOut } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [showProfileModal, setShowProfileModal] = React.useState(false);
  const [showNotifications, setShowNotifications] = React.useState(false);
  const [notifications, setNotifications] = React.useState([
    { id: 1, title: 'New User Registration', message: 'Dr. Jennifer Williams registered as Assessor', time: '2 minutes ago', unread: true },
    { id: 2, title: 'System Update', message: 'Platform maintenance scheduled for tonight', time: '1 hour ago', unread: true },
    { id: 3, title: 'Payment Processed', message: 'Monthly subscription renewed successfully', time: '3 hours ago', unread: false },
  ]);

  const handleLogout = async () => {
    if (confirm(ADMIN_CONTENT.layout.profile.confirmLogout)) {
      await logOut();
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/admin/users?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const markNotificationAsRead = (id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));
  };

  const unreadCount = notifications.filter(n => n.unread).length;

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
                  {APP_CONFIG.brand.name}
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  {ADMIN_CONTENT.layout.portal.name}
                </p>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <div className="flex flex-col h-full">
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
              
              <div className="mt-auto p-3 border-t">
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="md:group-data-[state=collapsed]:hidden ml-2">{ADMIN_CONTENT.layout.profile.logout}</span>
                </Button>
              </div>
            </div>
          </SidebarContent>
        </Sidebar>
        
        <div className="flex-1 flex flex-col">
          <header className="sticky top-0 h-16 bg-background/80 backdrop-blur-sm border-b z-20">
            <div className="flex items-center justify-between h-full px-6">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="md:hidden"/>
                <div className="hidden md:block">
                  <h2 className="text-xl font-semibold text-slate-800">{ADMIN_CONTENT.layout.title}</h2>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <form onSubmit={handleSearch} className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input 
                    placeholder={ADMIN_CONTENT.layout.search.placeholder} 
                    className="pl-10 w-72" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </form>

                <DropdownMenu open={showNotifications} onOpenChange={setShowNotifications}>
                  <DropdownMenuTrigger asChild>
                    <button className="p-3 text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-full transition-all duration-200 relative">
                      <Bell className="text-lg w-5 h-5" />
                      {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full">
                          <span className="sr-only">{unreadCount} unread notifications</span>
                        </span>
                      )}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-80 p-0" align="end">
                    <div className="p-4 border-b">
                      <h3 className="font-semibold">{ADMIN_CONTENT.layout.notifications.title}</h3>
                      <p className="text-sm text-muted-foreground">{ADMIN_CONTENT.layout.notifications.unreadCount(unreadCount)}</p>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                            notification.unread ? 'bg-blue-50' : ''
                          }`}
                          onClick={() => markNotificationAsRead(notification.id)}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-medium text-sm">{notification.title}</h4>
                              <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                              <p className="text-xs text-muted-foreground mt-2">{notification.time}</p>
                            </div>
                            {notification.unread && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full mt-1"></div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-2 border-t">
                      <Button variant="ghost" className="w-full text-sm">
                        {ADMIN_CONTENT.layout.notifications.viewAll}
                      </Button>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center space-x-3 pl-4 border-l border-slate-200 hover:bg-gray-50 rounded-lg p-2 transition-colors">
                      <Image
                        src="https://picsum.photos/seed/platform-admin/100/100"
                        alt="Profile"
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
                      />
                      <div className="text-sm text-left">
                        <p className="text-slate-800 font-semibold">{userData?.name || APP_CONFIG.defaults.adminUser.name}</p>
                        <p className="text-slate-500 font-medium">{APP_CONFIG.defaults.adminUser.role}</p>
                      </div>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <DropdownMenuItem onClick={() => setShowProfileModal(true)}>
                      <User className="mr-2 h-4 w-4" />
                      {ADMIN_CONTENT.layout.profile.viewProfile}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/admin/settings')}>
                      <Settings className="mr-2 h-4 w-4" />
                      {ADMIN_CONTENT.layout.profile.settings}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      {ADMIN_CONTENT.layout.profile.logout}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          <main className="flex-1 bg-slate-50">
            {children}
          </main>
        </div>
      </div>

      <SuperAdminProfileModal 
        isOpen={showProfileModal} 
        onClose={() => setShowProfileModal(false)}
        userData={userData}
      />
    </SidebarProvider>
  );
}

// Enhanced Super Admin Profile Modal Component
function SuperAdminProfileModal({ isOpen, onClose, userData }: { 
  isOpen: boolean; 
  onClose: () => void; 
  userData: any;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: userData?.name || APP_CONFIG.defaults.adminUser.name,
    email: userData?.email || APP_CONFIG.defaults.adminUser.email,
    role: APP_CONFIG.defaults.adminUser.role
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('Profile updated:', profileData);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset to original data
    setProfileData({
      name: userData?.name || APP_CONFIG.defaults.adminUser.name,
      email: userData?.email || APP_CONFIG.defaults.adminUser.email,
      role: APP_CONFIG.defaults.adminUser.role
    });
    setIsEditing(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] border-2 border-gray-200 shadow-xl">
        <DialogHeader className="border-b border-gray-100 pb-4">
          <DialogTitle className="text-xl font-semibold text-gray-900">
            {ADMIN_CONTENT.profileModal.title}
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            {ADMIN_CONTENT.profileModal.description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-6">
          {/* Profile Picture Section */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Image
                src="https://picsum.photos/seed/platform-admin/120/120"
                alt="Profile Picture"
                width={120}
                height={120}
                className="w-28 h-28 rounded-full border-4 border-white shadow-lg ring-2 ring-gray-200"
              />
              <div className="absolute bottom-0 right-0 w-8 h-8 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
            </div>
            {isEditing && (
              <Button variant="outline" size="sm" className="text-xs">
                {ADMIN_CONTENT.profileModal.buttons.changePhoto}
              </Button>
            )}
          </div>

          {/* Profile Information */}
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  {ADMIN_CONTENT.profileModal.fields.fullName}
                </label>
                {isEditing ? (
                  <Input
                    value={profileData.name}
                    onChange={(e) => setProfileData(prev => ({...prev, name: e.target.value}))}
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    placeholder={ADMIN_CONTENT.profileModal.placeholders.fullName}
                  />
                ) : (
                  <div className="px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-900">
                    {profileData.name}
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  {ADMIN_CONTENT.profileModal.fields.email}
                </label>
                {isEditing ? (
                  <Input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData(prev => ({...prev, email: e.target.value}))}
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    placeholder={ADMIN_CONTENT.profileModal.placeholders.email}
                  />
                ) : (
                  <div className="px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-900">
                    {profileData.email}
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  {ADMIN_CONTENT.profileModal.fields.role}
                </label>
                <div className="px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-900">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {profileData.role}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
          <div className="flex items-center text-xs text-gray-500">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
            {ADMIN_CONTENT.profileModal.status.lastUpdated}
          </div>
          
          <div className="flex space-x-3">
            {isEditing ? (
              <>
                <Button 
                  variant="outline" 
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="px-4 py-2"
                >
                  {ADMIN_CONTENT.profileModal.buttons.cancel}
                </Button>
                <Button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      {ADMIN_CONTENT.profileModal.status.saving}
                    </>
                  ) : (
                    ADMIN_CONTENT.profileModal.buttons.saveChanges
                  )}
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={onClose} className="px-4 py-2">
                  {ADMIN_CONTENT.profileModal.buttons.close}
                </Button>
                <Button 
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {ADMIN_CONTENT.profileModal.buttons.editProfile}
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
