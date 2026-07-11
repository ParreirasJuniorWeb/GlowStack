import { type ReactNode } from "react";
import { useAuth } from "../hooks/useAuth"
import { Navigate } from "react-router-dom";

interface PrivateProps {
  children: ReactNode;
}

export const PrivateRoutes = ({ children }: PrivateProps): any => {

  const { currentUser, isLoggedIn, loading } = useAuth()

  if(loading && currentUser instanceof Object) {
    return <p>Autenticando usuário no sistema...</p>
  }

  if(!isLoggedIn && currentUser instanceof Object) return <Navigate to="/login" />

  return children;
};