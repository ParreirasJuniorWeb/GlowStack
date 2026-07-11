import { useContext, useCallback } from "react";
import { CartContext } from "../contexts/CartContext";
import type { Product } from "../types/glowstack.ts";

export const useCart = () => {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart deve ser utilizado dentro de um CartProvider`);
  }

  const { cartItems, addToCart, removeFromCart, updateQuantity, clearCart } = context;
  
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

  const handleAddProduct = useCallback(async (product: Product) => {
    if(product.stock <= 0) {
        alert("Produto temporariamente esgotado!");
        return;
    }
    await addToCart(product, 1);
  }, [addToCart]);

  return {
    cart: cartItems,
    addProduct: handleAddProduct,
    removeProduct: removeFromCart,
    changeQuantity: updateQuantity,
    emptyCart: clearCart,
    totalItems: totalItemsCount(),
    formatCurrency,
  }
};
