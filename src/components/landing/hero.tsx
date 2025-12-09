import Link from 'next/link';
import { Sparkles, ArrowRight } from 'lucide-react';

export function LandingHero() {
  return (
    <section className="relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-white to-indigo-50" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-violet-200/30 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl" />
      
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="text-center max-w-3xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-violet-100 text-violet-700 rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Plataforma de Vale-Presentes
          </div>
          
          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-slate-900 tracking-tight mb-6">
            Venda vale-presentes
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600">
              para seu negócio
            </span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
            Crie sua loja de vale-presentes em minutos. Aceite pagamentos via PIX, 
            personalize sua página e acompanhe suas vendas em tempo real.
          </p>
          
          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/auth/register" 
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all hover:shadow-lg hover:-translate-y-0.5"
            >
              Criar Minha Loja
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              href="#como-funciona" 
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-medium text-slate-700 bg-white border border-slate-200 hover:border-slate-300 rounded-xl transition-colors"
            >
              Como Funciona
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
