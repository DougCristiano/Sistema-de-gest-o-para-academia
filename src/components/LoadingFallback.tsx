import { Loader2 } from "lucide-react";

/**
 * Componente de fallback para lazy-loaded components
 * Exibido enquanto a página está sendo carregada
 */
export function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white dark:bg-slate-950">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-sm text-slate-600 dark:text-slate-400">Carregando...</p>
      </div>
    </div>
  );
}
