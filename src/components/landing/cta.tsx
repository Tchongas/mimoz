import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function LandingCTA() {
  return (
    <section className="py-20 bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Pronto para começar?
        </h2>
        <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
          Crie sua loja de vale-presentes agora mesmo. É grátis para começar.
        </p>
        <Link 
          href="/auth/register" 
          className="inline-flex items-center gap-2 px-8 py-4 text-lg font-semibold text-slate-900 bg-white hover:bg-slate-100 rounded-xl transition-all hover:shadow-lg"
        >
          Criar Minha Loja Grátis
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </section>
  );
}
