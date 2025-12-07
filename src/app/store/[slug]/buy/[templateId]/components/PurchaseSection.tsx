import { User } from 'lucide-react';
import { LoginButton } from '@/app/auth/login/login-button';
import { PurchaseForm } from '../purchase-form';

interface PurchaseSectionProps {
  isAuthenticated: boolean;
  userName: string | null;
  userEmail: string | null;
  businessId: string;
  businessSlug: string;
  templateId: string;
  amountCents: number;
  accentColor: string;
  returnUrl: string;
}

export function PurchaseSection({
  isAuthenticated,
  userName,
  userEmail,
  businessId,
  businessSlug,
  templateId,
  amountCents,
  accentColor,
  returnUrl,
}: PurchaseSectionProps) {
  return (
    <div>
      <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-7 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 mb-1">Finalizar Compra</h2>
        <p className="text-sm text-slate-600 mb-6">
          Revise os dados e continue para o pagamento seguro via PIX.
        </p>

        {isAuthenticated ? (
          <>
            <div className="mb-6 p-4 bg-slate-50 rounded-xl flex items-center gap-3 border border-slate-100">
              <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <p className="font-medium text-slate-900 leading-snug">
                  {userName || userEmail?.split('@')[0]}
                </p>
                <p className="text-xs text-slate-500">{userEmail}</p>
              </div>
            </div>

            <PurchaseForm
              businessId={businessId}
              businessSlug={businessSlug}
              templateId={templateId}
              amount={amountCents}
              accentColor={accentColor}
              returnUrl={returnUrl}
            />
          </>
        ) : (
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              Faça login para continuar
            </h3>
            <p className="text-slate-500 text-sm mb-6">
              Você precisa estar logado para comprar um vale-presente.
            </p>
            <LoginButton redirectTo={returnUrl} />
          </div>
        )}
      </div>
    </div>
  );
}
