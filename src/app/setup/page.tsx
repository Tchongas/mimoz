// ============================================
// MIMOZ - Setup Page
// ============================================
// Shown when Supabase is not configured

import { Settings, ExternalLink, CheckCircle, XCircle } from 'lucide-react';

export default function SetupPage() {
  const checks = [
    {
      name: 'NEXT_PUBLIC_SUPABASE_URL',
      configured: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    },
    {
      name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      configured: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    },
    {
      name: 'SUPABASE_SERVICE_ROLE_KEY',
      configured: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    },
  ];

  const allConfigured = checks.every((c) => c.configured);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Mimoz</h1>
          <p className="text-slate-400">Configuração Inicial</p>
        </div>

        {/* Setup Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
              <Settings className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                Configuração Necessária
              </h2>
              <p className="text-sm text-slate-500">
                Configure as variáveis de ambiente
              </p>
            </div>
          </div>

          {/* Status Checks */}
          <div className="space-y-3 mb-6">
            {checks.map((check) => (
              <div
                key={check.name}
                className={`flex items-center gap-3 p-3 rounded-lg ${
                  check.configured ? 'bg-green-50' : 'bg-red-50'
                }`}
              >
                {check.configured ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
                <code className="text-sm font-mono">
                  {check.name}
                </code>
              </div>
            ))}
          </div>

          {allConfigured ? (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-6">
              <p className="text-green-700 text-sm">
                Todas as variáveis estão configuradas! Reinicie o servidor.
              </p>
            </div>
          ) : (
            <>
              {/* Instructions */}
              <div className="border-t border-slate-200 pt-6 mb-6">
                <h3 className="font-medium text-slate-900 mb-3">
                  Como configurar:
                </h3>
                <ol className="space-y-2 text-sm text-slate-600">
                  <li className="flex gap-2">
                    <span className="font-medium text-slate-900">1.</span>
                    Copie o arquivo <code className="px-1 bg-slate-100 rounded">.env.local.example</code> para <code className="px-1 bg-slate-100 rounded">.env.local</code>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-medium text-slate-900">2.</span>
                    Crie um projeto no Supabase
                  </li>
                  <li className="flex gap-2">
                    <span className="font-medium text-slate-900">3.</span>
                    Copie as chaves de API para o arquivo .env.local
                  </li>
                  <li className="flex gap-2">
                    <span className="font-medium text-slate-900">4.</span>
                    Reinicie o servidor de desenvolvimento
                  </li>
                </ol>
              </div>

              {/* Terminal Command */}
              <div className="bg-slate-900 rounded-lg p-4 mb-6">
                <code className="text-green-400 text-sm">
                  cp .env.local.example .env.local
                </code>
              </div>
            </>
          )}

          {/* Links */}
          <div className="flex gap-3">
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors"
            >
              Supabase Dashboard
              <ExternalLink className="w-4 h-4" />
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
            >
              Documentação
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
