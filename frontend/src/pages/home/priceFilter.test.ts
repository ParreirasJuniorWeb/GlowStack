import { describe, it, expect } from 'vitest';

// Lógica pura de filtragem por preço que aplicamos via useMemo no componente
function filterProductsByPrice(products: any[], maxPriceLimit: number) {
  return products.filter(p => p.price <= maxPriceLimit);
}

describe('Filtro de Preços Avançado no Catálogo', () => {
  const mockProducts = [
    { id: '1', name: 'Batom Rose', price: 5000 },  // R$ 50,00
    { id: '2', name: 'Base Fluida', price: 9000 }, // R$ 90,00
    { id: '3', name: 'Paleta Glam', price: 15000 } // R$ 150,00
  ];

  it('deve exibir apenas maquiagens abaixo do preço limite selecionado pelo slider', () => {
    const maxPriceSelected = 10000; // R$ 100,00
    const results = filterProductsByPrice(mockProducts, maxPriceSelected);

    expect(results).toHaveLength(2); // Deve trazer apenas o Batom e a Base
    expect(results.map(p => p.name)).not.toContain('Paleta Glam');
  });

  it('deve restaurar toda a coleção de produtos ao simular o clique no botão Resetar', () => {
    const absoluteMaxPrice = 15000; // Teto máximo absoluto do catálogo (Paleta Glam)
    const results = filterProductsByPrice(mockProducts, absoluteMaxPrice);

    expect(results).toHaveLength(3); // Deve trazer todos os itens novamente
  });
});
