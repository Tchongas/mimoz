// ============================================
// MIMOZ - No Business Assigned Page
// ============================================
// Shown when a user doesn't have a business assigned

import { AlertTriangle } from 'lucide-react';

export default function NoBusinessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="w-full max-w-md p-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-8 h-8 text-amber-600" />
          </div>
          
          <h1 className="text-2xl font-semibold text-slate-900 mb-2">
            Acesso Pendente
          </h1>
          
          <p className="text-slate-500 mb-6">
            Sua conta ainda não foi vinculada a uma empresa. 
            Entre em contato com o administrador para solicitar acesso.
          </p>
          
          <div className="space-y-3">
            <form action="/auth/logout" method="POST">
              <button
                type="submit"
                className="block w-full px-4 py-3 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors"
              >
                Sair da Conta
              </button>
            </form>
            
            <a
              href="mailto:suporte@mimoz.com.br"
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
