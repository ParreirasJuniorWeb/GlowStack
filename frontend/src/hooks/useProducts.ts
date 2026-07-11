import { useState, useEffect, useCallback } from 'react';
import { findAllProducts } from '../services/productsService';
import type { Product } from '../types/glowstack.ts';

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await findAllProducts();
      setProducts(data);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ocorreu um erro inesperado.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Carrega os produtos assim que o componente que usa o hook for montado
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  return { products, loading, error, refresh: loadProducts };
};
