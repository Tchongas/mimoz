// ============================================
// Tapresente - Account Settings Page
// ============================================
// User can view and update their profile settings

import { createClient } from '@/lib/supabase/server';
import { User, Mail, Shield } from 'lucide-react';

export default async function AccountSettingsPage() {
  const supabase = await createClient();
  
  // Get current user - middleware already handles auth redirect
  const { data: { user } } = await supabase.auth.getUser();
  
  // User is guaranteed by middleware, but handle edge case gracefully
  if (!user) {
    return null;
  }
  
  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
  
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Configurações</h1>
        <p className="text-slate-500 mt-1">
          Gerencie suas informações de conta
        </p>
      </div>
      
      {/* Profile Section */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <User className="w-5 h-5" />
          Perfil
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nome
            </label>
            <p className="text-slate-900">
              {profile?.full_name || 'Não informado'}
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>
            <p className="text-slate-900 flex items-center gap-2">
              <Mail className="w-4 h-4 text-slate-400" />
              {user.email}
            </p>
          </div>
          
          {profile?.avatar_url && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Foto
              </label>
              <img 
                src={profile.avatar_url} 
                alt="Avatar"
                className="w-16 h-16 rounded-full"
              />
            </div>
          )}
        </div>
      </div>
      
      {/* Account Info */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Conta
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              ID da conta
            </label>
            <p className="text-slate-500 font-mono text-sm">
              {user.id}
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Membro desde
            </label>
            <p className="text-slate-900">
              {new Date(profile?.created_at || user.created_at).toLocaleDateString('pt-BR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Autenticação
            </label>
            <p className="text-slate-900 flex items-center gap-2">
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
