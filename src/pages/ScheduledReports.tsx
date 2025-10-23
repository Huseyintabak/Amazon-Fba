import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

interface ScheduledReport {
  id?: string;
  user_id?: string;
  report_type: string;
  frequency: string;
  email: string;
  is_active: boolean;
  next_run?: string;
  last_run?: string;
  created_at?: string;
}

const ScheduledReports: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [reports, setReports] = useState<ScheduledReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<ScheduledReport>({
    report_type: 'dashboard',
    frequency: 'weekly',
    email: user?.email || '',
    is_active: true
  });

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setIsLoading(true);
      // Simulated data - in production, this would be from a database table
      const mockReports: ScheduledReport[] = [];
      setReports(mockReports);
    } catch (error: any) {
      showToast(`Hata: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Simulated - in production, this would save to database
      const newReport: ScheduledReport = {
        ...formData,
        id: Date.now().toString(),
        user_id: user?.id,
        created_at: new Date().toISOString(),
        next_run: calculateNextRun(formData.frequency)
      };
      
      setReports([...reports, newReport]);
      showToast('Planlanmış rapor oluşturuldu! (Demo Mode)', 'success');
      setShowModal(false);
      resetForm();
    } catch (error: any) {
      showToast(`Hata: ${error.message}`, 'error');
    }
  };

  const calculateNextRun = (frequency: string): string => {
    const now = new Date();
    switch (frequency) {
      case 'daily':
        now.setDate(now.getDate() + 1);
        break;
      case 'weekly':
        now.setDate(now.getDate() + 7);
        break;
      case 'monthly':
        now.setMonth(now.getMonth() + 1);
        break;
    }
    return now.toISOString();
  };

  const resetForm = () => {
    setFormData({
      report_type: 'dashboard',
      frequency: 'weekly',
      email: user?.email || '',
      is_active: true
    });
  };

  const toggleActive = (id: string) => {
    setReports(reports.map(r => 
      r.id === id ? { ...r, is_active: !r.is_active } : r
    ));
    showToast('Rapor durumu güncellendi', 'success');
  };

  const deleteReport = (id: string) => {
    if (!confirm('Bu raporu silmek istediğinizden emin misiniz?')) return;
    setReports(reports.filter(r => r.id !== id));
    showToast('Rapor silindi', 'success');
  };

  const reportTypes = [
    { value: 'dashboard', label: '📊 Dashboard Özeti', description: 'Genel performans özeti' },
    { value: 'products', label: '📦 Ürün Raporu', description: 'Ürün stok ve satış bilgileri' },
    { value: 'suppliers', label: '🏭 Tedarikçi Raporu', description: 'Tedarikçi performans analizi' },
    { value: 'purchase_orders', label: '🛒 Satın Alma Raporu', description: 'PO durumu ve maliyetler' },
    { value: 'financial', label: '💰 Finansal Rapor', description: 'Gelir, gider ve kar analizi' }
  ];

  const frequencies = [
    { value: 'daily', label: 'Günlük', icon: '📅' },
    { value: 'weekly', label: 'Haftalık', icon: '📆' },
    { value: 'monthly', label: 'Aylık', icon: '📊' }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📧 Planlanmış Raporlar</h1>
          <p className="text-gray-600 mt-1">Otomatik rapor planlaması ve email bildirim ayarları</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <span>➕</span>
          <span>Yeni Rapor Planla</span>
        </button>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start space-x-3">
          <span className="text-2xl">ℹ️</span>
          <div>
            <h3 className="font-semibold text-blue-900">Demo Mode</h3>
            <p className="text-sm text-blue-700 mt-1">
              Bu özellik şu anda demo modda. Production'da Supabase Edge Functions ile email gönderimi aktif olacak.
              Planladığınız raporlar kayıt edilecek ancak email gönderilmeyecek.
            </p>
          </div>
        </div>
      </div>

      {/* Scheduled Reports */}
      {reports.length === 0 ? (
        <div className="card text-center py-12">
          <span className="text-6xl">📧</span>
          <h3 className="mt-4 text-lg font-medium text-gray-900">Henüz planlanmış rapor yok</h3>
          <p className="mt-2 text-sm text-gray-500">
            İlk raporunuzu planlayarak düzenli bildirimler almaya başlayın
          </p>
          <button onClick={() => setShowModal(true)} className="mt-4 btn-primary">
            ➕ İlk Raporu Planla
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => {
            const reportType = reportTypes.find(rt => rt.value === report.report_type);
            const frequency = frequencies.find(f => f.value === report.frequency);
            
            return (
              <div key={report.id} className="card">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900">{reportType?.label}</h3>
                    <p className="text-sm text-gray-600 mt-1">{reportType?.description}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleActive(report.id!)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        report.is_active 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {report.is_active ? '✓ Aktif' : '⏸ Pasif'}
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <span>{frequency?.icon}</span>
                    <span className="text-gray-600">Sıklık:</span>
                    <span className="font-semibold">{frequency?.label}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>📧</span>
                    <span className="text-gray-600">Email:</span>
                    <span className="font-semibold text-xs">{report.email}</span>
                  </div>
                  {report.next_run && (
                    <div className="flex items-center space-x-2">
                      <span>⏰</span>
                      <span className="text-gray-600">Sonraki:</span>
                      <span className="font-semibold">
                        {new Date(report.next_run).toLocaleDateString('tr-TR')}
                      </span>
                    </div>
                  )}
                  {report.last_run && (
                    <div className="flex items-center space-x-2">
                      <span>✅</span>
                      <span className="text-gray-600">Son gönderim:</span>
                      <span className="font-semibold">
                        {new Date(report.last_run).toLocaleDateString('tr-TR')}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2 mt-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => deleteReport(report.id!)}
                    className="flex-1 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    🗑️ Sil
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content max-w-2xl">
            <h3 className="text-xl font-bold mb-6">📧 Yeni Planlanmış Rapor</h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="label required">Rapor Türü</label>
                <div className="space-y-2">
                  {reportTypes.map(type => (
                    <label
                      key={type.value}
                      className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        formData.report_type === type.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-200'
                      }`}
                    >
                      <input
                        type="radio"
                        name="report_type"
                        value={type.value}
                        checked={formData.report_type === type.value}
                        onChange={(e) => setFormData({ ...formData, report_type: e.target.value })}
                        className="mt-1"
                      />
                      <div className="ml-3">
                        <div className="font-semibold">{type.label}</div>
                        <div className="text-sm text-gray-600">{type.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="label required">Gönderim Sıklığı</label>
                <div className="grid grid-cols-3 gap-3">
                  {frequencies.map(freq => (
                    <label
                      key={freq.value}
                      className={`flex flex-col items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        formData.frequency === freq.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-200'
                      }`}
                    >
                      <input
                        type="radio"
                        name="frequency"
                        value={freq.value}
                        checked={formData.frequency === freq.value}
                        onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                        className="sr-only"
                      />
                      <span className="text-3xl mb-2">{freq.icon}</span>
                      <span className="font-semibold">{freq.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="label required">Email Adresi</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-field"
                  placeholder="ornek@email.com"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Raporlar bu email adresine gönderilecek
                </p>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  📧 Raporu Planla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduledReports;

