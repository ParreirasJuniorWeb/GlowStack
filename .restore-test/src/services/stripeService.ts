import type { CartItem } from '../types/glowstack.ts';

// Substitua pela URL real da sua Firebase Cloud Function ou API Backend
const STRIPE_API_URL = 'https://localhost:3001';

interface CheckoutResponse {
  url: string; // URL da sessão do Stripe Checkout gerada pelo backend
}

export const createStripeCheckoutSession = async (
  userId: string,
  cartItems: CartItem[]
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
