import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../hooks/useSubscription';
import { supabase } from '../lib/supabase';
import { useToast } from '../contexts/ToastContext';
import { Link } from 'react-router-dom';
import { getPlanName } from '../lib/featureGating';

interface Profile {
  id: string;
  full_name: string | null;
  company_name: string | null;
  avatar_url: string | null;
}

const Profile: React.FC = () => {
  const { user } = useAuth();
  const { subscription, usage, planType } = useSubscription();
  const { showToast } = useToast();
  const [, setProfile] = useState<Profile | null>(null);
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        setProfile(data);
        setFullName(data.full_name || '');
        setCompanyName(data.company_name || '');
      } catch (error) {
        console.error('Error fetching profile:', error);
        showToast('Profil yüklenirken hata oluştu', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          company_name: companyName,
        })
        .eq('id', user.id);

      if (error) throw error;

      showToast('Profil başarıyla güncellendi', 'success');
    } catch (error) {
      console.error('Error updating profile:', error);
      showToast('Profil güncellenirken hata oluştu', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Profil Ayarları</h1>
        <p className="text-gray-600 mt-2">Hesap bilgilerinizi ve aboneliğinizi yönetin</p>
      </div>

      <div className="grid gap-6">
        {/* Profile Information Card */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Kişisel Bilgiler
          </h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label htmlFor="email" className="label">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={user?.email || ''}
                disabled
                className="input-field bg-gray-100 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">
                Email adresi değiştirilemez
              </p>
            </div>

            <div>
              <label htmlFor="fullName" className="label">
                Ad Soyad
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="input-field"
                placeholder="Ad Soyad"
              />
            </div>

            <div>
              <label htmlFor="companyName" className="label">
                Şirket Adı (Opsiyonel)
              </label>
              <input
                id="companyName"
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="input-field"
                placeholder="Şirket Adı"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="btn-primary"
              >
                {saving ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </form>
        </div>

        {/* Subscription Card */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Abonelik Bilgileri
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Mevcut Plan</p>
                <p className="text-2xl font-bold text-gray-900">
                  {getPlanName(planType)}
                  {planType === 'pro' && (
                    <span className="ml-2 text-sm font-normal text-gray-600">
                      $19/ay
                    </span>
                  )}
                </p>
              </div>
              {planType === 'free' && (
                <Link to="/pricing" className="btn-primary">
                  Yükselt
                </Link>
              )}
            </div>

            {subscription && (
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Durum</p>
                  <p className="font-semibold text-gray-900 capitalize">
                    {subscription.status === 'active' ? 'Aktif' : subscription.status}
                  </p>
                </div>
                {subscription.current_period_end && (
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Yenileme Tarihi</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(subscription.current_period_end).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Usage Statistics Card */}
        {usage && (
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Kullanım İstatistikleri
            </h2>
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Ürünler</span>
                  <span className="font-medium text-gray-900">
                    {usage.products_count} / {planType === 'pro' ? '∞' : '10'}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      usage.products_count >= 10 && planType === 'free'
                        ? 'bg-red-500'
                        : usage.products_count >= 7 && planType === 'free'
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                    }`}
                    style={{
                      width:
                        planType === 'pro'
                          ? '0%'
                          : `${Math.min((usage.products_count / 10) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Aylık Sevkiyatlar</span>
                  <span className="font-medium text-gray-900">
                    {usage.shipments_count_monthly} / {planType === 'pro' ? '∞' : '5'}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      usage.shipments_count_monthly >= 5 && planType === 'free'
                        ? 'bg-red-500'
                        : usage.shipments_count_monthly >= 4 && planType === 'free'
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                    }`}
                    style={{
                      width:
                        planType === 'pro'
                          ? '0%'
                          : `${Math.min((usage.shipments_count_monthly / 5) * 100, 100)}%`,
                    }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Son sıfırlama: {new Date(usage.last_reset_date).toLocaleDateString('tr-TR')}
                </p>
              </div>

              {planType === 'free' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Pro plana geçerek</strong> sınırsız ürün ve sevkiyat
                    oluşturabilirsiniz.
                  </p>
                  <Link
                    to="/pricing"
                    className="inline-block mt-2 text-sm font-medium text-primary hover:underline"
                  >
                    Planları İncele →
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;

