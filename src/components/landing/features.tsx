import { Store, CreditCard, Gift, Palette, BarChart3, Zap } from 'lucide-react';
import { FeatureCard } from './feature-card';

const FEATURES = [
  {
    icon: Store,
    title: 'Sua Loja Online',
    description: 'Página personalizada com a cara do seu negócio. Compartilhe o link e comece a vender.',
  },
  {
    icon: CreditCard,
    title: 'Pagamento via PIX',
    description: 'Receba pagamentos instantâneos via PIX. Sem taxas escondidas, sem complicação.',
  },
  {
    icon: Gift,
    title: 'Vale-Presentes Digitais',
    description: 'Seus clientes recebem o vale-presente por email, pronto para usar ou presentear.',
  },
  {
    icon: Palette,
    title: 'Personalizável',
    description: 'Cores, logo, textos e seções. Deixe sua loja com a identidade da sua marca.',
  },
  {
    icon: BarChart3,
    title: 'Dashboard Completo',
    description: 'Acompanhe vendas, validações e relatórios em tempo real.',
  },
  {
    icon: Zap,
    title: 'Validação Rápida',
    description: 'Valide vale-presentes pelo código em segundos.',
  },
];

export function LandingFeatures() {
  return (
    <section id="como-funciona" className="py-20 bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Tudo que você precisa
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Uma plataforma completa para criar, vender e gerenciar vale-presentes do seu negócio.
          </p>
        </div>
        
        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {FEATURES.map((feature) => (
            <FeatureCard
              key={feature.title}
              icon={<feature.icon className="w-6 h-6" />}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
