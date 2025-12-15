'use client';

// ============================================
// Tapresente - Dashboard Layout Component
// ============================================

import Image from 'next/image';
import { useState, Suspense } from 'react';
import { cn } from '@/lib/utils';
import { SidebarNav } from './sidebar-nav';
import { TopBar } from './top-bar';
import { NavigationProgress } from '@/components/ui';
import type { SessionUser } from '@/types';
import { X } from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  user: SessionUser;
  businessName?: string;
}

export function DashboardLayout({ children, user, businessName }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50/80">
      {/* Navigation progress bar */}
      <Suspense fallback={null}>
        <NavigationProgress />
      </Suspense>

      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-slate-200 transform transition-transform duration-200 lg:translate-x-0',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
              <Image src="/images/logo.png" alt="Tapresente" width={16} height={16} className="invert" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Tapresente</h1>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <div className="p-4">
          <SidebarNav role={user.role} />
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200">
          <p className="text-xs text-slate-400 text-center">
            Tapresente v0.1.0
          </p>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        <TopBar
          user={user}
          businessName={businessName}
          onMenuClick={() => setIsSidebarOpen(true)}
        />

        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
