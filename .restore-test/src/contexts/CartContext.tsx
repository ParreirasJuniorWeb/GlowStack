import React, { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { CartItem, Product } from "../types/glowstack.ts";
import {
  updateFirebaseCart,
  fetchFirebaseCart,
} from "../services/cartService.ts";
import { AuthContext } from './AuthContext'; // Importando o novo contexto de autenticação

interface CartContextData {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  loadingCart: boolean;
}

export const CartContext = createContext<CartContextData>(
  {} as CartContextData,
);

export const CartProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loadingCart, setLoadingCart] = useState<boolean>(false);
  const { user } = useContext(AuthContext); // Consumindo o usuário logado

   // Monitora o estado do usuário para carregar ou limpar o carrinho na nuvem
  useEffect(() => {
    const synchronize = async () => {
      if (user) {
        setLoadingCart(true);
        try {
          const remoteItems = await fetchFirebaseCart(user.uid);
          setCartItems(remoteItems);
        } catch (error) {
          console.error("Erro ao sincronizar carrinho inicial:", error);
        } finally {
          setLoadingCart(false);
        }
      } else {
        setCartItems([]); // Limpa o estado do carrinho se o usuário deslogar
      }
    };

    synchronize();
  }, [user]);

  // Função auxiliar para atualizar o estado local e o Firebase simultaneamente
  const saveCart = async (newItems: CartItem[]) => {
    setCartItems(newItems);
    if (user) {
      try {
        await updateFirebaseCart(user.uid, newItems);
      } catch (error) {
        console.log("Falha na sinronização do carrinho com o Firebase:", error);
      }
    }
  };

  // Carrega o carrinho quando o usuário faz login
  // const loadUserCart = async (userId: string) => {
  //   setUserId(userId);
  //   try {
  //     const fetchedCart = await fetchFirebaseCart(userId);
  //     setCartItems(fetchedCart);
  //   } catch (error) {
  //     console.log("Falha ao carregar o carrinho do Firebase:", error);
  //   }
  // };

  // Adiciona um item ao carrinho
  const addToCart = async (product: Product, quantity: number = 1) => {
    const existingItemIndex = cartItems.findIndex(
      (item) => item.productId === product.id,
    );
    let updatedItems = [...cartItems];

    if (existingItemIndex > -1) {
      updatedItems[existingItemIndex].quantity += quantity;
    } else {
      updatedItems.push({ productId: product.id, quantity });
    }

    await saveCart(updatedItems);
  };

  // Remover um item ao carrinho
  const removeFromCart = async (productId: string) => {
    const updatedItems = cartItems.filter(
      (item) => item.productId !== productId,
    );
    await saveCart(updatedItems);
  };

  // Atualização da quantidade de cada item no carrinho de compras
  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(productId);
      return;
    }
    const updatedItems = cartItems.map((item) =>
      item.productId === productId
        ? {
            ...item,
            quantity,
          }
        : item,
    );

    await saveCart(updatedItems);
  };

  // Limpar o carrinho de compras
  const clearCart = async () => {
    await saveCart([]);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        loadingCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
