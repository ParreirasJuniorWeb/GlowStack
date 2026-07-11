import React, { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { useCart } from '../../hooks/useCart';
import { DollarSign, ShoppingBag, TrendingUp, Loader2, ListOrdered } from 'lucide-react';

interface BillingData {
  totalRevenue: number;
  totalSalesCount: number;
  averageTicket: number;
  recentTransactions: Array<{
    logId: string;
    customerEmail: string;
    amount: number;
    date: string;
  }>;
}

export const BillingDashboard: React.FC = () => {
  const { formatCurrency } = useCart();
  const [data, setData] = useState<BillingData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBillingData = async () => {
      try {
        const auth = getAuth();
        const token = await auth.currentUser?.getIdToken();

        if (!token) return;

        const response = await fetch('http://localhost:3001/admin/billing/dashboard', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Falha ao coletar dados de faturamento.');
        
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchBillingData();
  }, []);

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-red-600" /></div>;
  if (!data) return <p className="text-sm text-gray-500 text-center">Nenhum dado financeiro disponível.</p>;

  return (
    <div className="space-y-6">
      {/* GRID DE CARDS FINANCEIROS */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {/* Card 1: Faturamento Bruto */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Faturamento Total</span>
            <span className="text-2xl font-black text-gray-900 block mt-1">{formatCurrency(data.totalRevenue)}</span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <DollarSign className="h-5 w-5" />
          </div>
        </div>

        {/* Card 2: Total de Vendas */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Vendas Concluídas</span>
            <span className="text-2xl font-black text-gray-900 block mt-1">{data.totalSalesCount} pedidos</span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-pink-50 text-red-600 flex items-center justify-center">
            <ShoppingBag className="h-5 w-5" />
          </div>
        </div>

        {/* Card 3: Ticket Médio */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Ticket Médio</span>
            <span className="text-2xl font-black text-gray-900 block mt-1">{formatCurrency(data.averageTicket)}</span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <TrendingUp className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* ULTIMAS TRANSAÇÕES PARA AUDITORIA VISTA DO ADMIN */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-2xs p-6">
        <h3 className="font-bold text-gray-900 text-sm mb-4 flex items-center gap-1.5">
          <ListOrdered className="h-4 w-4 text-gray-400" /> Últimas Atividades de Auditoria
        </h3>
        <div className="divide-y divide-gray-50 text-xs text-gray-600">
          {data.recentTransactions.map((tx) => (
            <div key={tx.logId} className="flex justify-between py-3 first:pt-0 last:pb-0 font-medium">
              <div>
                <p className="text-gray-900 font-bold">{tx.customerEmail}</p>
                <p className="text-[10px] text-gray-400 font-mono mt-0.5">{tx.logId}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-900 font-black">{formatCurrency(tx.amount)}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{tx.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
