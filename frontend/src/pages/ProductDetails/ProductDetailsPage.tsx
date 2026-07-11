import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProductDetails } from '../../hooks/useProductDetails';
import { useCart } from '../../hooks/useCart';
import { Star, ShoppingBag, ArrowLeft, Plus, Minus, Loader2, AlertCircle, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export const ProductDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { product, loading, error } = useProductDetails(id);
  const { addProduct, formatCurrency } = useCart(); // Usamos addToCart direto do Context ou mapeado pelo hook se preferir

  // Estado local para o contador de quantidade da página
  const [quantity, setQuantity] = useState(1);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <Loader2 className="h-10 w-10 animate-spin text-red-600" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 px-4">
        <div className="mx-auto max-w-md w-full rounded-2xl bg-red-50 p-6 text-center border border-red-200">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p className="text-sm font-bold text-red-800">Produto indisponível</p>
          <p className="mt-1 text-xs text-red-600">{error || 'Produto não encontrado.'}</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 rounded-xl bg-gray-900 px-4 py-2 text-xs font-semibold text-white hover:bg-gray-800 transition-colors"
          >
            Voltar ao Catálogo
          </button>
        </div>
      </div>
    );
  }

  const isOutOfStock = product.stock <= 0;

  const handleIncrease = () => {
    if (quantity < product.stock) setQuantity(prev => prev + 1);
  };

  const handleDecrease = () => {
    if (quantity > 1) setQuantity(prev => prev - 1);
  };

  const handleAddWithQuantity = async () => {
    if (isOutOfStock) return;
    // Context API recebe a quantidade escolhida localmente pelo usuário
    await addProduct(product, quantity);
    toast.success(`${quantity}x ${product.name} adicionado ao StoreCar!`);
  };

  return (
    <div className="min-h-screen bg-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        
        {/* Botão Voltar */}
        <button
          onClick={() => navigate(-1)}
          className="mb-8 flex items-center space-x-2 text-sm font-semibold text-gray-500 hover:text-red-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Voltar</span>
        </button>

        {/* Layout Grid em Duas Colunas */}
        <div className="grid grid-cols-1 gap-x-12 gap-y-10 lg:grid-cols-2">
          
          {/* COLUNA ESQUERDA: Galeria de Imagens */}
          <div className="space-y-4">
            <div className="aspect-square w-full overflow-hidden rounded-2xl bg-gray-50 border border-gray-100 relative">
              <img
                src={product.images?.[0] || 'https://unsplash.com'}
                alt={product.name}
                className="h-full w-full object-cover object-center"
              />
              
              {isOutOfStock && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-xs">
                  <span className="rounded-md bg-white px-4 py-2 text-sm font-bold uppercase tracking-wider text-gray-900 shadow-md">
                    Temporariamente Esgotado
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* COLUNA DIREITA: Informações e Ações de Compra */}
          <div className="flex flex-col justify-between">
            <div>
              {/* Categoria e Avaliação */}
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center rounded-md bg-pink-50 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-red-700">
                  {product.category}
                </span>
                
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="text-sm font-bold text-gray-700">{product.rating.toFixed(1)}</span>
                  <span className="text-xs text-gray-400 font-medium">(Avaliações reais)</span>
                </div>
              </div>

              {/* Nome do Produto */}
              <h1 className="text-3xl font-black tracking-tight text-gray-900 sm:text-4xl">
                {product.name}
              </h1>

              {/* Preço */}
              <div className="mt-4">
                <p className="text-3xl font-black text-gray-950">
                  {formatCurrency(product.price)}
                </p>
                <p className="text-xs text-gray-400 mt-1">Ou em até 3x sem juros no Stripe Checkout</p>
              </div>

              {/* Descrição Detalhada */}
              <div className="mt-6 border-t border-gray-100 pt-6">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Sobre o Produto</h3>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                  {product.description}
                </p>
              </div>
            </div>

            {/* Container de Compra e Quantidade */}
            <div className="mt-10 pt-6 border-t border-gray-100 space-y-4">
              
              {!isOutOfStock && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-700">Quantidade</span>
                  
                  {/* Seletor de Quantidade Local */}
                  <div className="flex items-center rounded-xl border border-gray-200 bg-gray-50 p-1.5">
                    <button
                      type="button"
                      disabled={quantity <= 1}
                      onClick={handleDecrease}
                      className="p-1.5 text-gray-500 hover:text-gray-900 disabled:opacity-30 transition-colors"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="px-5 text-sm font-black text-gray-800">{quantity}</span>
                    <button
                      type="button"
                      disabled={quantity >= product.stock}
                      onClick={handleIncrease}
                      className="p-1.5 text-gray-500 hover:text-gray-900 disabled:opacity-30 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Mensagem sutil de estoque baixo */}
              {!isOutOfStock && product.stock <= 3 && (
                <p className="text-xs font-semibold text-amber-600 text-right animate-pulse">
                  Corra! Restam apenas {product.stock} unidades disponíveis.
                </p>
              )}

              {/* Botão de Adicionar à Sacola */}
              <button
                type="button"
                disabled={isOutOfStock}
                onClick={handleAddWithQuantity}
                className={`flex w-full items-center justify-center rounded-xl px-6 py-4 text-base font-bold text-white shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 ${
                  isOutOfStock
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                    : 'bg-linear-to-r from-red-600 to-amber-500 hover:from-red-700 hover:to-amber-600 shadow-pink-100 active:scale-99'
                }`}
              >
                <ShoppingBag className="mr-2 h-5 w-5" />
                {isOutOfStock ? 'Produto Esgotado' : 'Adicionar ao Carrinho'}
              </button>

              {/* Selo de Compra Segura */}
              <div className="flex items-center justify-center space-x-1.5 text-[11px] font-medium text-gray-400 pt-2">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <span>Transação 100% criptografada via Stripe.</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
