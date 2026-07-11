import React, { createContext, useState, useEffect, useCallback } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { syncUserProfile, resetPassword, loginWithEmail, registerWithEmail } from "../services/AuthService";
import type { ReactNode } from "react";
import type { UserProfile } from "../types/glowstack.ts";

interface AuthContextData {
  signed: boolean;
  user: UserProfile | null;
  loadingAuth: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string, name: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextData>(
  {} as AuthContextData,
);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loadingAuth, setLoadingAuth] = useState<boolean>(true);
  const auth = getAuth();

  useEffect(() => {
    // Escuta em tempo real se o usuário está logado ou não
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const profile = await syncUserProfile(firebaseUser);
          setUser(profile);
        } catch (error) {
          console.error(
            "Erro ao sincronizar dados do perfil do usuário:",
            error,
          );
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoadingAuth(false);
    });

    return () => unsubscribe();
  }, [auth]);

  const resetUserPassword = useCallback(async (email: string) => {
    try {
      await resetPassword(email);
    } catch (error) {
      console.error(
        "Erro ao efetuar o reset de senha da conta do usuário:",
        error,
      );
    }
  }, []);

  const login = async (email: string, pass: string) => {
    await loginWithEmail(email, pass);
  };

  const register = async (email: string, pass: string, name: string) => {
    await registerWithEmail(email, pass, name);
  };

  return (
    <AuthContext.Provider
      value={{
        signed: !!user,
        user,
        loadingAuth,
        login,
        register,
        resetPassword: resetUserPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
