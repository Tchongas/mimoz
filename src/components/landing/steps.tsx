import { StepCard } from './step-card';

const STEPS = [
  {
    number: '1',
    title: 'Crie sua conta',
    description: 'Entre em contato Conosco',
  },
  {
    number: '2',
    title: 'Configure seus vale-presentes',
    description: 'Defina valores, descrições e personalize sua página de vendas.',
  },
  {
    number: '3',
    title: 'Comece a vender',
    description: 'Compartilhe o link da sua loja e receba pagamentos via PIX.',
  },
];

export function LandingSteps() {
  return (
    <section className="py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Simples de começar
          </h2>
        </div>
        
        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {STEPS.map((step) => (
            <StepCard
              key={step.number}
              number={step.number}
              title={step.title}
              description={step.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
