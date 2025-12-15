'use client';

import Image from 'next/image';
import Link from 'next/link';

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <Image src="/images/logo.png" alt="Tapresente" width={20} height={20} className="invert" />
            </div>
            <span className="text-xl font-bold text-slate-900">Tapresente</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link 
              href="/auth/login" 
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              Entrar
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
