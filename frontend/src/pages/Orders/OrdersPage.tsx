import React from 'react';
import { useOrders } from '../../hooks/useOrders';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';
import { FaShoppingBag, FaCalendar, FaCheckCircle, FaClock, FaMapPin, FaSpinner } from 'react-icons/fa';
import { AlertCircle  } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const OrdersPage: React.FC = () => {
  const { orders, loadingOrders, ordersError } = useOrders();
  const { formatCurrency } = useCart();
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  // 1. Proteção de Rota Visual
  if (!isLoggedIn) {
    return (
      <div className="flex min-h-125 flex-col items-center justify-center p-4 text-center">
        <AlertCircle  className="h-12 w-12 text-amber-500 mb-2" />
        <h3 className="text-base font-bold text-gray-950">Acesso Restrito</h3>
        <p className="text-sm text-gray-500 max-w-xs mt-1">Você precisa estar logado para visualizar seu histórico de compras.</p>
        <button 
          onClick={() => navigate('/login')}
          className="mt-4 rounded-xl bg-gray-950 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
        >
          Ir para o Login
        </button>
      </div>
    );
  }

  // 2. Estado de Carregamento
  if (loadingOrders) {
    return (
      <div className="flex min-h-100 flex-col items-center justify-center space-y-4">
        <FaSpinner className="h-10 w-10 animate-spin text-red-600" />
        <p className="text-sm font-medium text-gray-500">Buscando seus pedidos na GlowStack...</p>
      </div>
    );
  }

  // 3. Estado de Erro
  if (ordersError) {
    return (
      <div className="mx-auto max-w-md my-8 rounded-xl bg-red-50 p-6 text-center border border-red-200">
        <p className="text-sm font-semibold text-red-800">Erro ao carregar compras</p>
        <p className="mt-1 text-xs text-red-600">{ordersError}</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        
        {/* Cabeçalho */}
        <div className="mb-8">
          <h1 className="text-2xl font-black text-gray-900 tracking-tight sm:text-3xl">
            Meus Pedidos
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Acompanhe o status e histórico de todas as suas compras de maquiagem.
          </p>
        </div>

        {/* Lista de Pedidos Vazia */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-xs">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-pink-50 text-red-600 mb-4">
              <FaShoppingBag className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-gray-900">Nenhum pedido encontrado</h3>
            <p className="mt-1 text-sm text-gray-500">Você ainda não realizou compras em nossa loja.</p>
            <button
              onClick={() => navigate('/')}
              className="mt-6 inline-flex items-center justify-center rounded-xl bg-linear-to-r from-red-600 to-amber-500 px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:from-red-700 hover:to-amber-600"
            >
              Explorar Maquiagens
            </button>
          </div>
        ) : (
          /* Grid/Lista de Pedidos */
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-2xl border border-gray-100 shadow-2xs overflow-hidden">
                
                {/* Topo do Card do Pedido */}
                <div className="bg-gray-50 border-b border-gray-100 px-4 py-4 sm:px-6 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <div>
                      <span className="block text-[10px] uppercase font-bold text-gray-400">Data do Pedido</span>
                      <div className="flex items-center space-x-1 font-medium text-gray-700 mt-0.5">
                        <FaCalendar className="h-3.5 w-3.5 text-gray-400" />
                        <span>{order.createdAt?.toDate().toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase font-bold text-gray-400">ID do Pedido</span>
                      <span className="font-mono text-gray-700 font-medium block mt-0.5 max-w-30 truncate">
                        {order.id}
                      </span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center">
                    {order.status === 'paid' ? (
                      <span className="inline-flex items-center space-x-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/10">
                        <FaCheckCircle className="h-3.5 w-3.5" />
                        <span>Pago Aprovado</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-600/10">
                        <FaClock className="h-3.5 w-3.5" />
                        <span>Pendente</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Itens do Pedido */}
                <div className="px-4 py-4 sm:px-6 divide-y divide-gray-50">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                      <div className="flex items-center space-x-4">
                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
                          <img
                            src={item.imageThumbnail || 'https://unsplash.com'}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-gray-900 line-clamp-1">{item.name}</h4>
                          <p className="text-xs text-gray-500 mt-0.5">Qtd: {item.quantity}</p>
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">
                        {formatCurrency(item.priceAtPurchase)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Rodapé do Card (Endereço e Total) */}
                <div className="bg-gray-50/50 border-t border-gray-100 px-4 py-4 sm:px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs">
                  {/* Endereço Capturado pelo Stripe */}
                  <div className="flex items-start space-x-1.5 text-gray-500 max-w-sm">
                    <FaMapPin className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                    <div>
                      <span className="font-semibold text-gray-700 block">Entregar em:</span>
                      <span className="block mt-0.5 text-gray-600">
                        {order.shippingAddress.line1}, {order.shippingAddress.city} - {order.shippingAddress.state} ({order.shippingAddress.postalCode})
                      </span>
                    </div>
                  </div>

                  {/* Valor Total do Pedido */}
                  <div className="text-left sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100">
                    <span className="block text-[10px] uppercase font-bold text-gray-400">Total Pago</span>
                    <span className="text-base font-black text-transparent bg-clip-text bg-linear-to-r from-red-600 to-amber-500">
                      {formatCurrency(order.totalAmount)}
                    </span>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
