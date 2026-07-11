import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiXCircle, FiShoppingCart, FiHelpCircle } from 'react-icons/fi';

export const CancelPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-tr from-amber-50 via-white to-gray-50 px-4">
      <div className="w-full max-w-md text-center bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
        
        {/* Ícone de Cancelamento/Aviso */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 text-amber-500 mb-6 shadow-xs">
          <FiXCircle className="h-10 w-10" />
        </div>

        {/* Textos Principais */}
        <h2 className="text-3xl font-black text-gray-900 tracking-tight">
          Pagamento Não Concluído
        </h2>
        <p className="mt-3 text-sm text-gray-500 leading-relaxed">
          A operação foi cancelada e nenhuma cobrança foi realizada. Suas maquiagens continuam guardadas com segurança no seu StoreCar esperando por você!
        </p>

        {/* Divisor */}
        <hr className="my-8 border-gray-100" />

        {/* Botões de Ação */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => navigate('/')} // Redireciona para o catálogo/home onde ele abre o carrinho
            className="flex w-full items-center justify-center rounded-xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white shadow-md hover:bg-gray-800 active:scale-98 transition-all duration-150"
          >
            <FiShoppingCart className="mr-2 h-4 w-4" />
            Voltar ao Meu Carrinho
          </button>

          <a
            href="mailto:suporte@glowstack.com"
            className="flex w-full items-center justify-center rounded-xl bg-white border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50 active:scale-98 transition-all duration-150"
          >
            <FiHelpCircle className="mr-2 h-4 w-4" />
            Precisa de ajuda? Fale conosco
          </a>
        </div>

      </div>
    </div>
  );
};
