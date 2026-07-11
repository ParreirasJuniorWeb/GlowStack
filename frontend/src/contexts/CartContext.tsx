import React, { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { CartItem, Product, Coupon } from "../types/glowstack.ts";
import { db } from "../services/firebaseConnection.ts"
import {
  updateFirebaseCart,
  fetchFirebaseCart,
} from "../services/cartService.ts";
import { AuthContext } from "./AuthContext"; // Importando o novo contexto de autenticação
import { validateCouponCode } from "../services/couponService.ts";
import toast from "react-hot-toast";
import { doc, getDoc } from "firebase/firestore";

interface CartContextData {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  loadingCart: boolean;
  coupon: Coupon | null;
  applyCoupon: (code: string) => Promise<void>;
  removeCoupon: () => void;
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
  const [coupon, setCoupon] = useState<Coupon | null>(null);

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
      const currentQuantityInCart = updatedItems[existingItemIndex].quantity;
      const newTotalQuantity = currentQuantityInCart + quantity;

      // 🚨 TRAVA CRÍTICA: Se a quantidade que o usuário quer colocar no carrinho
      // somada com o que ele JÁ TEM lá dentro estourar o estoque do produto, barramos o clique.
      if (newTotalQuantity > product.stock) {
        toast.error(
          `Desculpe! Você já atingiu o teto máximo de estoque para este produto. Limite disponível: ${product.stock} unidades.`,
        );
        return; // Encerra a função sem salvar no banco de dados ou alterar o estado
      }

      updatedItems[existingItemIndex].quantity += newTotalQuantity;
    } else {
      // Se o item não estava no carrinho, valida apenas se a quantidade inicial pedida cabe no estoque
      if (quantity > product.stock) {
        toast.error(
          `Quantidade indisponível. Restam apenas ${product.stock} unidades em nosso estoque.`,
        );
        return;
      }

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
  // Dentro do seu CartProvider no arquivo src/contexts/CartContext.tsx

  const updateQuantity = async (productId: string, quantity: number) => {
    // 1. Se a nova quantidade for menor ou igual a zero, remove o item do carrinho
    if (quantity <= 0) {
      const updatedItems = cartItems.filter(
        (item) => item.productId !== productId,
      );
      await saveCart(updatedItems);
      return;
    }

    try {
      // 2. Precisamos descobrir qual é o teto de estoque real deste produto.
      // Buscamos o produto na lista global de produtos da loja.
      // (Caso seu contexto não tenha a lista de produtos, você pode importar o service 'findProductById')
      const productRef = doc(db, "products", productId);
      const productSnap = await getDoc(productRef);

      if (!productSnap.exists()) {
        toast.error("Produto não encontrado no catálogo da GlowStack.");
        return;
      }

      const productData = productSnap.data();
      const stockLimit = productData.stock || 0;

      // 🚨 TRAVA DE SEGURANÇA: Se o usuário tentar clicar no botão "+" na gaveta
      // e a nova quantidade pretendida estourar o estoque físico do banco, barramos a ação.
      if (quantity > stockLimit) {
        toast.error(
          `Desculpe! Não é possível adicionar mais unidades. Restam apenas ${stockLimit} itens deste produto em nosso estoque.`,
        );
        return; // Encerra a execução e bloqueia a alteração no carrinho
      }

      // 3. Se passou na validação, atualiza a quantidade de forma segura
      const updatedItems = cartItems.map((item) =>
        item.productId === productId ? { ...item, quantity } : item,
      );

      await saveCart(updatedItems);
    } catch (error) {
      console.error(
        "Erro ao validar estoque na alteração de quantidade:",
        error,
      );
      toast.error("Ocorreu um erro ao verificar a disponibilidade do estoque.");
    }
  };

  // Limpar o carrinho de compras
  const clearCart = async () => {
    await saveCart([]);
  };

  const applyCoupon = async (code: string) => {
    try {
      const validCoupon = await validateCouponCode(code);
      setCoupon(validCoupon);
    } catch (error) {
      setCoupon(null);
      throw error;
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
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
        coupon,
        applyCoupon,
        removeCoupon,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
