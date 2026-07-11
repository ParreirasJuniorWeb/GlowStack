import { useState, useEffect, useCallback } from 'react';
import { findProductById } from '../services/productsService';
import type { Product } from '../types/glowstack.ts';

export const useProductDetails = (productId: string | undefined) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadProduct = useCallback(async () => {
    if (!productId) {
      setError('ID do produto inválido.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await findProductById(productId);
      setProduct(data);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ocorreu um erro ao carregar os detalhes do produto.');
      }
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  return { product, loading, error, refreshProduct: loadProduct };
};
