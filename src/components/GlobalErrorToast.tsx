import React from "react";
import { useErrorHandler } from "../context/ErrorContext";
import { AlertCircle, X } from "lucide-react";

/**
 * Componente GlobalErrorToast
 * Renderiza notificações de erro globais (toast)
 * Deve ser colocado no App.tsx
 */
export function GlobalErrorToast() {
  const { errors, removeError } = useErrorHandler();

  if (errors.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 space-y-2 z-50">
      {errors.map((error) => (
        <div
          key={error.id}
          className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-lg p-4 max-w-sm"
        >
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-700 flex-1">{error.message}</p>
          <button
            onClick={() => removeError(error.id)}
            className="text-red-600 hover:text-red-700 flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
