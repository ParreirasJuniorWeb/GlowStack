import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from './firebaseConnection';
import type { CartItem, StoreCar } from '../types/glowstack.ts';

// Atualiza ou cria o carrinho do usuário no Firestore
export const updateFirebaseCart = async (userId: string, items: CartItem[]): Promise<void> => {
  if (!userId) return;
  
  try {
    const cartRef = doc(db, 'carts', userId);
    const cartData: StoreCar = {
      userId,
      items,
      updatedAt: Timestamp.now()
    };
    
    // setDoc com merge atualiza ou cria se não existir
    await setDoc(cartRef, cartData, { merge: true });
  } catch (error) {
    console.error("Erro ao sincronizar carrinho com Firebase:", error);
    throw new Error("Não foi possível salvar seu carrinho online.");
  }
};

// Recupera o carrinho do usuário ao fazer login
export const fetchFirebaseCart = async (userId: string): Promise<CartItem[]> => {
  if (!userId) return [];

  try {
    const cartRef = doc(db, 'carts', userId);
    const cartSnap = await getDoc(cartRef);

    if (cartSnap.exists()) {
      const data = cartSnap.data() as StoreCar;
      return data.items || [];
    }
    return [];
  } catch (error) {
    console.error("Erro ao buscar carrinho do Firebase:", error);
    throw new Error("Erro ao carregar seu carrinho salvo.");
  }
};
