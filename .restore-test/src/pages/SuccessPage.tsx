import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { FiCheckCircle, FiShoppingBag, FiArrowRight, FiStar } from 'react-icons/fi';

export const SuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { emptyCart } = useCart();
  
  const sessionId = searchParams.get('session_id');

  // Limpa o carrinho local assim que a página abre, 
  // garantindo uma boa experiência visual enquanto o webhook finaliza no banco.
  useEffect(() => {
    emptyCart();
  }, [emptyCart]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-tr from-emerald-50 via-white to-pink-50 px-4">
      <div className="w-full max-w-md text-center bg-white rounded-2xl p-8 shadow-xl border border-gray-100 relative overflow-hidden">
        
        {/* Detalhe estético de brilho */}
        <div className="absolute top-0 right-0 p-4 text-pink-300">
          <FiStar className="h-6 w-6 animate-pulse" />
        </div>

        {/* Ícone de Sucesso */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-500 mb-6 shadow-xs">
          <FiCheckCircle className="h-10 w-10" />
        </div>

        {/* Textos Principais */}
        <h2 className="text-3xl font-black text-gray-900 tracking-tight">
          Pedido Confirmado!
        </h2>
        <p className="mt-3 text-sm text-gray-500 leading-relaxed">
          Seu pagamento foi processado com sucesso. Prepare-se para receber o seu novo glow! Enviamos os detalhes do rastreio para o seu e-mail.
        </p>

        {/* Exibição sutil do ID da sessão do Stripe (Útil para suporte se necessário) */}
        {sessionId && (
          <div className="mt-4 inline-block bg-gray-50 rounded-lg px-3 py-1.5 border border-gray-100">
            <span className="text-[10px] font-mono text-gray-400 block uppercase tracking-wider">Cód. Transação</span>
            <span className="text-xs font-mono text-gray-600 block truncate max-w-60">{sessionId}</span>
          </div>
        )}

        {/* Divisor */}
        <hr className="my-8 border-gray-100" />

        {/* Botões de Ação */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex w-full items-center justify-center rounded-xl bg-linear-to-r from-red-600 to-amber-500 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-pink-100 hover:from-pink-700 hover:to-rose-600 active:scale-98 transition-all duration-150"
          >
            <FiShoppingBag className="mr-2 h-4 w-4" />
            Continuar Comprando
          </button>

          <button
            type="button"
            onClick={() => navigate('/orders')} // Rota opcional para histórico de pedidos
            className="flex w-full items-center justify-center rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-100 active:scale-98 transition-all duration-150"
          >
            Acompanhar Pedido
            <FiArrowRight className="ml-2 h-4 w-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
