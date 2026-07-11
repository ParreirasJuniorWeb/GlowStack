import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { getAuth, signOut } from 'firebase/auth';

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  }

  const handleLogout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Erro ao efetuar logout:", error);
    }
  };

  return {
    isLoggedIn: context.signed,
    currentUser: context.user,
    loading: context.loadingAuth,
    login: context.login,
    register: context.register,
    logout: handleLogout,
    resetPassword: context.resetPassword,
  };
};
