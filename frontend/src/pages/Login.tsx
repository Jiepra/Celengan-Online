import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithGoogle, signInWithEmail } from '../firebase/config';
import { useApp } from '../contexts/AppContext';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Redirect to dashboard if already authenticated
  React.useEffect(() => {
    if (state.isAuthenticated) {
      navigate('/dashboard');
    }
  }, [state.isAuthenticated, navigate]);

  const handleGoogleLogin = async () => {
    try {
      setIsLoginLoading(true);
      await signInWithGoogle();
      // Navigation will happen automatically due to the useEffect above
    } catch (error) {
      console.error('Login error:', error);
      setError('Gagal login dengan Google. Silakan coba lagi.');
    } finally {
      setIsLoginLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      setIsLoginLoading(true);
      
      // Validasi email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError('Format email tidak valid.');
        return;
      }
      
      // Validasi password tidak kosong
      if (!password) {
        setError('Password tidak boleh kosong.');
        return;
      }
      
      // Login dengan email dan password
      await signInWithEmail(email, password);
      // Navigation will happen automatically due to the useEffect above
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'Gagal login dengan email. Silakan coba lagi.');
    } finally {
      setIsLoginLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-500 to-blue-700 relative">
      <div className="bg-white rounded-lg shadow-xl overflow-hidden max-w-4xl w-full flex">
        {/* Left side - Green section with welcome message */}
        <div className="hidden md:block md:w-1/2 bg-gradient-to-br from-primary to-blue-600 p-12 text-white relative">
          <div className="absolute inset-0 bg-blue-600 opacity-10 backdrop-blur-sm">
            <div className="w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_0,rgba(255,255,255,0)_50%)]">
            </div>
          </div>
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-6">Halo, Selamat Datang!</h2>
            <p className="mb-8">Daftarkan diri anda dan mulai gunakan Celengan Online!</p>
            <Link to="/register" className="inline-block border-2 border-white text-white px-6 py-3 rounded-full hover:bg-white hover:text-primary transition-all duration-300 font-medium cursor-pointer" onClick={() => navigate('/register')}>
              SIGN UP
            </Link>
          </div>
        </div>
        
        {/* Right side - Login form */}
        <div className="w-full md:w-1/2 p-8 md:p-12">
          <h2 className="text-2xl font-bold mb-8 text-center text-gray-800">Sign in</h2>
          
          {/* Google login button */}
          <div className="flex justify-center mb-6">
            <button 
              onClick={handleGoogleLogin}
              disabled={isLoginLoading}
              className="flex items-center justify-center gap-2 w-full py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              type="button"
            >
              {isLoginLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary"></div>
              ) : (
                <div className="flex items-center justify-center gap-2 w-full cursor-pointer">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  <span>Login dengan Google</span>
                </div>
              )}
            </button>
          </div>
          
          <div className="text-center mb-6">
            <span className="text-sm text-gray-500">atau gunakan akun anda</span>
          </div>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleEmailLogin} className="mb-6">
            <div className="mb-4">
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Email"
                required
              />
            </div>
            <div className="mb-6">
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Password"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={isLoginLoading}
              className="w-full py-3 px-4 bg-primary text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center"
            >
              {isLoginLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
              ) : null}
              SIGN IN
            </button>
          </form>

          <div className="mt-6 text-center md:hidden">
            <p className="text-sm text-gray-600">
              Belum punya akun? <Link to="/register" className="text-primary hover:text-blue-800 font-medium cursor-pointer" onClick={() => navigate('/register')}>Daftar sekarang</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;