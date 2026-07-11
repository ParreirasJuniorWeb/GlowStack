import React from "react";
import { useAuth } from "../../hooks/useAuth";
import { useCart } from "../../hooks/useCart";
import { FiShoppingBag, FiUser, FiLogOut, FiStar } from "react-icons/fi";
import { Link } from "react-router-dom";

interface HeaderProps {
  onCartClick?: () => void; // Para abrir o carrinho deslizante futuramente
  onAuthClick?: () => void; // Para abrir a tela de login
}

export const Header: React.FC<HeaderProps> = ({ onCartClick, onAuthClick }) => {
  const { isLoggedIn, currentUser, logout } = useAuth();
  const { totalItems } = useCart();

  // Pega o primeiro nome do usuário para não quebrar o layout se for muito longo
  const firstName = currentUser?.name ? currentUser.name.split(" ")[0] : "";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* 1. BRANDING / LOGO */}
        <Link to="/">
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

        {/* 2. MENU CENTRAL (Opcional - Links de Categoria) */}
        <nav className="hidden md:flex space-x-8 text-sm font-medium text-gray-500">
          <a href="#pele" className="hover:text-red-600 transition-colors">
            Pele
          </a>
          <a href="#labios" className="hover:text-red-600 transition-colors">
            Lábios
          </a>
          <a href="#olhos" className="hover:text-red-600 transition-colors">
            Olhos
          </a>
          <a href="#skincare" className="hover:text-red-600 transition-colors">
            Skincare
          </a>
          <Link to="/orders">My Orders</Link>
        </nav>

        {/* 3. AÇÕES DA SESSÃO E CARRINHO */}
        <div className="flex items-center space-x-4">
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
        </div>
      </div>
    </header>
  );
};
