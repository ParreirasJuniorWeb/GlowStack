import React, { useEffect } from "react";
import type { FallbackProps } from "react-error-boundary";
import { getAuth } from "firebase/auth";
import { AlertTriangle, RefreshCw, ShoppingBag } from "lucide-react";

export const ErrorFallback: React.FC<FallbackProps> = ({
  error,
  resetErrorBoundary,
}: any) => {
  
  useEffect(() => {
    const reportErrorToBackend = async () => {
      try {
        const auth = getAuth();
        const currentUserId = auth.currentUser?.uid || null;

        // Envia o payload detalhado do erro para o endpoint centralizado do Node.js
        await fetch("http://localhost:3001/logs/error", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: error.message || "Erro sem mensagem explícita",
            stack: error.stack || null,
            component: "React Frontend App",
            userId: currentUserId,
            platform: "Navegador Cliente (React)",
          }),
        });
      } catch (loggingNavError) {
        // Falha silenciosa para não gerar um loop infinito de travamento se a API de logs cair
        console.error(
          "Falha ao enviar telemetria para o servidor:",
          loggingNavError,
        );
      }
    };

    reportErrorToBackend();
  }, [error]);

  return (
    <div className="flex min-h-100 flex-col items-center justify-center p-6 text-center bg-white rounded-2xl border border-red-100 shadow-2xs my-4 mx-auto max-w-md animate-fade-in">
      {/* Ícone de Alerta */}
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-500 mb-4">
        <AlertTriangle className="h-6 w-6" />
      </div>

      {/* Título Amigável */}
      <h3 className="text-base font-bold text-gray-900">
        Ops! Ocorreu uma oscilação na conexão
      </h3>

      {/* Detalhe técnico do erro (Útil para debug) */}
      <p className="mt-2 text-xs text-gray-500 max-w-xs leading-relaxed">
        {error.message ||
          "Não foi possível estabelecer contato com nossos servidores de pagamento ou inventário."}
      </p>

      {/* Botões de Ação */}
      <div className="mt-6 flex flex-col sm:flex-row gap-2 w-full justify-center">
        <button
          type="button"
          onClick={resetErrorBoundary}
          className="flex items-center justify-center rounded-xl bg-linear-to-r from-pink-600 to-rose-500 px-4 py-2 text-xs font-semibold text-white shadow-2xs hover:from-pink-700 hover:to-rose-600 transition-all"
        >
          <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Tentar Novamente
        </button>

        <button
          type="button"
          onClick={() => (window.location.href = "/")}
          className="flex items-center justify-center rounded-xl bg-gray-50 border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-all"
        >
          <ShoppingBag className="mr-1.5 h-3.5 w-3.5" /> Ir para Home
        </button>
      </div>
    </div>
  );
};
