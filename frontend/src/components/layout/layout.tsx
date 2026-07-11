import { Outlet, useNavigate } from "react-router-dom";
import { Header } from "../header/Header";
import { useState } from "react";
import { CartDrawer } from "../cart/Cart";

export const Layout = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const navigateTo = useNavigate()
  return (
    <>
      <Header
        onCartClick={() => setIsCartOpen(true)}
        onAuthClick={() => navigateTo("/login")}
      />
      <Outlet />

      {/* Gaveta do Carrinho controlada pelo estado local */}
      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
      />
    </>
  );
};
