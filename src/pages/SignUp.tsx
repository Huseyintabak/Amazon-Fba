import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signUp } from '../lib/auth';
import { useToast } from '../contexts/ToastContext';

const SignUp: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (password !== confirmPassword) {
      setError('Şifreler eşleşmiyor');
      return;
    }

    if (password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır');
      return;
    }

    setLoading(true);

    try {
      const { user, error: signUpError } = await signUp({
        email,
        password,
        fullName,
      });

      if (signUpError) {
        setError(signUpError.message);
        showToast(signUpError.message, 'error');
      } else if (user) {
        showToast('Kayıt başarılı! Lütfen email adresinizi doğrulayın.', 'success');
        navigate('/login');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
      showToast('Kayıt sırasında bir hata oluştu', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-2xl shadow-lg">
            <img src="/logo.svg" alt="Planet FBA Tracker" className="w-full h-full" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Hesap Oluştur
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Planet FBA Tracker'a hoş geldiniz
          </p>
        </div>

        <div className="card">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="fullName" className="label">
                Ad Soyad
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                className="input-field"
                placeholder="Ad Soyad"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

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

            <div>
              <label htmlFor="password" className="label">
                Şifre
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="input-field pr-10"
                  placeholder="Şifreniz (min 6 karakter)"
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

            <div>
              <label htmlFor="confirmPassword" className="label">
                Şifre Tekrar
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                required
                className="input-field"
                placeholder="Şifrenizi tekrar girin"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

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
                ) : null}
                {loading ? 'Kayıt Yapılıyor...' : 'Kayıt Ol'}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Zaten hesabınız var mı?{' '}
              <Link
                to="/login"
                className="font-medium text-primary hover:text-blue-700 transition-colors"
              >
                Giriş Yap
              </Link>
            </p>
          </div>
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            Kayıt olarak{' '}
            <a href="#" className="text-primary hover:underline">
              Kullanım Şartları
            </a>{' '}
            ve{' '}
            <a href="#" className="text-primary hover:underline">
              Gizlilik Politikası
            </a>
            'nı kabul etmiş olursunuz.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;

