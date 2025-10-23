import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { resetPassword } from '../lib/auth';
import { useToast } from '../contexts/ToastContext';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error: resetError } = await resetPassword(email);

      if (resetError) {
        setError(resetError.message);
        showToast(resetError.message, 'error');
      } else {
        setSent(true);
        showToast('Şifre sıfırlama bağlantısı email adresinize gönderildi', 'success');
      }
    } catch (err: any) {
      setError(err.message);
      showToast('Bir hata oluştu', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-2xl bg-green-500 shadow-lg">
              <span className="text-3xl">✉️</span>
            </div>
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              Email Gönderildi
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Şifre sıfırlama bağlantısı <strong>{email}</strong> adresine gönderildi.
            </p>
            <p className="mt-4 text-sm text-gray-600">
              Email kutunuzu kontrol edin ve bağlantıya tıklayarak şifrenizi sıfırlayın.
            </p>
            <div className="mt-6">
              <Link
                to="/login"
                className="btn-primary inline-flex items-center"
              >
                Giriş Sayfasına Dön
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-2xl bg-primary shadow-lg">
            <span className="text-3xl">🔒</span>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Şifremi Unuttum
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Email adresinizi girin, size şifre sıfırlama bağlantısı gönderelim
          </p>
        </div>

        <div className="card">
          <form className="space-y-6" onSubmit={handleSubmit}>
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
                {loading ? 'Gönderiliyor...' : 'Şifre Sıfırlama Bağlantısı Gönder'}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="text-sm font-medium text-primary hover:text-blue-700 transition-colors"
            >
              ← Giriş sayfasına dön
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

