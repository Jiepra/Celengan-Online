import React from 'react';
import { useApp } from '../contexts/AppContext';
import { signInWithGoogle } from '../firebase/config';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { state, dispatch } = useApp();
  const { isAuthenticated, isLoading } = state;
  const [isLoginLoading, setIsLoginLoading] = React.useState(false);

  const handleLogin = async () => {
    try {
      setIsLoginLoading(true);
      await signInWithGoogle();
    } catch (error) {
      console.error('Login error:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Gagal login dengan Google. Silakan coba lagi.' });
    } finally {
      setIsLoginLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated && !isLoginLoading) {
    // Redirect to login page if not authenticated
    window.location.href = '/login';
    return null;
  }

  return <>{children}</>;
};

export default AuthGuard;