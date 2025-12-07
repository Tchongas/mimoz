interface AccountHeaderProps {
  totalPurchased: number;
  totalReceived: number;
}

export function AccountHeader({ totalPurchased, totalReceived }: AccountHeaderProps) {
  const total = totalPurchased + totalReceived;

  return (
    <header className="mb-8">
      <h1 className="text-2xl font-bold text-slate-900">Meus Vale-Presentes</h1>
      <p className="text-slate-500 mt-1 text-sm">
        Vale-presentes que você comprou ou recebeu
        {total > 0 && (
          <span className="ml-1 text-slate-400">({total})</span>
        )}
      </p>
    </header>
  );
}
