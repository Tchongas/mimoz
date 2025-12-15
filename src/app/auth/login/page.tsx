// ============================================
// Tapresente - Login Page
// ============================================
// Google OAuth only - no email/password

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getRoleDashboard } from '@/lib/auth';
import { LoginButton } from './login-button';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string; error?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  
  // Check if user is already logged in
  const { data: { user } } = await supabase.auth.getUser();
  
  if (user) {
    // Get user's role and redirect to appropriate dashboard
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    
    const role = profile?.role || 'CASHIER';
    redirect(params.redirect || getRoleDashboard(role));
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="w-full max-w-md p-8">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Tapresente</h1>
          <p className="text-slate-400">Plataforma de Gift Cards</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-semibold text-slate-900 text-center mb-2">
            Bem-vindo
          </h2>
          <p className="text-slate-500 text-center mb-8">
            Faça login para acessar o painel
          </p>

          {/* Error Message */}
          {params.error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">
                {params.error === 'no_profile' && 'Perfil não encontrado. Entre em contato com o administrador.'}
                {params.error === 'auth_failed' && 'Falha na autenticação. Tente novamente.'}
                {!['no_profile', 'auth_failed'].includes(params.error) && 'Ocorreu um erro. Tente novamente.'}
              </p>
            </div>
          )}

          {/* Google Login Button */}
          <LoginButton redirectTo={params.redirect} />

          {/* Help Text */}
          <p className="mt-6 text-xs text-slate-400 text-center">
            Ao continuar, você concorda com nossos{' '}
            <a href="#" className="text-blue-600 hover:underline">
              Termos de Serviço
            </a>{' '}
            e{' '}
            <a href="#" className="text-blue-600 hover:underline">
              Política de Privacidade
            </a>
          </p>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-sm text-slate-500">
          Precisa de ajuda?{' '}
          <a href="#" className="text-blue-400 hover:underline">
            Entre em contato
          </a>
        </p>
      </div>
    </div>
  );
}
