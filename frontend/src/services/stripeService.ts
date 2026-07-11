import type { CartItem } from '../types/glowstack.ts';
import "dotenv/config";

// Substitua pela URL real da sua Firebase Cloud Function ou API Backend
// Em src/services/stripeService.ts
// const STRIPE_API_URL = 'http://localhost:3001/create-checkout-session'; 
// Em desenvolcimento
const STRIPE_API_URL = import.meta.env.VITE_NODE_ENV === 'production' 
  ? 'https://glowstack.onrender.com/create-checkout-session' // 👈 URL futura do seu backend em produção
  // 👈 A URL gerada pelo seu Render
  : 'http://localhost:3001/create-checkout-session';

interface CheckoutResponse {
  url: string; // URL da sessão do Stripe Checkout gerada pelo backend
}

export const createStripeCheckoutSession = async (
  userId: string,
  cartItems: CartItem[],
  couponCode?: string,
): Promise<string> => {
  if (!userId) throw new Error('Você precisa estar logado para finalizar a compra.');
  if (cartItems.length === 0) throw new Error('Seu carrinho está vazio.');

  try {
    const response = await fetch(STRIPE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        items: cartItems, // O backend usará o productId e quantity para cruzar dados com o Firestore
        couponCode: couponCode ? couponCode : null // 👈 Envia o código caso exista
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Falha ao processar o checkout com o Stripe.');
    }

    const data: CheckoutResponse = await response.json();
    return data.url;
  } catch (error) {
    console.error('Erro no service de checkout Stripe:', error);
    throw error instanceof Error ? error : new Error('Erro ao conectar com o servidor de pagamento.');
  }
};
