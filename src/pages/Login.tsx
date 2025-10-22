import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';

const Login: React.FC = () => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { showToast } = useToast();

  // Check if already authenticated
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (isAuthenticated) {
      navigate('/');
    }
  }, [navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple password check (in production, this would be more secure)
    if (password === 'fba2024') {
      localStorage.setItem('isAuthenticated', 'true');
      // Dispatch custom event to notify App component
      window.dispatchEvent(new CustomEvent('authChange'));
      showToast('Giriş başarılı! Hoş geldiniz.', 'success');
      navigate('/');
    } else {
      setError('Yanlış şifre. Lütfen tekrar deneyin.');
      showToast('Yanlış şifre. Lütfen tekrar deneyin.', 'error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-2xl bg-primary shadow-lg">
            <span className="text-3xl">🚚</span>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Amazon FBA Tracker
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sevkiyat takip sisteminize hoş geldiniz
          </p>
        </div>
        
        <div className="card">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Şifre
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="input-field pr-10"
                  placeholder="Şifrenizi girin"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="text-gray-400 hover:text-gray-600 transition-colors">
                    {showPassword ? '🙈' : '👁️'}
                  </span>
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm text-center">
                  {error}
                </p>
              </div>
            )}

            <div>
              <button
                type="submit"
                className="btn-primary w-full flex items-center justify-center"
              >
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <span className="text-blue-500 group-hover:text-blue-400">🔒</span>
                </span>
                Giriş Yap
              </button>
            </div>
          </form>
          
          <div className="mt-6 text-center">
            <div className="text-xs text-gray-500">
              Demo şifre: <code className="bg-gray-100 px-2 py-1 rounded text-gray-800 font-mono">fba2024</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;