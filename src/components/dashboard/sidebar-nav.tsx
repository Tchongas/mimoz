'use client';

// ============================================
// MIMOZ - Sidebar Navigation Component
// ============================================

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { Role } from '@/types';
import {
  LayoutDashboard,
  Building2,
  Users,
  Settings,
  BarChart3,
  QrCode,
  History,
  FileText,
  type LucideIcon,
} from 'lucide-react';

interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

// Navigation items per role
const NAV_ITEMS: Record<Role, NavItem[]> = {
  ADMIN: [
    { title: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { title: 'Empresas', href: '/admin/businesses', icon: Building2 },
    { title: 'Usuários', href: '/admin/users', icon: Users },
    { title: 'Relatórios', href: '/admin/reports', icon: FileText },
  ],
  BUSINESS_OWNER: [
    { title: 'Visão Geral', href: '/business', icon: LayoutDashboard },
    { title: 'Vale-Presentes', href: '/business/cards', icon: QrCode },
    { title: 'Relatórios', href: '/business/reports', icon: FileText },
    { title: 'Configurações', href: '/business/settings', icon: Settings },
  ],
  CASHIER: [
    { title: 'Validar Código', href: '/cashier', icon: QrCode },
    { title: 'Histórico', href: '/cashier/history', icon: History },
  ],
};

interface SidebarNavProps {
  role: Role;
}

export function SidebarNav({ role }: SidebarNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const items = NAV_ITEMS[role] || [];

  const handleNavigation = (href: string, e: React.MouseEvent) => {
    e.preventDefault();
    startTransition(() => {
      router.push(href);
    });
  };

  return (
    <nav className="space-y-1">
      {items.map((item) => {
        const isActive = pathname === item.href || 
          (item.href !== `/${role.toLowerCase()}` && pathname.startsWith(item.href));
        
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={(e) => handleNavigation(item.href, e)}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150',
              isActive
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
              isPending && 'opacity-70'
            )}
          >
            <item.icon className={cn('w-5 h-5', isPending && 'animate-pulse')} />
            {item.title}
          </Link>
        );
      })}
    </nav>
  );
}
