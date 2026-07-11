import { describe, it, expect } from 'vitest';

// Simulação simplificada da função de validação de teto de estoque do seu CartContext
function canUpdateQuantity(quantityInCart: number, quantityToAdd: number, stockLimit: number): boolean {
  const newTotal = quantityInCart + quantityToAdd;
  return newTotal <= stockLimit;
}

describe('Regra de Negócio: Trava de Inventário da GlowStack', () => {
  it('deve autorizar a inserção se o estoque comportar a quantidade pedida', () => {
    const isAuthorized = canUpdateQuantity(1, 2, 5); // Tem 1 no carrinho, quer somar 2, teto é 5
    expect(isAuthorized).toBe(true);
  });

  it('deve bloquear a operação se a soma estourar o limite físico do estoque', () => {
    const isAuthorized = canUpdateQuantity(3, 3, 5); // Tem 3 no carrinho, quer somar 3, teto é 5 (Estoura!)
    expect(isAuthorized).toBe(false);
  });

  it('deve bloquear a operação imediatamente se o produto estiver esgotado (estoque zero)', () => {
    const isAuthorized = canUpdateQuantity(0, 1, 0); // Quer colocar 1, teto é 0
    expect(isAuthorized).toBe(false);
  });
});
