import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from './firebaseConnection';
import type { Order } from '../types/glowstack.ts';

const ordersRef = collection(db, 'orders');

export const fetchUserOrders = async (userId: string): Promise<Order[]> => {
  if (!userId) throw new Error('Usuário não autenticado.');

  try {
    // Busca os pedidos filtrando por userId e ordenando pela data de criação
    const q = query(
      ordersRef, 
      where('userId', '==', userId), 
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Order[];
  } catch (error) {
    console.error("Erro ao buscar histórico de pedidos:", error);
    throw new Error('Não foi possível carregar seu histórico de pedidos.');
  }
};
