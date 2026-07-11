import type { Coupon } from "../types/glowstack.ts"

// Banco de dados em memória de cupons ativos na GlowStack
const ACTIVE_COUPONS: Coupon[] = [
  { code: 'GLOW15', discountType: 'percentage', value: 15 },    // 15% de desconto
  { code: 'MAKE30', discountType: 'percentage', value: 30 },    // 30% de desconto
  { code: 'BOASVINDAS20', discountType: 'fixed', value: 2000 }, // R$ 20,00 fixos de desconto
];

export const validateCouponCode = async (code: string): Promise<Coupon> => {
  // Simula uma pequena latência de rede
  await new Promise((resolve) => setTimeout(resolve, 300));
  
  const coupon = ACTIVE_COUPONS.find((c) => c.code === code.trim().toUpperCase());
  
  if (!coupon) {
    throw new Error('Cupom inválido ou expirado.');
  }
  
  return coupon;
};
