// ============================================
// MIMOZ - Customer Account Layout
// ============================================
// Layout for customer account pages (purchases, settings)

import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Gift, User, LogOut, ShoppingBag, Settings } from 'lucide-react';

interface AccountLayoutProps {
  children: React.ReactNode;
}

export default async function AccountLayout({ children }: AccountLayoutProps) {
  const supabase = await createClient();
  
  // Get current user - middleware already handles auth redirect
  const { data: { user } } = await supabase.auth.getUser();
  
  // Get user profile (user is guaranteed by middleware)
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email, avatar_url')
    .eq('id', user?.id)
    .single();
  
  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Usuário';
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
                <Gift className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900">Mimoz</span>
            </Link>
            
            {/* User Menu */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
                  {profile?.avatar_url ? (
                    <img 
                      src={profile.avatar_url} 
                      alt={displayName}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <User className="w-4 h-4 text-slate-600" />
                  )}
                </div>
                <span className="text-sm font-medium text-slate-700 hidden sm:block">
                  {displayName}
                </span>
              </div>
              <Link
                href="/auth/logout"
                className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                title="Sair"
              >
                <LogOut className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </header>
      
      <div className="max-w-6xl mx-auto px-4 py-8 flex-1">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Main Content */}
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
