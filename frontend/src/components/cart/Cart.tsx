import React from "react";
import { Link } from "react-router-dom";
import { useCart } from "../../hooks/useCart";
import { useCheckout } from "../../hooks/useCheckout";
import { FiX, FiPlus, FiMinus, FiTrash2, FiShoppingBag } from "react-icons/fi";
import { useProducts } from "../../hooks/useProducts";
import { CreditCard, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const {
    cart,
    changeQuantity,
    removeProduct,
    formatCurrency,
    totalItems,
    handleApplyCoupon,
    subtotalAmount,
    discountAmount,
    totalFinalAmount,
    appliedCoupon,
    handleRemoveCoupon,
  } = useCart();
  const { products } = useProducts();
  const { initiateCheckout, loadingCheckout, checkoutError } = useCheckout();

  // Função fictícia para simular o produto hidratado (em um cenário real, você cruzaria o productId com a lista de produtos)
  // Como exemplo direto, assumiremos que temos acesso aos metadados ou usamos os dados simplificados do produto.
  // Para fins didáticos de layout, calcularemos o subtotal aproximado com um preço estático de exemplo ou vindo do próprio estado se estruturado.
  const subtotal = cart.reduce((acc, item) => acc + 5990 * item.quantity, 0); // Exemplo: considerando preço médio de R$ 59,90 (5990 centavos)

  return (
    <div
      className={`fixed inset-0 z-50 overflow-hidden ${isOpen ? "pointer-events-auto" : "pointer-events-none"}`}
    >
      {/* 1. BACKDROP (Fundo Escurecido com Blur) */}
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* 2. GAVETA DESLIZANTE */}
      <div className="absolute inset-y-0 right-0 flex max-w-full pl-10">
        <div
          className={`w-screen max-w-md transform bg-white shadow-2xl transition-transform duration-300 ease-in-out flex flex-col h-full ${
            isOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* TOPO DA GAVETA */}
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-6 sm:px-6">
            <div className="flex items-center space-x-2">
              <FiShoppingBag className="h-5 w-5 text-red-600" />
              <h2 className="text-lg font-bold text-gray-900">Meu StoreCar</h2>
              <span className="rounded-full bg-pink-50 px-2.5 py-0.5 text-xs font-semibold text-red-700">
                {totalItems} {totalItems === 1 ? "item" : "itens"}
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500 transition-colors"
            >
              <FiX className="h-6 w-6" />
            </button>
          </div>

          {/* CORPO / LISTA DE PRODUTOS */}
          <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
            {cart.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center space-y-4">
                <div className="rounded-full bg-gray-50 p-4 text-gray-400">
                  <FiShoppingBag className="h-10 w-10" />
                </div>
                <div>
                  <p className="text-base font-semibold text-gray-900">
                    Seu carrinho está vazio
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Adicione maquiagens para começar a brilhar.
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="text-sm font-semibold text-red-600 hover:text-red-500 mt-2"
                >
                  <Link to="/">Continuar navegando ➔</Link>
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {cart.map((item) => {
                  const imageItem = products.find(
                    (product) => product.id === item.productId,
                  );
                  const imageSrc =
                    typeof imageItem?.images === "string"
                      ? imageItem.images
                      : Array.isArray(imageItem?.images)
                        ? (imageItem.images[0] ?? "")
                        : "";

                  return (
                    <div
                      key={item.productId}
                      className="flex py-4 border-b border-gray-50 last:border-0 group"
                    >
                      {/* Imagem do Produto (Placeholder Ilustrativo) */}
                      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
                        <img
                          src={imageSrc}
                          alt="Maquiagem"
                          className="h-full w-full object-cover object-center"
                        />
                      </div>

                      {/* Detalhes do Produto */}
                      <div className="ml-4 flex flex-1 flex-col justify-between">
                        <div>
                          <div className="flex justify-between text-sm font-bold text-gray-900">
                            <h3 className="line-clamp-1 group-hover:text-red-600 transition-colors">
                              Item da Coleção Glam{" "}
                              {/* Nome real viria do estado hidratado */}
                            </h3>
                            <p className="ml-4 text-gray-900">
                              {formatCurrency(5990 * item.quantity)}
                            </p>
                          </div>
                          <p className="mt-1 text-xs text-gray-400">
                            Preço unitário: {formatCurrency(5990)}
                          </p>
                        </div>

                        {/* Controles de Quantidade e Exclusão */}
                        <div className="flex items-center justify-between text-sm pt-2">
                          <div className="flex items-center rounded-lg border border-gray-200 bg-gray-50 p-1">
                            <button
                              type="button"
                              onClick={() =>
                                changeQuantity(
                                  item.productId,
                                  item.quantity - 1,
                                )
                              }
                              className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                            >
                              <FiMinus className="h-3 w-3" />
                            </button>
                            <span className="px-3 text-xs font-bold text-gray-800">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                changeQuantity(
                                  item.productId,
                                  item.quantity + 1,
                                )
                              }
                              className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                            >
                              <FiPlus className="h-3 w-3" />
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeProduct(item.productId)}
                            className="flex items-center text-xs font-medium text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <FiTrash2 className="h-4 w-4 mr-1" />
                            Remover
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          {cart.length > 0 && (
            <div className="border-t border-gray-100 bg-gray-50 px-4 py-6 sm:px-6 space-y-4">
              {/* 🎫 INPUT DO CUPOM DE DESCONTO */}
              <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-2xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-2">
                  Cupom de Desconto
                </span>

                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-pink-50 border border-pink-100 px-3 py-2 rounded-xl animate-fade-in">
                    <div className="text-xs font-semibold text-red-700">
                      🏷️{" "}
                      <span className="font-black uppercase">
                        {appliedCoupon.code}
                      </span>{" "}
                      Ativado!
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="text-xs font-bold text-gray-400 hover:text-red-500 uppercase"
                    >
                      Remover
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      id="couponInput"
                      placeholder="Ex: GLOW15"
                      className="flex-1 rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-1.5 text-xs uppercase font-bold tracking-wider outline-none focus:border-red-500 focus:bg-white"
                      onKeyDown={async (e) => {
                        if (e.key === "Enter") {
                          const target = e.target as HTMLInputElement;
                          try {
                            await handleApplyCoupon(target.value);
                            target.value = "";
                          } catch (err: any) {
                            toast.error(err.message);
                          }
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={async () => {
                        const input = document.getElementById(
                          "couponInput",
                        ) as HTMLInputElement;
                        try {
                          await handleApplyCoupon(input.value);
                          input.value = "";
                        } catch (err: any) {
                          toast.error(err.message);
                        }
                      }}
                      className="rounded-xl bg-gray-900 px-4 py-1.5 text-xs font-bold text-white hover:bg-gray-800"
                    >
                      Aplicar
                    </button>
                  </div>
                )}
              </div>

              {/* Resumo Financeiro */}
              <div className="space-y-1.5 text-xs font-medium text-gray-500">
                <div className="flex justify-between">
                  <p>Subtotal</p>
                  <p className="text-gray-900 font-semibold">
                    {formatCurrency(subtotalAmount)}
                  </p>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-red-600 font-semibold animate-fade-in">
                    <p>
                      Desconto{" "}
                      {appliedCoupon?.discountType === "percentage"
                        ? `(${appliedCoupon.value}%)`
                        : ""}
                    </p>
                    <p>- {formatCurrency(discountAmount)}</p>
                  </div>
                )}

                <div className="flex justify-between text-base font-black text-gray-900 pt-2 border-t border-gray-200">
                  <p>Total Final</p>
                  <p className="text-transparent bg-clip-text bg-linear-to-r from-red-600 to-amber-500">
                    {formatCurrency(totalFinalAmount) || formatCurrency(subtotal)}
                  </p>
                </div>
              </div>

              {checkoutError && (
                <div className="rounded-lg bg-red-50 p-3 text-xs text-red-700 border-l-4 border-red-500 font-medium">
                  {checkoutError}
                </div>
              )}

              <button
                type="button"
                disabled={loadingCheckout}
                onClick={initiateCheckout}
                className="flex w-full items-center justify-center rounded-xl bg-linear-to-r from-red-600 to-amber-500 px-6 py-3.5 text-base font-semibold text-white shadow-lg hover:from-red-700 hover:to-amber-600 disabled:opacity-50 transition-all"
              >
                {loadingCheckout ? (
                  <>
                    {" "}
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />{" "}
                    Processando...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-5 w-5" /> Ir para o Pagamento
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
