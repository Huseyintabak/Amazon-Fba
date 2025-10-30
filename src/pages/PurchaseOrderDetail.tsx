import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { purchaseOrdersApi, purchaseOrderItemsApi } from '../lib/supabaseApi';
import { PurchaseOrderItem } from '../types';
import { useToast } from '../contexts/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';

const PurchaseOrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [po, setPO] = useState<any>(null);
  const [items, setItems] = useState<PurchaseOrderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (id) {
      loadPO();
    }
  }, [id]);

  const loadPO = async () => {
    try {
      setIsLoading(true);
      const data = await purchaseOrdersApi.getById(id!);
      setPO(data);
      // Load items separately
      const itemsData = await purchaseOrderItemsApi.getByPOId(id!);
      setItems(itemsData || []);
    } catch (error: unknown) {
      showToast(`Hata: ${error instanceof Error ? error.message : String(error)}`, 'error');
      navigate('/purchase-orders');
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (newStatus: string) => {
    try {
      setIsUpdating(true);
      await purchaseOrdersApi.update(id!, { status: newStatus as any });
      showToast('Durum güncellendi', 'success');
      loadPO();
    } catch (error: unknown) {
      showToast(`Hata: ${error instanceof Error ? error.message : String(error)}`, 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const updatePaymentStatus = async (newStatus: string) => {
    try {
      setIsUpdating(true);
      await purchaseOrdersApi.update(id!, { payment_status: newStatus as any });
      showToast('Ödeme durumu güncellendi', 'success');
      loadPO();
    } catch (error: unknown) {
      showToast(`Hata: ${error instanceof Error ? error.message : String(error)}`, 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const receiveItem = async (itemId: string, receivedQty: number) => {
    try {
      await purchaseOrderItemsApi.update(itemId, { received_quantity: receivedQty });
      showToast('Teslim alım güncellendi', 'success');
      loadPO();
    } catch (error: unknown) {
      showToast(`Hata: ${error instanceof Error ? error.message : String(error)}`, 'error');
    }
  };

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
      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-700'}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!po) {
    return <div className="container mx-auto p-6">Sipariş bulunamadı</div>;
  }

  const itemsTotal = items.reduce((sum, item) => sum + ((item.total_price || 0)), 0);
  const grandTotal = itemsTotal + (po.shipping_cost || 0) + (po.tax_amount || 0);

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <Link
              to="/purchase-orders"
              className="text-gray-600 hover:text-gray-900"
            >
              ← Geri
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Sipariş #{po.po_number}
          </h1>
          <p className="text-gray-600 mt-1">
            {new Date(po.order_date).toLocaleDateString('tr-TR')}
          </p>
        </div>
        <div>
          {getStatusBadge(po.status)}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Supplier Info */}
          <div className="card">
            <h3 className="font-bold text-lg mb-4">Tedarikçi Bilgileri</h3>
            <div className="space-y-2">
              <div>
                <span className="text-gray-600">Tedarikçi:</span>
                <span className="ml-2 font-semibold">{po.supplier?.name}</span>
              </div>
              {po.supplier?.company_name && (
                <div>
                  <span className="text-gray-600">Şirket:</span>
                  <span className="ml-2 font-semibold">{po.supplier.company_name}</span>
                </div>
              )}
              {po.supplier?.email && (
                <div>
                  <span className="text-gray-600">Email:</span>
                  <span className="ml-2">{po.supplier.email}</span>
                </div>
              )}
              {po.supplier?.phone && (
                <div>
                  <span className="text-gray-600">Telefon:</span>
                  <span className="ml-2">{po.supplier.phone}</span>
                </div>
              )}
              {po.supplier?.country && (
                <div>
                  <span className="text-gray-600">Ülke:</span>
                  <span className="ml-2">{po.supplier.country}</span>
                </div>
              )}
            </div>
          </div>

          {/* Items */}
          <div className="card">
            <h3 className="font-bold text-lg mb-4">Ürünler</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-200">
                  <tr>
                    <th className="text-left py-2 px-2 text-sm font-semibold text-gray-700">Ürün</th>
                    <th className="text-center py-2 px-2 text-sm font-semibold text-gray-700">Miktar</th>
                    <th className="text-right py-2 px-2 text-sm font-semibold text-gray-700">Birim Fiyat</th>
                    <th className="text-right py-2 px-2 text-sm font-semibold text-gray-700">Toplam</th>
                    <th className="text-center py-2 px-2 text-sm font-semibold text-gray-700">Teslim Alınan</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-b border-gray-100">
                      <td className="py-3 px-2">
                        <div>
                          <div className="font-semibold text-sm">{item.product_name}</div>
                          {item.product_sku && (
                            <div className="text-xs text-gray-500">SKU: {item.product_sku}</div>
                          )}
                        </div>
                      </td>
                      <td className="text-center py-3 px-2 text-sm">{item.quantity}</td>
                      <td className="text-right py-3 px-2 text-sm">${item.unit_price.toFixed(2)}</td>
                      <td className="text-right py-3 px-2 text-sm font-semibold">
                        ${(item.total_price || 0).toFixed(2)}
                      </td>
                      <td className="text-center py-3 px-2">
                        <input
                          type="number"
                          min="0"
                          max={item.quantity}
                          value={item.received_quantity || 0}
                          onChange={(e) => receiveItem(item.id, parseInt(e.target.value) || 0)}
                          className="w-16 px-2 py-1 text-sm border border-gray-300 rounded text-center"
                          disabled={po.status === 'cancelled'}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="space-y-2 max-w-xs ml-auto">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Ürünler Toplamı:</span>
                  <span className="font-semibold">${itemsTotal.toFixed(2)}</span>
                </div>
                {po.shipping_cost > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Kargo:</span>
                    <span className="font-semibold">${po.shipping_cost.toFixed(2)}</span>
                  </div>
                )}
                {po.tax_amount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Vergi:</span>
                    <span className="font-semibold">${po.tax_amount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-300">
                  <span>TOPLAM:</span>
                  <span className="text-blue-600">${grandTotal.toFixed(2)} {po.currency}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {po.notes && (
            <div className="card">
              <h3 className="font-bold text-lg mb-2">Notlar</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{po.notes}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Updates */}
          <div className="card">
            <h3 className="font-bold text-lg mb-4">Durum Güncelle</h3>
            <div className="space-y-3">
              <select
                value={po.status}
                onChange={(e) => updateStatus(e.target.value)}
                className="input-field"
                disabled={isUpdating}
              >
                <option value="draft">Taslak</option>
                <option value="submitted">Gönderildi</option>
                <option value="confirmed">Onaylandı</option>
                <option value="shipped">Kargoda</option>
                <option value="received">Teslim Alındı</option>
                <option value="cancelled">İptal</option>
              </select>

              <div>
                <label className="label text-sm">Ödeme Durumu</label>
                <select
                  value={po.payment_status}
                  onChange={(e) => updatePaymentStatus(e.target.value)}
                  className="input-field"
                  disabled={isUpdating}
                >
                  <option value="pending">Beklemede</option>
                  <option value="partial">Kısmi</option>
                  <option value="paid">Ödendi</option>
                  <option value="refunded">İade</option>
                </select>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="card">
            <h3 className="font-bold text-lg mb-4">Tarihler</h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-600">Sipariş Tarihi:</span>
                <div className="font-semibold">
                  {new Date(po.order_date).toLocaleDateString('tr-TR')}
                </div>
              </div>
              {po.expected_delivery_date && (
                <div>
                  <span className="text-gray-600">Tahmini Teslimat:</span>
                  <div className="font-semibold">
                    {new Date(po.expected_delivery_date).toLocaleDateString('tr-TR')}
                  </div>
                </div>
              )}
              {po.actual_delivery_date && (
                <div>
                  <span className="text-gray-600">Gerçek Teslimat:</span>
                  <div className="font-semibold">
                    {new Date(po.actual_delivery_date).toLocaleDateString('tr-TR')}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <h3 className="font-bold text-lg mb-4">Hızlı İşlemler</h3>
            <div className="space-y-2">
              {po.status === 'shipped' && (
                <button
                  onClick={() => updateStatus('received')}
                  className="w-full btn-primary text-sm"
                  disabled={isUpdating}
                >
                  ✅ Teslim Alındı Olarak İşaretle
                </button>
              )}
              {po.payment_status === 'pending' && (
                <button
                  onClick={() => updatePaymentStatus('paid')}
                  className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm"
                  disabled={isUpdating}
                >
                  💰 Ödeme Yapıldı
                </button>
              )}
              {po.status !== 'cancelled' && (
                <button
                  onClick={() => updateStatus('cancelled')}
                  className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm"
                  disabled={isUpdating}
                >
                  ❌ Siparişi İptal Et
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseOrderDetail;

