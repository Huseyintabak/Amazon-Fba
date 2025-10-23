import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { purchaseOrdersApi, purchaseOrderItemsApi } from '../lib/supabaseApi';
import { supabase } from '../lib/supabase';
import { PurchaseOrder, PurchaseOrderItem, Supplier, Product } from '../types';
import { useToast } from '../contexts/ToastContext';

interface POItem {
  id?: string;
  product_id?: string;
  product_name: string;
  product_sku?: string;
  quantity: number;
  unit_price: number;
}

const NewPurchaseOrder: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  // Form state
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [formData, setFormData] = useState({
    supplier_id: '',
    po_number: `PO-${Date.now()}`,
    order_date: new Date().toISOString().split('T')[0],
    expected_delivery_date: '',
    status: 'draft' as const,
    payment_status: 'pending' as const,
    shipping_cost: 0,
    tax_amount: 0,
    notes: '',
    currency: 'USD'
  });
  
  const [items, setItems] = useState<POItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadSuppliers();
    loadProducts();
  }, []);

  const loadSuppliers = async () => {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      setSuppliers(data || []);
    } catch (error: any) {
      showToast(`Tedarikçiler yüklenemedi: ${error.message}`, 'error');
    }
  };

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, merchant_sku, product_cost')
        .order('name');
      
      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      showToast(`Ürünler yüklenemedi: ${error.message}`, 'error');
    }
  };

  const addItem = () => {
    setItems([...items, {
      product_name: '',
      product_sku: '',
      quantity: 1,
      unit_price: 0
    }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof POItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const selectProduct = (index: number, productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      updateItem(index, 'product_id', product.id);
      updateItem(index, 'product_name', product.name);
      updateItem(index, 'product_sku', product.merchant_sku || '');
      updateItem(index, 'unit_price', product.product_cost || 0);
    }
  };

  const calculateTotal = () => {
    const itemsTotal = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
    return itemsTotal + formData.shipping_cost + formData.tax_amount;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.supplier_id) {
      showToast('Lütfen bir tedarikçi seçin', 'error');
      return;
    }

    if (items.length === 0) {
      showToast('En az bir ürün ekleyin', 'error');
      return;
    }

    try {
      setIsLoading(true);

      // Create PO
      const po = await purchaseOrdersApi.create({
        ...formData,
        total_amount: calculateTotal()
      });

      // Create items
      const itemsToCreate = items.map(item => ({
        purchase_order_id: po.id,
        product_id: item.product_id,
        product_name: item.product_name,
        product_sku: item.product_sku,
        quantity: item.quantity,
        unit_price: item.unit_price
      }));

      await purchaseOrderItemsApi.createMany(itemsToCreate);

      showToast('Satın alma emri oluşturuldu!', 'success');
      navigate('/purchase-orders');
    } catch (error: any) {
      showToast(`Hata: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Yeni Satın Alma Emri</h1>
        <p className="text-gray-600 mt-1">Tedarikçiden sipariş oluşturun</p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Basic Info Card */}
        <div className="card mb-6">
          <h3 className="font-bold text-lg mb-4">Temel Bilgiler</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label required">Tedarikçi</label>
              <select
                value={formData.supplier_id}
                onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
                className="input-field"
                required
              >
                <option value="">Tedarikçi seçin</option>
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} {s.company_name && `(${s.company_name})`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label required">Sipariş Numarası</label>
              <input
                type="text"
                value={formData.po_number}
                onChange={(e) => setFormData({ ...formData, po_number: e.target.value })}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="label required">Sipariş Tarihi</label>
              <input
                type="date"
                value={formData.order_date}
                onChange={(e) => setFormData({ ...formData, order_date: e.target.value })}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="label">Tahmini Teslim Tarihi</label>
              <input
                type="date"
                value={formData.expected_delivery_date}
                onChange={(e) => setFormData({ ...formData, expected_delivery_date: e.target.value })}
                className="input-field"
              />
            </div>

            <div>
              <label className="label">Durum</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="input-field"
              >
                <option value="draft">Taslak</option>
                <option value="submitted">Gönderildi</option>
                <option value="confirmed">Onaylandı</option>
              </select>
            </div>

            <div>
              <label className="label">Para Birimi</label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="input-field"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="TRY">TRY</option>
                <option value="GBP">GBP</option>
                <option value="CNY">CNY</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="label">Notlar</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="input-field"
              rows={3}
              placeholder="Özel notlar veya talimatlar..."
            />
          </div>
        </div>

        {/* Items Card */}
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg">Ürünler</h3>
            <button
              type="button"
              onClick={addItem}
              className="btn-primary text-sm"
            >
              ➕ Ürün Ekle
            </button>
          </div>

          {items.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Henüz ürün eklenmedi. "Ürün Ekle" butonuna tıklayın.
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="md:col-span-2">
                      <label className="label text-sm">Ürün</label>
                      <select
                        value={item.product_id || ''}
                        onChange={(e) => selectProduct(index, e.target.value)}
                        className="input-field text-sm"
                      >
                        <option value="">Manuel gir veya seç</option>
                        {products.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.merchant_sku})
                          </option>
                        ))}
                      </select>
                      {!item.product_id && (
                        <input
                          type="text"
                          value={item.product_name}
                          onChange={(e) => updateItem(index, 'product_name', e.target.value)}
                          placeholder="Ürün adı"
                          className="input-field text-sm mt-2"
                          required
                        />
                      )}
                    </div>

                    <div>
                      <label className="label text-sm">SKU</label>
                      <input
                        type="text"
                        value={item.product_sku || ''}
                        onChange={(e) => updateItem(index, 'product_sku', e.target.value)}
                        className="input-field text-sm"
                        placeholder="SKU"
                      />
                    </div>

                    <div>
                      <label className="label text-sm">Miktar</label>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                        className="input-field text-sm"
                        min="1"
                        required
                      />
                    </div>

                    <div>
                      <label className="label text-sm">Birim Fiyat</label>
                      <input
                        type="number"
                        step="0.01"
                        value={item.unit_price}
                        onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                        className="input-field text-sm"
                        min="0"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-300">
                    <div className="text-sm font-semibold text-gray-700">
                      Toplam: ${(item.quantity * item.unit_price).toFixed(2)}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      🗑️ Kaldır
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Costs Card */}
        <div className="card mb-6">
          <h3 className="font-bold text-lg mb-4">Ek Maliyetler</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Kargo Maliyeti</label>
              <input
                type="number"
                step="0.01"
                value={formData.shipping_cost}
                onChange={(e) => setFormData({ ...formData, shipping_cost: parseFloat(e.target.value) || 0 })}
                className="input-field"
                min="0"
              />
            </div>

            <div>
              <label className="label">Vergi</label>
              <input
                type="number"
                step="0.01"
                value={formData.tax_amount}
                onChange={(e) => setFormData({ ...formData, tax_amount: parseFloat(e.target.value) || 0 })}
                className="input-field"
                min="0"
              />
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between text-lg font-bold">
              <span>GENEL TOPLAM:</span>
              <span className="text-blue-600">${calculateTotal().toFixed(2)} {formData.currency}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/purchase-orders')}
            className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isLoading}
          >
            İptal
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={isLoading}
          >
            {isLoading ? 'Oluşturuluyor...' : 'Sipariş Oluştur'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewPurchaseOrder;

