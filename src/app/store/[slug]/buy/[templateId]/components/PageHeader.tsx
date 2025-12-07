import Link from 'next/link';
import { ArrowLeft, Gift } from 'lucide-react';

interface PageHeaderProps {
  slug: string;
  businessName: string;
  primaryColor: string;
}

export function PageHeader({ slug, businessName, primaryColor }: PageHeaderProps) {
  return (
    <header className="bg-white/95 backdrop-blur border-b border-slate-200 sticky top-0 z-10">
      <div className="max-w-4xl mx-auto px-4 py-3 md:py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href={`/store/${slug}`}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Voltar para a loja"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: primaryColor }}
            >
              <Gift className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-base md:text-lg font-semibold text-slate-900 leading-snug">
              {businessName}
            </h1>
          </div>
          <div className="hidden md:inline-flex text-xs text-slate-500">
            Vale-presente digital
          </div>
        </div>
      </div>
    </header>
  );
}
