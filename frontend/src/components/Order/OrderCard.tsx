import React, { useState } from 'react';
import type { Order } from '../../types/glowstack.ts';
import { useCart } from '../../hooks/useCart';
import { Calendar, CheckCircle2, Clock, MapPin, ChevronDown, ChevronUp } from 'lucide-react';

interface OrderCardProps {
  order: Order;
}

export const OrderCard: React.FC<OrderCardProps> = React.memo(({ order }) => {
  const { formatCurrency } = useCart();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-2xs overflow-hidden transition-all duration-200">
      
      {/* TOPO DO CARD */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="bg-gray-50 border-b border-gray-100 px-4 py-4 sm:px-6 flex flex-wrap items-center justify-between gap-4 cursor-pointer hover:bg-gray-100/50 transition-colors"
      >
        <div className="flex items-center space-x-6 text-xs text-gray-500">
          <div>
            <span className="block text-[10px] uppercase font-bold text-gray-400">Data do Pedido</span>
            <div className="flex items-center space-x-1 font-medium text-gray-700 mt-0.5">
              <Calendar className="h-3.5 w-3.5 text-gray-400" />
              <span>{order.createdAt?.toDate().toLocaleDateString('pt-BR')}</span>
            </div>
          </div>
          <div>
            <span className="block text-[10px] uppercase font-bold text-gray-400">Total Pago</span>
            <span className="font-bold text-gray-900 block mt-0.5">
              {formatCurrency(order.totalAmount)}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Status Badge */}
          {order.status === 'paid' ? (
            <span className="inline-flex items-center space-x-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/10">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Pago</span>
            </span>
          ) : (
            <span className="inline-flex items-center space-x-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-600/10">
              <Clock className="h-3.5 w-3.5" />
              <span>Pendente</span>
            </span>
          )}
          
          {isExpanded ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
        </div>
      </div>

      {/* DETALHES EXPANSÍVEIS DO PEDIDO */}
      {isExpanded && (
        <div className="animate-fade-in divide-y divide-gray-50">
          {/* Lista de Itens Comprados */}
          <div className="px-4 py-2 sm:px-6 divide-y divide-gray-50">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between py-4">
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
                    <p className="text-xs text-gray-400 mt-0.5">Qtd: {item.quantity} × {formatCurrency(item.priceAtPurchase)}</p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  {formatCurrency(item.priceAtPurchase * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          {/* Dados de Envio */}
          <div className="bg-gray-50/30 px-4 py-4 sm:px-6 flex items-start space-x-2 text-xs text-gray-500 border-t border-gray-100">
            <MapPin className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
            <div>
              <span className="font-semibold text-gray-700 block">Endereço de Entrega:</span>
              <span className="block mt-0.5 text-gray-600">
                {order.shippingAddress.line1}, {order.shippingAddress.city} - {order.shippingAddress.state} ({order.shippingAddress.postalCode})
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

OrderCard.displayName = 'OrderCard';
