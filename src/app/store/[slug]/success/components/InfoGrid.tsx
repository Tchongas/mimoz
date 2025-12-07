import { Mail, Calendar } from 'lucide-react';

interface InfoGridProps {
  recipientName: string | null;
  recipientEmail: string | null;
  expiresAt: string;
  businessName: string;
  code: string;
}

export function InfoGrid({
  recipientName,
  recipientEmail,
  expiresAt,
  businessName,
  code,
}: InfoGridProps) {
  const expiryDate = new Date(expiresAt);
  const daysRemaining = Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  return (
    <div className="grid grid-cols-2 gap-3 mb-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
        <div className="flex items-center gap-2 text-slate-400 mb-2">
          <Mail className="w-4 h-4" />
          <span className="text-xs uppercase tracking-wider">Destinatário</span>
        </div>
        <p className="font-semibold text-slate-900 truncate">{recipientName}</p>
        <p className="text-xs text-slate-500 truncate">{recipientEmail}</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
        <div className="flex items-center gap-2 text-slate-400 mb-2">
          <Calendar className="w-4 h-4" />
          <span className="text-xs uppercase tracking-wider">Validade</span>
        </div>
        <p className="font-semibold text-slate-900">
          {expiryDate.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })}
        </p>
        <p className="text-xs text-slate-500">
          {daysRemaining} dias restantes
        </p>
      </div>
    </div>
  );
}
