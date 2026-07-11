import { useContext, useCallback } from "react";
import { CartContext } from "../contexts/CartContext";
import type { Product } from "../types/glowstack.ts";
import toast from "react-hot-toast";

export const useCart = () => {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart deve ser utilizado dentro de um CartProvider`);
  }

  const { cartItems, addToCart, removeFromCart, updateQuantity, clearCart, coupon, applyCoupon, removeCoupon } = context;

  // Retorna a quantidade total de itens no carrinho (para exibir no ícone do header)
  const totalItemsCount = useCallback(() => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  }, [cartItems])

  // Formata valores em centavos para a moeda brasileira
  const formatCurrency = useCallback((valeuInCents: number) => {
    return (valeuInCents / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }, []);

  // Adicionar um produto ao carrinho

  const handleAddProduct = useCallback(async (product: Product, quantity: number = 1) => {
    if (product.stock <= 0) {
      toast.error("Produto temporariamente esgotado!");
      return;
    }
    await addToCart(product, quantity);
  }, [addToCart]);

  // Calcula o valor bruto das maquiagens no carrinho (Preço médio fictício de R$ 59,90 para fins ilustrativos)
  const getSubtotal = useCallback(() => {
    return cartItems.reduce((acc, item) => acc + (5990 * item.quantity), 0);
  }, [cartItems]);

  // Calcula quanto será deduzido baseado no tipo do cupom
  const getDiscountAmount = useCallback(() => {
    if (!coupon) return 0;
    const subtotal = getSubtotal();

    if (coupon.discountType === 'percentage') {
      return Math.round(subtotal * (coupon.value / 100));
    }

    // Se for desconto fixo, não pode dar mais desconto do que o valor total do carrinho
    return coupon.value > subtotal ? subtotal : coupon.value;
  }, [coupon, getSubtotal]);

  const getTotalFinal = useCallback(() => {
    return getSubtotal() - getDiscountAmount();
  }, [getSubtotal, getDiscountAmount]);

  return {
    cart: cartItems,
    addProduct: handleAddProduct,
    removeProduct: removeFromCart,
    changeQuantity: updateQuantity,
    emptyCart: clearCart,
    totalItems: totalItemsCount(),
    formatCurrency,
    appliedCoupon: coupon,
    handleApplyCoupon: applyCoupon,
    handleRemoveCoupon: removeCoupon,
    subtotalAmount: getSubtotal(),
    discountAmount: getDiscountAmount(),
    totalFinalAmount: getTotalFinal(),
  }
};
