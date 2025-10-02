
'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  User,
  Search,
  Briefcase,
  FileText,
  Award,
  Users,
  Bot,
  BookOpen,
  HeartPulse,
  ClipboardCheck,
  ShoppingBag,
  AlertTriangle,
  CheckSquare,
  Download,
} from 'lucide-react';

const navItems = [
  { href: '/student/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/student/profile', icon: User, label: 'Profile' },
  { href: '/student/opportunities', icon: Search, label: 'Opportunities' },
  { href: '/student/placement-marketplace', icon: ShoppingBag, label: 'Placement Marketplace' },
  { href: '/student/placements', icon: Briefcase, label: 'My Placements' },
  { href: '/student/compliance-tracker', icon: ClipboardCheck, label: 'My Compliance Progress' },
  { href: '/student/digital-logbook', icon: BookOpen, label: 'Digital Logbook' },
  { href: '/student/assessment-tasks', icon: CheckSquare, label: 'Assessment Tasks (Pending)' },
  { href: '/student/compliance-alerts', icon: AlertTriangle, label: 'Compliance Alerts' },
  { href: '/student/portfolio-export', icon: Download, label: 'My Portfolio Export' },
  { href: '/student/feedback', icon: FileText, label: 'Feedback' },
  { href: '/student/certificates', icon: Award, label: 'Certificates' },
  { href: '/student/support', icon: Users, label: 'Support' },
  { href: '/student/ai-assistant', icon: Bot, label: 'AI Assistant' },
  { href: '/student/learning', icon: BookOpen, label: 'Learning Hub' },
  { href: '/student/wellness', icon: HeartPulse, label: 'Wellness' },
];

export function StudentNav() {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {navItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton
            asChild
            isActive={pathname === item.href}
            tooltip={item.label}
          >
            <Link href={item.href}>
              <item.icon />
              <span className="md:group-data-[state=collapsed]:hidden">{item.label}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
