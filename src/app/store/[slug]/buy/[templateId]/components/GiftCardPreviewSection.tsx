import { formatCurrency } from '@/lib/utils';

interface GiftCardPreviewSectionProps {
  businessName: string;
  amountCents: number;
  templateName: string;
  description?: string | null;
  validDays: number;
  giftCardColor: string;
}

export function GiftCardPreviewSection({
  businessName,
  amountCents,
  templateName,
  description,
  validDays,
  giftCardColor,
}: GiftCardPreviewSectionProps) {
  return (
    <div>
      <div
        className="rounded-2xl p-6 md:p-8 text-white aspect-[3/2] flex flex-col justify-between relative overflow-hidden shadow-sm"
        style={{ backgroundColor: giftCardColor }}
      >
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative">
          <p className="text-white/60 text-sm">Vale-Presente</p>
          <h2 className="mt-1 text-xl md:text-2xl font-bold leading-snug">{businessName}</h2>
        </div>

        <div className="relative">
          <p className="text-3xl md:text-4xl font-bold tracking-tight">
            {formatCurrency(amountCents)}
          </p>
          <p className="mt-2 text-sm md:text-base text-white/70">
            {templateName}
          </p>
        </div>
      </div>

      {description && (
        <div className="mt-6 p-4 bg-slate-100 rounded-xl">
          <h3 className="font-medium text-slate-900 mb-2">Sobre este vale-presente</h3>
          <p className="text-slate-600 text-sm">{description}</p>
        </div>
      )}

      <div
        className="mt-6 p-4 rounded-xl border"
        style={{
          backgroundColor: `${giftCardColor}10`,
          borderColor: `${giftCardColor}30`,
        }}
      >
        <h3 className="font-medium mb-2" style={{ color: giftCardColor }}>
          Como funciona
        </h3>
        <ul className="text-sm space-y-2" style={{ color: `${giftCardColor}cc` }}>
          <li>• Após a compra, você receberá o código por email</li>
          <li>• O destinatário também receberá uma cópia</li>
          <li>• Válido por {validDays} dias após a compra</li>
          <li>• Pode ser usado em qualquer unidade</li>
        </ul>
      </div>
    </div>
  );
}
