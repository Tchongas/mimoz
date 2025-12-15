// ============================================
// Tapresente - Global Loading State
// ============================================

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-500">Carregando...</p>
      </div>
    </div>
  );
}
