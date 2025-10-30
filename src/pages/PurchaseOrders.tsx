import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { purchaseOrdersApi } from '../lib/supabaseApi';
import { PurchaseOrder } from '../types';
import { useToast } from '../contexts/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';

const PurchaseOrders: React.FC = () => {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    draft: 0,
    submitted: 0,
    confirmed: 0,
    shipped: 0,
    received: 0,
    cancelled: 0,
    totalValue: 0,
    pendingPayment: 0
  });
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState<PurchaseOrder | null>(null);
  const { showToast } = useToast();
  // const navigate = useNavigate();

  useEffect(() => {
    loadPurchaseOrders();
    loadStats();
  }, []);

  const loadPurchaseOrders = async () => {
    try {
      setIsLoading(true);
      const data = await purchaseOrdersApi.getAll();
      setPurchaseOrders(data);
    } catch (error: unknown) {
      showToast(`Hata: ${error instanceof Error ? error.message : String(error)}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await purchaseOrdersApi.getStats();
      setStats(data);
    } catch (error: unknown) {
      console.error('Stats error:', error);
    }
  };

  const handleDelete = async (po: PurchaseOrder) => {
    try {
      await purchaseOrdersApi.delete(po.id);
      showToast('Satın alma emri silindi', 'success');
      loadPurchaseOrders();
      loadStats();
      setShowDeleteModal(null);
    } catch (error: unknown) {
      showToast(`Hata: ${error instanceof Error ? error.message : String(error)}`, 'error');
    }
  };

  // Filter and search
  const filteredPOs = useMemo(() => {
    return purchaseOrders.filter(po => {
      const matchesStatus = statusFilter === 'all' || po.status === statusFilter;
      const matchesSearch = searchTerm === '' || 
        po.po_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (po as any).supplier?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [purchaseOrders, statusFilter, searchTerm]);

  const getStatusBadge = (status: string) => {
    const badges = {
      draft: 'bg-gray-100 text-gray-700',
      submitted: 'bg-blue-100 text-blue-700',
      confirmed: 'bg-purple-100 text-purple-700',
      shipped: 'bg-yellow-100 text-yellow-700',
      received: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700'
    };
    const labels = {
      draft: 'Taslak',
      submitted: 'Gönderildi',
      confirmed: 'Onaylandı',
      shipped: 'Kargoda',
      received: 'Teslim Alındı',
      cancelled: 'İptal'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-700'}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  const getPaymentBadge = (status: string) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-700',
      partial: 'bg-blue-100 text-blue-700',
      paid: 'bg-green-100 text-green-700',
      refunded: 'bg-red-100 text-red-700'
    };
    const labels = {
      pending: 'Beklemede',
      partial: 'Kısmi',
      paid: 'Ödendi',
      refunded: 'İade'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-700'}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Satın Alma Emirleri</h1>
          <p className="text-gray-600 mt-1">Tedarikçilerden yapılan siparişleri yönetin</p>
        </div>
        <Link
          to="/purchase-orders/new"
          className="btn-primary flex items-center space-x-2"
        >
          <span className="text-xl">➕</span>
          <span>Yeni Sipariş</span>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Toplam Sipariş</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📦</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Toplam Değer</p>
              <p className="text-2xl font-bold text-gray-900">${stats.totalValue.toFixed(2)}</p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <span className="text-2xl">💰</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Bekleyen Ödeme</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingPayment}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center">
              <span className="text-2xl">⏳</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Teslim Alındı</p>
              <p className="text-2xl font-bold text-gray-900">{stats.received}</p>
            </div>
            <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
              <span className="text-2xl">✅</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Durum Filtresi</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field"
            >
              <option value="all">Tümü ({stats.total})</option>
              <option value="draft">Taslak ({stats.draft})</option>
              <option value="submitted">Gönderildi ({stats.submitted})</option>
              <option value="confirmed">Onaylandı ({stats.confirmed})</option>
              <option value="shipped">Kargoda ({stats.shipped})</option>
              <option value="received">Teslim Alındı ({stats.received})</option>
              <option value="cancelled">İptal ({stats.cancelled})</option>
            </select>
          </div>

          <div>
            <label className="label">Arama</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Sipariş no veya tedarikçi ara..."
              className="input-field"
            />
          </div>
        </div>
      </div>

      {/* Purchase Orders Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            Siparişler ({filteredPOs.length})
          </h3>
        </div>

        <div className="mobile-table">
          <table className="table">
            <thead className="table-header">
              <tr>
                <th className="table-cell">Sipariş No</th>
                <th className="table-cell">Tedarikçi</th>
                <th className="table-cell">Tarih</th>
                <th className="table-cell">Teslim Tarihi</th>
                <th className="table-cell">Tutar</th>
                <th className="table-cell">Durum</th>
                <th className="table-cell">Ödeme</th>
                <th className="table-cell w-32">İşlemler</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {filteredPOs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-gray-500">
                    {searchTerm || statusFilter !== 'all' 
                      ? 'Filtre kriterlerine uygun sipariş bulunamadı'
                      : 'Henüz sipariş yok. İlk siparişinizi oluşturun!'}
                  </td>
                </tr>
              ) : (
                filteredPOs.map((po: Record<string, unknown>) => (
                  <tr key={po.id} className="table-row">
                    <td className="table-cell font-semibold text-blue-600">
                      {po.po_number}
                    </td>
                    <td className="table-cell">
                      <div>
                        <div className="font-semibold">{po.supplier?.name || 'N/A'}</div>
                        {po.supplier?.country && (
                          <div className="text-xs text-gray-500">{po.supplier.country}</div>
                        )}
                      </div>
                    </td>
                    <td className="table-cell">
                      {new Date(po.order_date).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="table-cell">
                      {po.expected_delivery_date 
                        ? new Date(po.expected_delivery_date).toLocaleDateString('tr-TR')
                        : '-'}
                    </td>
                    <td className="table-cell font-semibold">
                      ${po.total_amount?.toFixed(2) || '0.00'}
                      {po.currency && po.currency !== 'USD' && (
                        <span className="text-xs text-gray-500 ml-1">{po.currency}</span>
                      )}
                    </td>
                    <td className="table-cell">
                      {getStatusBadge(po.status)}
                    </td>
                    <td className="table-cell">
                      {getPaymentBadge(po.payment_status || 'pending')}
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/purchase-orders/${po.id}`}
                          className="action-btn action-btn-view"
                          title="Detaylar"
                        >
                          👁️
                        </Link>
                        <button
                          onClick={() => setShowDeleteModal(po)}
                          className="action-btn action-btn-delete"
                          title="Sil"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content max-w-md">
            <h3 className="text-xl font-bold mb-4">Siparişi Sil</h3>
            <p className="text-gray-600 mb-6">
              <strong>{showDeleteModal.po_number}</strong> numaralı siparişi silmek istediğinizden emin misiniz?
              Bu işlem geri alınamaz.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(null)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                İptal
              </button>
              <button
                onClick={() => handleDelete(showDeleteModal)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseOrders;

