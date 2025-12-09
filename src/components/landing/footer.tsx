import Link from 'next/link';
import { Gift } from 'lucide-react';

export function LandingFooter() {
  return (
    <footer className="bg-slate-900 border-t border-slate-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <Gift className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-white">Mimoz</span>
          </Link>
          
          {/* Links */}
          <div className="flex items-center gap-6 text-sm text-slate-400">
            <Link href="/auth/login" className="hover:text-white transition-colors">
              Entrar
            </Link>
            <Link href="/auth/register" className="hover:text-white transition-colors">
              Criar Conta
            </Link>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-slate-800 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} Mimoz. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}
