// ============================================
// Tapresente - Auth Error Page
// ============================================
// Shown when authentication fails

import Link from 'next/link';
import { XCircle } from 'lucide-react';

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  
  const errorMessages: Record<string, string> = {
    no_profile: 'Seu perfil não foi encontrado. Entre em contato com o administrador.',
    auth_failed: 'A autenticação falhou. Por favor, tente novamente.',
    access_denied: 'Acesso negado. Você não tem permissão para acessar este recurso.',
    session_error: 'Erro ao verificar sessão. Verifique sua conexão e tente novamente.',
    database_error: 'Erro ao acessar o banco de dados. Tente novamente em alguns instantes.',
    timeout: 'A requisição demorou muito. Verifique sua conexão.',
    default: 'Ocorreu um erro inesperado. Por favor, tente novamente.',
  };

  const errorMessage = errorMessages[params.error || 'default'] || errorMessages.default;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="w-full max-w-md p-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          
          <h1 className="text-2xl font-semibold text-slate-900 mb-2">
            Erro de Autenticação
          </h1>
          
          <p className="text-slate-500 mb-6">
            {errorMessage}
          </p>
          
          <div className="space-y-3">
            <Link
              href="/auth/login"
              className="block w-full px-4 py-3 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors"
            >
              Tentar Novamente
            </Link>
            
            <a
              href="mailto:suporte@tapresente.com"
              className="block w-full px-4 py-3 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
            >
              Contatar Suporte
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
