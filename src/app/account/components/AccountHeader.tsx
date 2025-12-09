import { Gift, Sparkles } from 'lucide-react';

interface AccountHeaderProps {
  totalPurchased: number;
  totalReceived: number;
}

export function AccountHeader({ totalPurchased, totalReceived }: AccountHeaderProps) {
  const total = totalPurchased + totalReceived;

  return (
    <header className="mb-10">
      <div className="flex items-center gap-4 mb-2">
        <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl shadow-lg shadow-purple-200">
          <Gift className="w-7 h-7 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            Meus Vale-Presentes
            <Sparkles className="w-6 h-6 text-amber-400" />
          </h1>
          <p className="text-slate-500 mt-0.5">
            {total === 0 
              ? 'Você ainda não tem vale-presentes'
              : `${total} ${total === 1 ? 'vale-presente' : 'vale-presentes'} na sua carteira`
            }
          </p>
        </div>
      </div>
    </header>
  );
}
