import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface UserStat {
  id: string;
  email: string;
  signed_up_at: string;
  last_sign_in_at: string;
  role: string;
  plan: string;
  subscription_status: string;
  products_count: number;
  products_limit: number;
  shipments_this_month: number;
  shipments_monthly_limit: number;
  actual_products: number;
  actual_shipments: number;
}

interface OverviewStats {
  totalUsers: number;
  freeUsers: number;
  proUsers: number;
  totalProducts: number;
  totalShipments: number;
  activeToday: number;
}

const Admin: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserStat[]>([]);
  const [overviewStats, setOverviewStats] = useState<OverviewStats>({
    totalUsers: 0,
    freeUsers: 0,
    proUsers: 0,
    totalProducts: 0,
    totalShipments: 0,
    activeToday: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserStat | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [giftModalUser, setGiftModalUser] = useState<UserStat | null>(null);
  const [giftDuration, setGiftDuration] = useState(30);

  // Check if user is admin
  useEffect(() => {
    if (profile && profile.role !== 'admin') {
      // Not admin, redirect to dashboard
      navigate('/');
    }
  }, [profile, navigate]);

  // Load admin data
  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      // Load user stats from view (frontend controls admin access)
      const { data: userStats, error } = await supabase
        .from('admin_user_stats')
        .select('*');

      if (error) {
        console.error('Admin stats error:', error);
        throw error;
      }

      setUsers(userStats || []);

      // Calculate overview stats
      if (userStats && userStats.length > 0) {
        const freeUsers = userStats.filter(u => u.plan === 'free').length;
        const proUsers = userStats.filter(u => u.plan === 'pro').length;
        const totalProducts = userStats.reduce((sum, u) => sum + (Number(u.actual_products) || 0), 0);
        const totalShipments = userStats.reduce((sum, u) => sum + (Number(u.actual_shipments) || 0), 0);
        
        // Active today (signed in within last 24 hours)
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const activeToday = userStats.filter(u => 
          u.last_sign_in_at && new Date(u.last_sign_in_at) > oneDayAgo
        ).length;

        setOverviewStats({
          totalUsers: userStats.length,
          freeUsers,
          proUsers,
          totalProducts,
          totalShipments,
          activeToday,
        });
      }
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter users by search term
  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Gift premium to user
  const handleGiftPremium = async (userId: string, durationDays: number) => {
    try {
      const { data, error } = await supabase.rpc('admin_gift_premium', {
        p_user_id: userId,
        p_duration_days: durationDays,
      });

      if (error) throw error;

      alert(`✅ Premium hediye edildi! ${durationDays} gün boyunca Pro plan aktif.`);
      setGiftModalUser(null);
      loadAdminData(); // Refresh data
    } catch (error: any) {
      console.error('Error gifting premium:', error);
      alert(`❌ Hata: ${error.message}`);
    }
  };

  // Revoke premium from user
  const handleRevokePremium = async (userId: string) => {
    if (!confirm('Premium planı iptal etmek istediğinize emin misiniz?')) return;

    try {
      const { data, error } = await supabase.rpc('admin_revoke_premium', {
        p_user_id: userId,
      });

      if (error) throw error;

      alert('✅ Premium plan iptal edildi. Kullanıcı Free plana düşürüldü.');
      setSelectedUser(null);
      loadAdminData(); // Refresh data
    } catch (error: any) {
      console.error('Error revoking premium:', error);
      alert(`❌ Hata: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Panel 👨‍💼</h1>
        <p className="mt-2 text-sm text-gray-600">
          Kullanıcı yönetimi ve sistem metrikleri
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Toplam Kullanıcı"
          value={overviewStats.totalUsers}
          icon="👥"
          color="blue"
        />
        <StatCard
          title="Free Plan"
          value={overviewStats.freeUsers}
          subtitle={`${((overviewStats.freeUsers / overviewStats.totalUsers) * 100).toFixed(1)}%`}
          icon="🆓"
          color="gray"
        />
        <StatCard
          title="Pro Plan"
          value={overviewStats.proUsers}
          subtitle={`${((overviewStats.proUsers / overviewStats.totalUsers) * 100).toFixed(1)}%`}
          icon="⭐"
          color="yellow"
        />
        <StatCard
          title="Toplam Ürün"
          value={overviewStats.totalProducts}
          icon="📦"
          color="green"
        />
        <StatCard
          title="Toplam Sevkiyat"
          value={overviewStats.totalShipments}
          icon="🚚"
          color="purple"
        />
        <StatCard
          title="Aktif (24 saat)"
          value={overviewStats.activeToday}
          subtitle={`${((overviewStats.activeToday / overviewStats.totalUsers) * 100).toFixed(1)}% engagement`}
          icon="✅"
          color="green"
        />
      </div>

      {/* User List */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Kullanıcılar</h2>
          <input
            type="text"
            placeholder="Email ile ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kullanıcı
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ürünler
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sevkiyatlar
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kayıt Tarihi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Son Giriş
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksiyon
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {user.email}
                        </div>
                        {user.role === 'admin' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                            Admin
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.plan === 'pro' 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.plan === 'pro' ? '⭐ Pro' : '🆓 Free'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.actual_products} / {user.products_limit === 999999 ? '∞' : user.products_limit}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.shipments_this_month} / {user.shipments_monthly_limit === 999999 ? '∞' : user.shipments_monthly_limit}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.signed_up_at).toLocaleDateString('tr-TR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.last_sign_in_at 
                      ? new Date(user.last_sign_in_at).toLocaleDateString('tr-TR')
                      : 'Hiç giriş yok'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Detay
                      </button>
                      {user.plan === 'free' && (
                        <button
                          onClick={() => setGiftModalUser(user)}
                          className="text-green-600 hover:text-green-900"
                          title="Premium Hediye Et"
                        >
                          🎁
                        </button>
                      )}
                      {user.plan === 'pro' && user.subscription_status === 'active' && (
                        <button
                          onClick={() => handleRevokePremium(user.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Premium İptal Et"
                        >
                          ❌
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Kullanıcı bulunamadı.</p>
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <UserDetailModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}

      {/* Gift Premium Modal */}
      {giftModalUser && (
        <GiftPremiumModal
          user={giftModalUser}
          duration={giftDuration}
          onDurationChange={setGiftDuration}
          onGift={(duration) => handleGiftPremium(giftModalUser.id, duration)}
          onClose={() => setGiftModalUser(null)}
        />
      )}
    </div>
  );
};

// Stat Card Component
const StatCard: React.FC<{
  title: string;
  value: number;
  subtitle?: string;
  icon: string;
  color: string;
}> = ({ title, value, subtitle, icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    gray: 'bg-gray-100 text-gray-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
  }[color];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`flex-shrink-0 p-3 rounded-lg ${colorClasses}`}>
          <span className="text-2xl">{icon}</span>
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
};

// User Detail Modal
const UserDetailModal: React.FC<{
  user: UserStat;
  onClose: () => void;
}> = ({ user, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900">Kullanıcı Detayları</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          <DetailRow label="Email" value={user.email} />
          <DetailRow label="Role" value={user.role === 'admin' ? '👑 Admin' : '👤 User'} />
          <DetailRow label="Plan" value={user.plan === 'pro' ? '⭐ Pro' : '🆓 Free'} />
          <DetailRow label="Subscription Status" value={user.subscription_status || 'N/A'} />
          <DetailRow 
            label="Kayıt Tarihi" 
            value={new Date(user.signed_up_at).toLocaleString('tr-TR')} 
          />
          <DetailRow 
            label="Son Giriş" 
            value={user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString('tr-TR') : 'Hiç giriş yok'} 
          />
          
          <div className="border-t pt-4">
            <h4 className="font-semibold text-gray-900 mb-2">Kullanım İstatistikleri</h4>
            <DetailRow 
              label="Ürünler" 
              value={`${user.actual_products} / ${user.products_limit === 999999 ? '∞' : user.products_limit}`} 
            />
            <DetailRow 
              label="Sevkiyatlar (Bu Ay)" 
              value={`${user.shipments_this_month} / ${user.shipments_monthly_limit === 999999 ? '∞' : user.shipments_monthly_limit}`} 
            />
            <DetailRow 
              label="Toplam Sevkiyatlar" 
              value={user.actual_shipments.toString()} 
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};

const DetailRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex justify-between py-2 border-b border-gray-100">
    <span className="font-medium text-gray-600">{label}:</span>
    <span className="text-gray-900">{value}</span>
  </div>
);

// Gift Premium Modal
const GiftPremiumModal: React.FC<{
  user: UserStat;
  duration: number;
  onDurationChange: (duration: number) => void;
  onGift: (duration: number) => void;
  onClose: () => void;
}> = ({ user, duration, onDurationChange, onGift, onClose }) => {
  const [customDuration, setCustomDuration] = useState(duration);

  const presetDurations = [
    { label: '1 Hafta', value: 7, icon: '📅' },
    { label: '1 Ay', value: 30, icon: '📆' },
    { label: '3 Ay', value: 90, icon: '🗓️' },
    { label: '6 Ay', value: 180, icon: '📊' },
    { label: '1 Yıl', value: 365, icon: '🎯' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">🎁 Premium Hediye Et</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="mb-6">
          <p className="text-gray-700 mb-2">
            <strong>{user.email}</strong> kullanıcısına premium hediye ediyorsunuz.
          </p>
          <p className="text-sm text-gray-500">
            Kullanıcı seçtiğiniz süre boyunca Pro plan özelliklerine erişebilecek.
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Süre Seç:
          </label>
          
          <div className="grid grid-cols-2 gap-3">
            {presetDurations.map((preset) => (
              <button
                key={preset.value}
                onClick={() => setCustomDuration(preset.value)}
                className={`p-3 border-2 rounded-lg text-center transition-all ${
                  customDuration === preset.value
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-green-300'
                }`}
              >
                <div className="text-2xl mb-1">{preset.icon}</div>
                <div className="font-semibold text-sm">{preset.label}</div>
                <div className="text-xs text-gray-500">{preset.value} gün</div>
              </button>
            ))}
          </div>

          <div className="relative">
            <label className="block text-sm text-gray-600 mb-2">
              Özel Süre (Gün):
            </label>
            <input
              type="number"
              min="1"
              max="3650"
              value={customDuration}
              onChange={(e) => setCustomDuration(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Gün sayısı"
            />
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <p className="text-sm text-blue-800">
            ℹ️ <strong>Bitiş Tarihi:</strong>{' '}
            {new Date(Date.now() + customDuration * 24 * 60 * 60 * 1000).toLocaleDateString('tr-TR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
          >
            İptal
          </button>
          <button
            onClick={() => onGift(customDuration)}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
          >
            🎁 Hediye Et
          </button>
        </div>
      </div>
    </div>
  );
};

export default Admin;

