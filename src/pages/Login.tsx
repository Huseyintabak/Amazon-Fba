import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signIn, signInWithMagicLink } from '../lib/auth';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [useMagicLink, setUseMagicLink] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { isAuthenticated } = useAuth();

  // Check if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (useMagicLink) {
        const { error: magicLinkError } = await signInWithMagicLink(email);
        
        if (magicLinkError) {
          setError(magicLinkError.message);
          showToast(magicLinkError.message, 'error');
        } else {
          setMagicLinkSent(true);
          showToast('Magic link gönderildi! Email kutunuzu kontrol edin.', 'success');
        }
      } else {
        const { user, error: signInError } = await signIn({ email, password });

        if (signInError) {
          setError(signInError.message);
          showToast('Giriş başarısız. Email ve şifrenizi kontrol edin.', 'error');
        } else if (user) {
          showToast('Giriş başarılı! Hoş geldiniz.', 'success');
          navigate('/');
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
      showToast('Bir hata oluştu', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (magicLinkSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-2xl bg-green-500 shadow-lg">
              <span className="text-3xl">✉️</span>
            </div>
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              Magic Link Gönderildi
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              <strong>{email}</strong> adresine giriş bağlantısı gönderdik.
            </p>
            <p className="mt-4 text-sm text-gray-600">
              Email kutunuzu kontrol edin ve bağlantıya tıklayarak giriş yapın.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-2xl shadow-lg">
            <img src="/logo.svg" alt="Planet FBA Tracker" className="w-full h-full" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Planet FBA Tracker
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sevkiyat takip sisteminize hoş geldiniz
          </p>
        </div>

        <div className="card">
          {/* Toggle between email/password and magic link */}
          <div className="flex border-b border-gray-200 mb-6">
            <button
              type="button"
              onClick={() => setUseMagicLink(false)}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                !useMagicLink
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Şifre ile Giriş
            </button>
            <button
              type="button"
              onClick={() => setUseMagicLink(true)}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                useMagicLink
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Magic Link
            </button>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="label">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="input-field"
                placeholder="ornek@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {!useMagicLink && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="password" className="label mb-0">
                    Şifre
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs text-primary hover:text-blue-700 transition-colors"
                  >
                    Şifremi unuttum
                  </Link>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required={!useMagicLink}
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
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm text-center">{error}</p>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center"
              >
                {loading ? (
                  <span className="spinner-sm mr-2" />
                ) : (
                  <span className="mr-2">
                    {useMagicLink ? '✉️' : '🔒'}
                  </span>
                )}
                {loading
                  ? 'İşleniyor...'
                  : useMagicLink
                  ? 'Magic Link Gönder'
                  : 'Giriş Yap'}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Hesabınız yok mu?{' '}
              <Link
                to="/signup"
                className="font-medium text-primary hover:text-blue-700 transition-colors"
              >
                Kayıt Ol
              </Link>
            </p>
          </div>
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            <strong>Free Plan:</strong> 10 ürün, 5 sevkiyat/ay |{' '}
            <strong>Pro Plan:</strong> Sınırsız
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;