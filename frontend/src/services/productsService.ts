import { collection, doc, getDoc, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from './firebaseConnection';
import type { Product } from '../types/glowstack.ts';

const productsRef = collection(db, 'products');

// Buscar todos os produtos de maquiagem
export const findAllProducts = async (): Promise<Product[]> => {
  try {
    const q = query(productsRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Product[];
  } catch (error) {
    console.error("Erro ao buscar produtos:", error);
    throw new Error('Não foi possível carregar os produtos de maquiagem.');
  }
};

// Buscar um produto específico pelo ID
export const findProductById = async (productId: string): Promise<Product> => {
  try {
    const docRef = doc(db, 'products', productId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) throw new Error('Produto não encontrado.');
    
    return { id: docSnap.id, ...docSnap.data() } as Product;
  } catch (error) {
    throw error instanceof Error ? error : new Error('Erro ao carregar o produto.');
  }
};
