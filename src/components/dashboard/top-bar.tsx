'use client';

// ============================================
// MIMOZ - Top Bar Component
// ============================================

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { getInitials } from '@/lib/utils';
import type { SessionUser } from '@/types';
import {
  LogOut,
  User,
  ChevronDown,
  Menu,
} from 'lucide-react';

interface TopBarProps {
  user: SessionUser;
  businessName?: string;
  onMenuClick?: () => void;
}

export function TopBar({ user, businessName, onMenuClick }: TopBarProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  const roleLabels: Record<string, string> = {
    ADMIN: 'Administrador',
    BUSINESS_OWNER: 'Proprietário',
    CASHIER: 'Operador',
  };

  return (
    <header className="h-16 bg-white/95 backdrop-blur border-b border-slate-200 px-4 lg:px-6 flex items-center justify-between sticky top-0 z-10">
      {/* Left side - Menu button (mobile) + Business name */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        {businessName && (
          <div className="hidden sm:block">
            <span className="text-sm text-slate-500">Empresa:</span>
            <span className="ml-2 text-sm font-medium text-slate-900">{businessName}</span>
          </div>
        )}
      </div>

      {/* Right side - User dropdown */}
      <div className="relative">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-3 p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          {/* Avatar */}
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.fullName || 'User'}
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm font-medium">
              {getInitials(user.fullName)}
            </div>
          )}
          
          {/* Name and role */}
          <div className="hidden sm:block text-left">
            <p className="text-sm font-medium text-slate-900">
              {user.fullName || user.email}
            </p>
            <p className="text-xs text-slate-500">
              {roleLabels[user.role] || user.role}
            </p>
          </div>
          
          <ChevronDown className="w-4 h-4 text-slate-400" />
        </button>

        {/* Dropdown menu */}
        {isDropdownOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsDropdownOpen(false)}
            />
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-20">
              <div className="px-4 py-3 border-b border-slate-200">
                <p className="text-sm font-medium text-slate-900">
                  {user.fullName || 'Usuário'}
                </p>
                <p className="text-xs text-slate-500 truncate">
                  {user.email}
                </p>
              </div>
              
              <Link
                href="/profile"
                className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                onClick={() => setIsDropdownOpen(false)}
              >
                <User className="w-4 h-4" />
                Meu Perfil
              </Link>
              
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4" />
                Sair
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
