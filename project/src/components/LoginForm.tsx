import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react';
import { Logo } from './Logo';

interface LoginFormProps {
  onError: (error: string) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onError }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      onError('Email dan password harus diisi');
      return;
    }

    setIsLoading(true);
    onError('');

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        onError('Email atau password salah');
      } else if (error.code === 'auth/invalid-email') {
        onError('Format email tidak valid');
      } else if (error.code === 'auth/too-many-requests') {
        onError('Terlalu banyak percobaan login. Coba lagi nanti');
      } else {
        onError('Terjadi kesalahan saat login: ' + error.message);
      }
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Floating background elements */}
      <div className="floating-dots"></div>
      
      <div className="w-full max-w-md">
        <div className="glass-effect rounded-2xl p-8 shadow-2xl animate-fade-in-down hover-scale">
          {/* Logo and Header */}
          <div className="text-center mb-8 animate-fade-in">
            <Logo size="lg" className="justify-center mb-6" />
            <h2 className="text-3xl font-bold text-white mb-2">
              Login Admin
            </h2>
            <p className="text-gray-400">
              Sistem Absensi Online
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="animate-slide-in-left">
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                <Mail className="inline w-4 h-4 mr-2" />
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-dark-800/50 border border-dark-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300 hover:bg-dark-700/50"
                placeholder="admin@example.com"
                disabled={isLoading}
              />
            </div>

            <div className="animate-slide-in-right">
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                <Lock className="inline w-4 h-4 mr-2" />
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-dark-800/50 border border-dark-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300 hover:bg-dark-700/50"
                placeholder="••••••••"
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-300 hover:from-primary-600 hover:to-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-dark-900 disabled:opacity-50 disabled:cursor-not-allowed button-glow animate-glow animate-fade-in-up"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Masuk...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <LogIn className="w-5 h-5 mr-2" />
                  Masuk
                </div>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center animate-fade-in">
            <p className="text-xs text-gray-500">
              Sistem Manajemen Absensi Digital
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};