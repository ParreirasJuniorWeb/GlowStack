import { useNavigate } from "react-router-dom";
import makeUpProduct from "../../assets/stolnmny-makeup-1593099.jpg";
import { useProducts } from "../../hooks/useProducts";
import { useCart } from "../../hooks/useCart";
import {
  FaShoppingBag,
  FaStar,
  FaSpinner,
  FaSearch,
  FaEye,
} from "react-icons/fa";
import { useMemo, useState } from "react";
import { DollarSign, SlidersHorizontal } from "lucide-react";
// filter Context API
import { useFilters } from "../../contexts/FilterContext";

export const Home = () => {
  const { products, loading, error } = useProducts();
  const { cart, addProduct, formatCurrency } = useCart();

  // Tipagem das categorias para consistência com o schema
  type CategoryFilter = "todos" | "labios" | "pele" | "olhos" | "skincare";
  const { searchTerm, setSearchTerm, selectedCategory, setSelectedCategory } =
    useFilters();

  const navigate = useNavigate();

  // Mapeamento de nomes amigáveis para exibição nas pílulas de filtro
  const categories: { id: CategoryFilter; label: string }[] = [
    { id: "todos", label: "Todos os Produtos" },
    { id: "labios", label: "Lábios" },
    { id: "pele", label: "Pele" },
    { id: "olhos", label: "Olhos" },
    { id: "skincare", label: "Skincare" },
  ];

  // NOVO: Estado para o filtro de preço máximo (em centavos para alinhar com o banco)
  // Iniciamos com um valor alto padrão (R$ 200,00) que será ajustado dinamicamente
  const [maxPrice, setMaxPrice] = useState(20000);

  // Identifica dinamicamente o maior preço do catálogo para configurar o teto do slider
  const absoluteMaxPrice = useMemo(() => {
    if (products.length === 0) return 20000;
    return Math.max(...products.map((p) => p.price));
  }, [products]);

  // Lógica de filtragem combinada usando useMemo para máxima performance
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === "todos" || product.category === selectedCategory;

      // NOVO: Validação do preço limite
      const matchesPrice = product.price <= maxPrice;

      return matchesSearch && matchesCategory && matchesPrice;
    });
  }, [products, searchTerm, selectedCategory, maxPrice]);

  // 1. Estado de Carregamento (Loading)
  if (loading) {
    return (
      <div className="flex min-h-100 flex-col items-center justify-center space-y-4">
        <FaSpinner className="h-10 w-10 animate-spin text-red-600" />
        <p className="text-sm font-medium text-gray-500 animate-pulse">
          Carregando a coleção GlowStack...
        </p>
      </div>
    );
  }

  // 2. Estado de Erro
  if (error) {
    return (
      <div className="mx-auto max-w-md my-8 rounded-xl bg-red-50 p-6 text-center border border-red-200">
        <p className="text-sm font-semibold text-red-800">
          Ops! Algo deu errado.
        </p>
        <p className="mt-1 text-xs text-red-600">{error}</p>
      </div>
    );
  }

  // 3. Estado de Lista Vazia
  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-lg font-medium text-gray-500">
          Nenhum produto de maquiagem cadastrado no momento.
        </p>
      </div>
    );
  }

  return (
    <div>
      <main className="w-full max-w-7xl mx-auto mt-2">
        <h1 className="font-black text-3xl mb-4 mt-10 text-center">
          Produtos em Alta
        </h1>
        {/* Título da Seção */}
        <div className="border-b pt-1 w-full max-w-7xl border-gray-100 pb-6 mb-10 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
              Nossa Coleção Glam
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Produtos selecionados de alta performance para o seu dia a dia.
            </p>
          </div>
          <span className="self-start inline-flex items-center rounded-full bg-pink-50 px-3 py-1 text-xs font-semibold text-red-700 ring-1 ring-inset ring-pink-700/10">
            {filteredProducts.length} de {products.length} itens encontrados
          </span>
        </div>

        {/* BARRA DE CONTROLES: BUSCA E FILTROS */}
        <div className="mb-10 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            {/* Input de Busca Textual */}
            <div className="relative flex-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <FaSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar batom, base, paleta..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-3 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all focus:border-red-500 focus:bg-white focus:ring-1 focus:ring-red-500"
              />
            </div>

            {/* Indicador Visual Móvel de Filtros */}
            <div className="flex items-center space-x-2 md:hidden text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <SlidersHorizontal className="h-4 w-4" />
              <span>Categorias</span>
            </div>
          </div>

          {/* 2. NOVO: Slider de Preço Avançado */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center">
                <DollarSign className="h-3.5 w-3.5 mr-0.5 text-gray-400" />{" "}
                Preço Máximo
              </span>

              <div className="flex items-center space-x-2">
                {/* O botão de reset aparece dinamicamente se o preço for menor que o máximo absoluto */}
                {maxPrice < absoluteMaxPrice && (
                  <button
                    type="button"
                    onClick={() => setMaxPrice(absoluteMaxPrice)}
                    className="text-[10px] font-bold text-gray-400 hover:text-red-600 transition-colors uppercase bg-gray-100 hover:bg-pink-50 px-1.5 py-0.5 rounded-md"
                    title="Resetar para o preço máximo"
                  >
                    Resetar
                  </button>
                )}
                <span className="text-sm font-black text-red-600">
                  {formatCurrency(maxPrice)}
                </span>
              </div>

              <span className="text-sm font-black text-red-600">
                {formatCurrency(maxPrice)}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max={absoluteMaxPrice}
              step="500" // Avança de R$ 5,00 em R$ 5,00
              value={maxPrice > absoluteMaxPrice ? absoluteMaxPrice : maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-red-600 focus:outline-none"
            />
            <div className="flex justify-between text-[10px] text-gray-400 mt-1">
              <span>R$ 0,00</span>
              <span>Máx: {formatCurrency(absoluteMaxPrice)}</span>
            </div>
          </div>

          {/* Lista Horizontal de Categorias (Pílulas) */}
          <div className="flex flex-wrap gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((category) => {
              const isActive = selectedCategory === category.id;
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setSelectedCategory(category.id)}
                  className={`cursor-pointer rounded-full px-4 py-2 text-xs font-semibold tracking-wide transition-all border outline-none ${
                    isActive
                      ? "bg-linear-to-r from-red-600 to-amber-500 text-white border-transparent shadow-xs"
                      : "bg-white text-gray-600 border-gray-200 hover:border-red-300 hover:text-red-600"
                  }`}
                >
                  {category.label}
                </button>
              );
            })}
          </div>

          {/* CONTAINER DE RESULTADOS VAZIOS */}
          {filteredProducts.length === 0 && (
            <div className="text-center py-16 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
              <p className="text-base font-semibold text-gray-600">
                Nenhum produto corresponde aos filtros aplicados.
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Tente mudar os termos da busca ou selecione outra categoria.
              </p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("todos");
                }}
                className="mt-4 text-xs font-bold text-red-600 hover:underline"
              >
                Limpar Filtros
              </button>
            </div>
          )}
        </div>

        {/* GRID DE PRODUTOS FILTRADOS */}
        <div
          id="catalog-section"
          className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full h-full p-4 xl:gap-x-8"
        >
          {filteredProducts.map((product) => {
            const isOutOfStock = product.stock <= 0;

            // 1. Descobre se esse produto específico já está no carrinho e qual a quantidade dele
            const itemInCart = cart.find(
              (item) => item.productId === product.id,
            );
            const quantityInCart = itemInCart ? itemInCart.quantity : 0;

            // 2. O produto atinge o teto se o estoque real for zero OU se a quantidade na sacola igualar o estoque
            const isStockLimitReached =
              product.stock <= 0 || quantityInCart >= product.stock;

            return (
              <section
                key={product.id}
                className="y-between overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all duration-300 hover:shadow-md hover:border-red-100 flex flex-col items-center justify-center gap-2"
              >
                {/* Imagem do Produto */}
                <div className="aspect-square w-full overflow-hidden rounded-xl bg-gray-50 group-hover:opacity-90 relative">
                  <img
                    src={
                      product.images[0] ||
                      makeUpProduct ||
                      "https://sdcdn.io/mac/br/mac_sku_M0N904_1x1_0.png?width=1080&height=1080"
                    } // Fallback se não houver imagem
                    alt={product.name}
                    className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* Badge de Esgotado */}
                  {isOutOfStock && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-xs">
                      <span className="rounded-md bg-white px-3 py-1 text-xs font-bold uppercase tracking-wider text-gray-900 shadow-sm">
                        Esgotado
                      </span>
                    </div>
                  )}

                  {/* Categoria Badge */}
                  {!isOutOfStock && (
                    <span className="absolute top-2 left-2 rounded-md bg-white/80 backdrop-blur-xs px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-600 shadow-2xs">
                      {product.category}
                    </span>
                  )}
                </div>

                {/* Informações do Produto */}
                <div className="mt-4 flex flex-col flex-1">
                  <div className="flex items-center justify-between mb-1">
                    {/* Avaliação (Rating) */}
                    <div className="flex items-center space-x-1">
                      <FaStar className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <span className="text-xs font-semibold text-gray-600">
                        {product.rating.toFixed(1)}
                      </span>
                    </div>
                    {/* Info Estoque Crítico */}
                    {!isOutOfStock && product.stock <= 3 && (
                      <span className="text-[10px] font-medium text-amber-600 animate-pulse">
                        Apenas {product.stock} restantes!
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-gray-800 line-clamp-1 group-hover:text-red-600 transition-colors">
                    {product.name}
                  </h3>

                  <p className="mt-1 text-xs text-gray-500 line-clamp-2 min-h-8">
                    {product.description.substring(0, 100)}
                  </p>

                  <div className="mt-4 flex items-center justify-between pt-3 border-t border-gray-50">
                    {/* Preço */}
                    <span className="font-black text-gray-900 text-3xl">
                      {formatCurrency(product.price)}
                    </span>

                    {/* Botão de Visualizar produto */}
                    <button
                      type="button"
                      disabled={isOutOfStock}
                      onClick={() => navigate(`/product/${product.id}`)}
                      className={`cursor-pointer flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${
                        isOutOfStock
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-linear-to-r from-red-600 to-red-500 text-white shadow-xs hover:from-red-700 hover:to-red-600 active:scale-95"
                      }`}
                      title={
                        isOutOfStock ? "Produto indisponível" : "Ver detalhes"
                      }
                    >
                      <FaEye className="h-4 w-4" />
                    </button>

                    {/* Botão de Adicionar ao Carrinho */}
                    <button
                      type="button"
                      disabled={isOutOfStock || isStockLimitReached}
                      onClick={() => addProduct(product)}
                      className={`cursor-pointer flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${
                        isOutOfStock || isStockLimitReached
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-linear-to-r from-red-600 to-red-500 text-white shadow-xs hover:from-red-700 hover:to-red-600 active:scale-95"
                      }`}
                      title={
                        isOutOfStock
                          ? 'Produto indisponível'
                          : product.stock <= 0
                          ? 'Produto esgotado'
                          : isStockLimitReached
                          ? 'Limite máximo atingido no carrinho'
                          : 'Adicionar ao Carrinho'
                      }
                    >
                      <FaShoppingBag className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      </main>
    </div>
  );
};
