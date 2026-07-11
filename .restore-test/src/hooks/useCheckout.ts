import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import { useCart } from './useCart';
import { createStripeCheckoutSession } from '../services/stripeService.ts';

export const useCheckout = () => {
  const { currentUser, isLoggedIn } = useAuth();
  const { cart } = useCart();
  
  const [loadingCheckout, setLoadingCheckout] = useState<boolean>(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const handleCheckout = useCallback(async () => {
    if (!isLoggedIn || !currentUser) {
      setCheckoutError('Por favor, faça login para finalizar sua compra.');
      return;
    }

    if (cart.length === 0) {
      setCheckoutError('Adicione pelo menos uma maquiagem ao carrinho antes de pagar.');
      return;
    }

    setLoadingCheckout(true);
    setCheckoutError(null);

    try {
      // 1. Solicita a URL da sessão do Stripe para o backend
      const checkoutUrl = await createStripeCheckoutSession(currentUser.uid, cart);
      
      // 2. Redireciona o usuário diretamente para a página do Stripe
      window.location.href = checkoutUrl;
    } catch (err) {
      if (err instanceof Error) {
        setCheckoutError(err.message);
      } else {
        setCheckoutError('Ocorreu um erro inesperado ao iniciar o pagamento.');
      }
    } finally {
      setLoadingCheckout(false);
    }
  }, [currentUser, isLoggedIn, cart]);

  return {
    initiateCheckout: handleCheckout,
    loadingCheckout,
    checkoutError,
  };
};
