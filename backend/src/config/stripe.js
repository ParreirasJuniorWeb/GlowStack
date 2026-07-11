import 'dotenv/config'; // Força o carregamento das variáveis
import Stripe from 'stripe';

const apiKey = process.env.STRIPE_SECRET_KEY;

if (!apiKey) {
  console.error("❌ ERRO CRÍTICO: A variável STRIPE_SECRET_KEY não foi encontrada no arquivo .env");
}

// Exporta uma instância única e segura para todo o sistema
export const stripe = new Stripe(apiKey || '');
