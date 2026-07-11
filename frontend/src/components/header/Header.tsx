import React, { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useCart } from "../../hooks/useCart";
import { useFilters } from "../../contexts/FilterContext";
import { FiShoppingBag, FiUser, FiLogOut, FiStar, FiMenu, FiX } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";

interface HeaderProps {
  onCartClick?: () => void; // Para abrir o carrinho deslizante futuramente
  onAuthClick?: () => void; // Para abrir a tela de login
}

export const Header: React.FC<HeaderProps> = ({ onCartClick, onAuthClick }) => {
  const { isLoggedIn, currentUser, logout } = useAuth();
  const { totalItems } = useCart();
  const [showLabel, setShowLabel] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { selectedCategory, setSelectedCategory } = useFilters();

  const handleCategoryClick = (
    e: React.MouseEvent,
    category: "todos" | "labios" | "pele" | "olhos" | "skincare",
  ) => {
    e.preventDefault();
    setSelectedCategory(category); // Altera o filtro global instantaneamente

    // Rola a tela de forma suave até a seção de produtos
    const element = document.getElementById("catalog-section");
    if (element) element.scrollIntoView({ behavior: "smooth" });
  };

  const navigate = useNavigate();

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  useEffect(() => {
    if (showLabel) {
      setTimeout(() => setShowLabel(false), 3000);
    }
  }, [showLabel]);

  // Pega o primeiro nome do usuário para não quebrar o layout se for muito longo
  const firstName = currentUser?.name ? currentUser.name.split(" ")[0] : "";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
        {/* 1. BRANDING / LOGO */}
        <Link to="/" onClick={closeMobileMenu}>
          <div className="flex items-center space-x-2 cursor-pointer group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-tr from-red-600 to-amber-500 text-white shadow-sm shadow-red-200">
              <FiStar className="h-5 w-5 transition-transform group-hover:rotate-12" />
            </div>
            <span className="text-xl font-black tracking-tight text-gray-900">
              Glow
              <span className="text-transparent bg-clip-text bg-linear-to-r from-red-600 to-amber-500">
                Stack
              </span>
            </span>
          </div>
        </Link>

        {/* MOBILE: MENU BUTTON */}
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-100 bg-white text-gray-600 transition-all duration-200 hover:border-pink-200 hover:text-red-600 md:hidden"
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          aria-label={isMobileMenuOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-nav"
        >
          {isMobileMenuOpen ? <FiX className="h-5 w-5" /> : <FiMenu className="h-5 w-5" />}
        </button>

        {/* ⚡ MENU CENTRAL CONECTADO AOS FILTROS (DESKTOP) */}
        <nav className="hidden items-center space-x-8 text-sm font-medium text-gray-500 md:flex">
          <a
            href="#todos"
            onClick={(e) => {
              (handleCategoryClick(e, "todos"), navigate("/"));
            }}
            className={`transition-colors ${selectedCategory === "todos" ? "text-red-600 font-bold" : "hover:text-red-600"}`}
          >
            Todos
          </a>
          <a
            href="#pele"
            onClick={(e) => {
              (handleCategoryClick(e, "pele"), navigate("/"));
            }}
            className={`transition-colors ${selectedCategory === "pele" ? "text-red-600 font-bold" : "hover:text-red-600"}`}
          >
            Pele
          </a>
          <a
            href="#labios"
            onClick={(e) => {
              (handleCategoryClick(e, "labios"), navigate("/"));
            }}
            className={`transition-colors ${selectedCategory === "labios" ? "text-red-600 font-bold" : "hover:text-red-600"}`}
          >
            Lábios
          </a>
          <a
            href="#olhos"
            onClick={(e) => {
              (handleCategoryClick(e, "olhos"), navigate("/"));
            }}
            className={`transition-colors ${selectedCategory === "olhos" ? "text-red-600 font-bold" : "hover:text-red-600"}`}
          >
            Olhos
          </a>
          <a
            href="#skincare"
            onClick={(e) => {
              (handleCategoryClick(e, "skincare"), navigate("/"));
            }}
            className={`transition-colors ${selectedCategory === "skincare" ? "text-red-600 font-bold" : "hover:text-red-600"}`}
          >
            Skincare
          </a>
          <Link to="/orders">Meus Pedidos</Link>
        </nav>

        {/* 3. AÇÕES DA SESSÃO E CARRINHO (DESKTOP) */}
        <div className="hidden items-center space-x-4 md:flex">
          {/* PERFIL / LOGIN */}
          {isLoggedIn ? (
            <div className="flex items-center space-x-3 rounded-full bg-gray-50 pl-3 pr-2 py-1 border border-gray-100">
              <span className="text-xs font-semibold text-gray-600">
                Olá,{" "}
                <span className="text-gray-900 font-bold">{firstName}</span>
              </span>
              <button
                onClick={logout}
                type="button"
                className="cursor-pointer rounded-full p-1.5 text-gray-400 hover:bg-gray-200 hover:text-red-500 transition-all duration-150"
                title="Sair da conta"
              >
                <FiLogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onAuthClick}
              type="button"
              className="flex items-center cursor-pointer space-x-1.5 text-sm font-medium text-gray-600 hover:text-red-600 transition-colors"
            >
              <FiUser className="h-4 w-4" />
              <span className="hidden sm:inline">Entrar</span>
            </button>
          )}

          {/* Divisor Visual */}
          <span className="h-4 w-px bg-gray-200" aria-hidden="true" />

          {/* ÍCONE FLUTUANTE DO CARRINHO */}
          <button
            onClick={onCartClick}
            type="button"
            className="cursor-pointer group relative flex h-10 w-10 items-center justify-center rounded-xl border border-gray-100 bg-white text-gray-600 shadow-2xs transition-all duration-200 hover:border-pink-200 hover:text-red-600 hover:shadow-xs active:scale-95"
            title="Abrir StoreCar"
          >
            <FiShoppingBag className="h-5 w-5 transition-transform group-hover:-translate-y-0.5" />

            {/* Contador Dinâmico */}
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-linear-to-r from-red-600 to-amber-500 px-1 text-[10px] font-black text-white ring-2 ring-white animate-fade-in">
                {totalItems}
              </span>
            )}
          </button>

          {/* ÍCONE FLUTUANTE DO ACESSO ADMIISTRATIVO */}
          {isLoggedIn && (
            <button
              onClick={() => navigate("/admin")}
              onMouseOver={() => setShowLabel(true)}
              type="button"
              className="cursor-pointer group relative flex h-10 w-10 items-center justify-center rounded-xl border border-gray-100 bg-white text-gray-600 shadow-2xs transition-all duration-200 hover:border-pink-200 hover:text-red-600 hover:shadow-xs active:scale-95"
              title="Abrir StoreCar"
            >
              <FiUser className="h-5 w-5 transition-transform group-hover:-translate-y-0.5" />

              {/* Legenda Acesso Administrativo */}
              {showLabel && (
                <span className="absolute -top-0.5 -right-37 flex h-5 min-w-5 items-center justify-center rounded-full bg-linear-to-r from-red-600 to-amber-500 p-4 text-[10px] font-black text-white ring-2 ring-white animate-fade-in">
                  Acesso Administrativo
                </span>
              )}
            </button>
          )}
        </div>
        </div>

        {isMobileMenuOpen && (
          <nav
            id="mobile-nav"
            className="border-t border-gray-100 py-3 md:hidden"
          >
            <div className="flex flex-col space-y-1 text-sm font-medium text-gray-600">
              <a
                href="#todos"
                onClick={(e) => {
                  handleCategoryClick(e, "todos");
                  navigate("/");
                  closeMobileMenu();
                }}
                className={`rounded-md px-3 py-2 transition-colors duration-200 ${selectedCategory === "todos" ? "bg-red-50 font-bold text-red-600" : "hover:bg-gray-50 hover:text-red-600"}`}
              >
                Todos
              </a>
              <a
                href="#pele"
                onClick={(e) => {
                  handleCategoryClick(e, "pele");
                  navigate("/");
                  closeMobileMenu();
                }}
                className={`rounded-md px-3 py-2 transition-colors duration-200 ${selectedCategory === "pele" ? "bg-red-50 font-bold text-red-600" : "hover:bg-gray-50 hover:text-red-600"}`}
              >
                Pele
              </a>
              <a
                href="#labios"
                onClick={(e) => {
                  handleCategoryClick(e, "labios");
                  navigate("/");
                  closeMobileMenu();
                }}
                className={`rounded-md px-3 py-2 transition-colors duration-200 ${selectedCategory === "labios" ? "bg-red-50 font-bold text-red-600" : "hover:bg-gray-50 hover:text-red-600"}`}
              >
                Lábios
              </a>
              <a
                href="#olhos"
                onClick={(e) => {
                  handleCategoryClick(e, "olhos");
                  navigate("/");
                  closeMobileMenu();
                }}
                className={`rounded-md px-3 py-2 transition-colors duration-200 ${selectedCategory === "olhos" ? "bg-red-50 font-bold text-red-600" : "hover:bg-gray-50 hover:text-red-600"}`}
              >
                Olhos
              </a>
              <a
                href="#skincare"
                onClick={(e) => {
                  handleCategoryClick(e, "skincare");
                  navigate("/");
                  closeMobileMenu();
                }}
                className={`rounded-md px-3 py-2 transition-colors duration-200 ${selectedCategory === "skincare" ? "bg-red-50 font-bold text-red-600" : "hover:bg-gray-50 hover:text-red-600"}`}
              >
                Skincare
              </a>

              <Link
                to="/orders"
                onClick={closeMobileMenu}
                className="rounded-md px-3 py-2 transition-colors duration-200 hover:bg-gray-50 hover:text-red-600"
              >
                Meus Pedidos
              </Link>

              <div className="mt-2 flex items-center gap-3 px-3 py-2">
                {isLoggedIn ? (
                  <>
                    <button
                      onClick={() => {
                        navigate("/admin");
                        closeMobileMenu();
                      }}
                      type="button"
                      className="inline-flex items-center gap-2 rounded-md border border-gray-100 px-3 py-2 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50 hover:text-red-600"
                    >
                      <FiUser className="h-4 w-4" />
                      Admin
                    </button>
                    <button
                      onClick={() => {
                        logout();
                        closeMobileMenu();
                      }}
                      type="button"
                      className="inline-flex items-center gap-2 rounded-md border border-gray-100 px-3 py-2 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50 hover:text-red-600"
                    >
                      <FiLogOut className="h-4 w-4" />
                      Sair
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      onAuthClick?.();
                      closeMobileMenu();
                    }}
                    type="button"
                    className="inline-flex items-center gap-2 rounded-md border border-gray-100 px-3 py-2 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50 hover:text-red-600"
                  >
                    <FiUser className="h-4 w-4" />
                    Entrar
                  </button>
                )}

                <button
                  onClick={() => {
                    onCartClick?.();
                    closeMobileMenu();
                  }}
                  type="button"
                  className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-100 bg-white text-gray-600 transition-all duration-200 hover:border-pink-200 hover:text-red-600"
                  title="Abrir StoreCar"
                >
                  <FiShoppingBag className="h-5 w-5" />
                  {totalItems > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-linear-to-r from-red-600 to-amber-500 px-1 text-[10px] font-black text-white ring-2 ring-white">
                      {totalItems}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};
