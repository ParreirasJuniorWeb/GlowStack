import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { RouterProvider } from "react-router-dom";
import { router } from "./App";
import { Toaster } from "react-hot-toast";
// AuthProvider
import { AuthProvider } from "./contexts/AuthContext";
// CartProvider
import { CartProvider } from "./contexts/CartContext.tsx";
// ErrorBoundary
import { ErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "./components/common/error/ErrorFallback.tsx";
// import FilterProvider
import { FilterProvider } from "./contexts/FilterContext.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <Toaster />
      <CartProvider>
        {/* Envolve a área de conteúdo crítico com o Error Boundary */}
        <ErrorBoundary
          FallbackComponent={ErrorFallback}
          onReset={() => {
            // Executado quando o usuário clica em "Tentar Novamente"
            window.location.reload();
          }}
        >
          <FilterProvider>
            <RouterProvider router={router} />
          </FilterProvider>
        </ErrorBoundary>
      </CartProvider>
    </AuthProvider>
  </StrictMode>,
);
