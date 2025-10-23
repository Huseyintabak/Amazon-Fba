import React, { useState, useEffect } from 'react';
import { useToast } from '../contexts/ToastContext';
import { Supplier } from '../types';
import { supabase } from '../lib/supabase';
import SupplierPerformance from '../components/SupplierPerformance';

const Suppliers: React.FC = () => {
  const { showToast } = useToast();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [activeTab, setActiveTab] = useState<'list' | 'performance'>('list');

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .order('name');

      if (error) throw error;
      setSuppliers(data || []);
    } catch (error) {
      console.error('Error loading suppliers:', error);
      showToast('Tedarikçiler yüklenirken hata oluştu', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingSupplier(null);
    setShowModal(true);
  };

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu tedarikçiyi silmek istediğinizden emin misiniz?')) return;

    try {
      const { error } = await supabase.from('suppliers').delete().eq('id', id);
      if (error) throw error;
      
      showToast('Tedarikçi başarıyla silindi!', 'success');
      loadSuppliers();
    } catch (error) {
      console.error('Error deleting supplier:', error);
      showToast('Tedarikçi silinirken hata oluştu!', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">🏭 Tedarikçi Yönetimi</h1>
          <p className="mt-2 text-sm text-gray-600">
            Tedarikçilerinizi görüntüleyin ve yönetin
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="mt-4 sm:mt-0 btn-primary flex items-center space-x-2"
        >
          <span>➕</span>
          <span>Yeni Tedarikçi</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab('list')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'list'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            📋 Tedarikçi Listesi ({suppliers.length})
          </button>
          <button
            onClick={() => setActiveTab('performance')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'performance'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            📊 Performans Analizi
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'list' ? (
        <>
          {/* Suppliers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {suppliers.map((supplier) => (
          <div
            key={supplier.id}
            className="card hover:shadow-lg transition-shadow duration-200"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900">{supplier.name}</h3>
                {supplier.company_name && (
                  <p className="text-sm text-gray-600">{supplier.company_name}</p>
                )}
              </div>
              {supplier.rating && (
                <div className="flex items-center">
                  <span className="text-yellow-500">{'⭐'.repeat(supplier.rating)}</span>
                </div>
              )}
            </div>

            <div className="space-y-2 mb-4">
              {supplier.country && (
                <div className="flex items-center text-sm text-gray-600">
                  <span className="mr-2">🌍</span>
                  <span>{supplier.country}</span>
                </div>
              )}
              {supplier.email && (
                <div className="flex items-center text-sm text-gray-600">
                  <span className="mr-2">📧</span>
                  <span className="truncate">{supplier.email}</span>
                </div>
              )}
              {supplier.phone && (
                <div className="flex items-center text-sm text-gray-600">
                  <span className="mr-2">📞</span>
                  <span>{supplier.phone}</span>
                </div>
              )}
              {supplier.lead_time_days !== undefined && supplier.lead_time_days > 0 && (
                <div className="flex items-center text-sm text-gray-600">
                  <span className="mr-2">⏱️</span>
                  <span>{supplier.lead_time_days} gün teslimat</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <span className={`badge ${supplier.is_active ? 'badge-success' : 'badge-warning'}`}>
                {supplier.is_active ? 'Aktif' : 'Pasif'}
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(supplier)}
                  className="action-btn action-btn-edit"
                  title="Düzenle"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDelete(supplier.id)}
                  className="action-btn action-btn-delete"
                  title="Sil"
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {suppliers.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <span className="text-6xl">🏭</span>
          <h3 className="mt-4 text-lg font-medium text-gray-900">Henüz tedarikçi yok</h3>
          <p className="mt-2 text-sm text-gray-500">
            İlk tedarikçinizi ekleyerek başlayın.
          </p>
          <button onClick={handleAdd} className="mt-4 btn-primary">
            ➕ İlk Tedarikçiyi Ekle
          </button>
        </div>
      )}
        </>
      ) : (
        /* Performance Tab */
        <div className="card">
          <SupplierPerformance />
        </div>
      )}

      {/* Supplier Modal */}
      {showModal && (
        <SupplierModal
          supplier={editingSupplier}
          onClose={() => {
            setShowModal(false);
            setEditingSupplier(null);
          }}
          onSuccess={() => {
            setShowModal(false);
            setEditingSupplier(null);
            loadSuppliers();
          }}
        />
      )}
    </div>
  );
};

// Supplier Modal Component
interface SupplierModalProps {
  supplier: Supplier | null;
  onClose: () => void;
  onSuccess: () => void;
}

const SupplierModal: React.FC<SupplierModalProps> = ({ supplier, onClose, onSuccess }) => {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    name: supplier?.name || '',
    company_name: supplier?.company_name || '',
    email: supplier?.email || '',
    phone: supplier?.phone || '',
    country: supplier?.country || '',
    address: supplier?.address || '',
    contact_person: supplier?.contact_person || '',
    website: supplier?.website || '',
    notes: supplier?.notes || '',
    payment_terms: supplier?.payment_terms || '',
    currency: supplier?.currency || 'USD',
    lead_time_days: supplier?.lead_time_days || 0,
    minimum_order_quantity: supplier?.minimum_order_quantity || 0,
    rating: supplier?.rating || 5,
    is_active: supplier?.is_active !== false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) {
      showToast('Tedarikçi adı zorunludur!', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      
      if (supplier) {
        // Update existing supplier
        const { error } = await supabase
          .from('suppliers')
          .update(formData)
          .eq('id', supplier.id);
        
        if (error) throw error;
        showToast('Tedarikçi başarıyla güncellendi!', 'success');
      } else {
        // Create new supplier
        const { error } = await supabase
          .from('suppliers')
          .insert([formData]);
        
        if (error) throw error;
        showToast('Tedarikçi başarıyla eklendi!', 'success');
      }
      
      onSuccess();
    } catch (error) {
      console.error('Error saving supplier:', error);
      showToast('Tedarikçi kaydedilirken hata oluştu!', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content max-w-7xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6 sticky top-0 bg-white pb-4 border-b">
          <h3 className="text-xl font-bold text-gray-900">
            {supplier ? '✏️ Tedarikçi Düzenle' : '➕ Yeni Tedarikçi'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">
            ❌
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label className="label">Tedarikçi Adı *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-field"
                placeholder="Tedarikçi adı"
                required
              />
            </div>

            {/* Company Name */}
            <div>
              <label className="label">Şirket Adı</label>
              <input
                type="text"
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                className="input-field"
                placeholder="Şirket adı"
              />
            </div>

            {/* Email */}
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input-field"
                placeholder="email@example.com"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="label">Telefon</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="input-field"
                placeholder="+90 555 123 4567"
              />
            </div>

            {/* Country */}
            <div>
              <label className="label">Ülke</label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="input-field"
                placeholder="Türkiye, China, USA..."
              />
            </div>

            {/* Contact Person */}
            <div>
              <label className="label">İlgili Kişi</label>
              <input
                type="text"
                value={formData.contact_person}
                onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                className="input-field"
                placeholder="İlgili kişi"
              />
            </div>

            {/* Website */}
            <div className="md:col-span-2">
              <label className="label">Website</label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="input-field"
                placeholder="https://example.com"
              />
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <label className="label">Adres</label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="input-field"
                rows={2}
                placeholder="Tam adres"
              />
            </div>

            {/* Payment Terms */}
            <div>
              <label className="label">Ödeme Koşulları</label>
              <select
                value={formData.payment_terms}
                onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
                className="input-field"
              >
                <option value="">Seçiniz</option>
                <option value="Peşin">Peşin</option>
                <option value="Net 15">Net 15</option>
                <option value="Net 30">Net 30</option>
                <option value="Net 60">Net 60</option>
                <option value="50% Peşin 50% Teslimatta">50% Peşin 50% Teslimatta</option>
              </select>
            </div>

            {/* Currency */}
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
                <option value="CNY">CNY</option>
              </select>
            </div>

            {/* Lead Time */}
            <div>
              <label className="label">Teslimat Süresi (gün)</label>
              <input
                type="number"
                min="0"
                value={formData.lead_time_days}
                onChange={(e) => setFormData({ ...formData, lead_time_days: parseInt(e.target.value) || 0 })}
                className="input-field"
                placeholder="0"
              />
            </div>

            {/* MOQ */}
            <div>
              <label className="label">Minimum Sipariş Miktarı</label>
              <input
                type="number"
                min="0"
                value={formData.minimum_order_quantity}
                onChange={(e) => setFormData({ ...formData, minimum_order_quantity: parseInt(e.target.value) || 0 })}
                className="input-field"
                placeholder="0"
              />
            </div>

            {/* Rating */}
            <div>
              <label className="label">Değerlendirme</label>
              <select
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
                className="input-field"
              >
                <option value="5">⭐⭐⭐⭐⭐ (5)</option>
                <option value="4">⭐⭐⭐⭐ (4)</option>
                <option value="3">⭐⭐⭐ (3)</option>
                <option value="2">⭐⭐ (2)</option>
                <option value="1">⭐ (1)</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-5 h-5 text-blue-600"
                />
                <span className="font-medium text-gray-900">Aktif</span>
              </label>
            </div>

            {/* Notes */}
            <div className="md:col-span-2">
              <label className="label">Notlar</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="input-field"
                rows={3}
                placeholder="Tedarikçi hakkında notlar..."
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t sticky bottom-0 bg-white">
            <button type="button" onClick={onClose} className="btn-secondary" disabled={isSubmitting}>
              İptal
            </button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Kaydediliyor...' : supplier ? 'Güncelle' : 'Ekle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Suppliers;

