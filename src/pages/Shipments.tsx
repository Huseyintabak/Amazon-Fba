import React, { useState, useMemo } from 'react';
import { getProductsByShipment } from '../lib/mockData';
import { Shipment } from '../types';
import { useStore } from '../stores/useStore';
import { useFilterPresets } from '../hooks/useFilterPresets';
import AdvancedFiltersPanel, { AdvancedFilters, FilterPreset } from '../components/AdvancedFiltersPanel';
import LoadingSpinner from '../components/LoadingSpinner';
// import { validateShipment, ValidationResult } from '../lib/validation';

const Shipments: React.FC = () => {
  const { shipments, deleteShipment, loadShipments } = useStore();
  const { presets, savePreset, deletePreset } = useFilterPresets('shipments');
  const [filters, setFilters] = useState<AdvancedFilters>({});
  const [showDeleteModal, setShowDeleteModal] = useState<Shipment | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  // const [validationErrors, setValidationErrors] = useState<ValidationResult | null>(null);

  // Load shipments on component mount
  React.useEffect(() => {
    loadShipments();
  }, [loadShipments]);

  // Apply advanced filters
  const filteredShipments = useMemo(() => {
    let filtered = [...shipments];

    // Date range filter
    if (filters.dateRange?.startDate && filters.dateRange?.endDate) {
      filtered = filtered.filter(s => {
        const shipmentDate = new Date(s.shipment_date);
        const start = new Date(filters.dateRange!.startDate);
        const end = new Date(filters.dateRange!.endDate);
        end.setHours(23, 59, 59, 999);
        return shipmentDate >= start && shipmentDate <= end;
      });
    }

    // Search term
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(s =>
        s.fba_shipment_id.toLowerCase().includes(term) ||
        s.carrier_company.toLowerCase().includes(term) ||
        s.notes?.toLowerCase().includes(term)
      );
    }

    // Status filter
    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(s => s.status === filters.status);
    }

    // Carrier filter
    if (filters.carrier && filters.carrier !== 'all') {
      filtered = filtered.filter(s => s.carrier_company === filters.carrier);
    }

    return filtered;
  }, [shipments, filters]);

  const handleLoadPreset = (preset: FilterPreset) => {
    setFilters(preset.filters);
  };

  const handleDelete = async (shipmentId: string) => {
    try {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
      deleteShipment(shipmentId);
      setShowDeleteModal(null);
    } catch (error) {
      console.error('Error deleting shipment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="badge badge-success">Tamamlandı</span>;
      case 'draft':
        return <span className="badge badge-warning">Taslak</span>;
      default:
        return <span className="badge badge-gray">{status}</span>;
    }
  };

  const getCarrierIcon = (carrier: string) => {
    switch (carrier.toLowerCase()) {
      case 'ups':
        return <span className="text-brown-600">🚚</span>;
      case 'fedex':
        return <span className="text-purple-600">🚚</span>;
      case 'dhl':
        return <span className="text-red-600">🚚</span>;
      default:
        return <span className="text-gray-600">🚚</span>;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <LoadingSpinner fullScreen text="Sevkiyatlar yükleniyor..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sevkiyat Yönetimi</h1>
          <p className="mt-2 text-sm text-gray-600">
            Sevkiyatlarınızı görüntüleyin, düzenleyin ve yönetin
          </p>
        </div>
        <button
          onClick={() => window.location.href = '/shipments/new'}
          className="mt-4 sm:mt-0 btn-primary flex items-center space-x-2"
        >
          <span>➕</span>
          <span>Yeni Sevkiyat</span>
        </button>
      </div>

      {/* Advanced Filters */}
      <AdvancedFiltersPanel
        filters={filters}
        onChange={setFilters}
        onSavePreset={savePreset}
        savedPresets={presets}
        onLoadPreset={handleLoadPreset}
        onDeletePreset={deletePreset}
        type="shipments"
      />

      {/* Shipments Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            Sevkiyatlar ({filteredShipments.length})
          </h3>
          <p className="card-subtitle">
            Toplam {shipments.length} sevkiyat
            {Object.keys(filters).length > 0 && ` • ${filteredShipments.length} filtrelenmiş sonuç`}
          </p>
        </div>

        <div className="mobile-table">
          <table className="table">
            <thead className="table-header">
              <tr>
                <th className="table-header-cell">FBA Shipment ID</th>
                <th className="table-header-cell">Tarih</th>
                <th className="table-header-cell">Kargo Firması</th>
                <th className="table-header-cell">Maliyet</th>
                <th className="table-header-cell">Durum</th>
                <th className="table-header-cell">Notlar</th>
                <th className="table-header-cell">İşlemler</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {filteredShipments.map((shipment) => {
                const shipmentItems = getProductsByShipment(shipment.id);
                const totalItems = shipmentItems.reduce((sum, item) => sum + item.quantity, 0);
                
                return (
                  <tr key={shipment.id} className="table-row">
                    <td className="table-cell">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <span className="text-2xl text-gray-400">🚚</span>
                      </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {shipment.fba_shipment_id}
                          </div>
                          <div className="text-sm text-gray-500">
                            {totalItems} ürün
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-400">📅</span>
                        <span className="text-sm">
                          {new Date(shipment.shipment_date).toLocaleDateString('tr-TR')}
                        </span>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center space-x-2">
                        {getCarrierIcon(shipment.carrier_company)}
                        <span className="font-medium">{shipment.carrier_company}</span>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center space-x-2">
                        <span className="text-green-600">💰</span>
                        <span className="font-semibold text-green-600">
                          ${shipment.total_shipping_cost.toFixed(2)}
                        </span>
                      </div>
                    </td>
                    <td className="table-cell">
                      {getStatusBadge(shipment.status)}
                    </td>
                    <td className="table-cell">
                      {shipment.notes ? (
                        <div className="max-w-xs truncate text-sm text-gray-600">
                          {shipment.notes}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center space-x-2">
                      <button
                        onClick={() => window.location.href = `/shipments/${shipment.id}`}
                        className="action-btn action-btn-view"
                        title="Detayları Görüntüle"
                      >
                        👁️
                      </button>
                      <button
                        onClick={() => window.location.href = `/shipments/${shipment.id}/edit`}
                        className="action-btn action-btn-edit"
                        title="Düzenle"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => setShowDeleteModal(shipment)}
                        className="action-btn action-btn-delete"
                        title="Sil"
                      >
                        🗑️
                      </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredShipments.length === 0 && (
          <div className="text-center py-12">
            <span className="mx-auto text-6xl text-gray-400">🚚</span>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Sevkiyat bulunamadı
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Arama kriterlerinize uygun sevkiyat bulunmamaktadır.
            </p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <DeleteModal
          shipment={showDeleteModal}
          onClose={() => setShowDeleteModal(null)}
          onConfirm={() => handleDelete(showDeleteModal.id)}
        />
      )}
    </div>
  );
};

// Delete Confirmation Modal
interface DeleteModalProps {
  shipment: Shipment;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteModal: React.FC<DeleteModalProps> = ({ shipment, onClose, onConfirm }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Sevkiyatı Sil
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ❌
          </button>
        </div>

        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-4">
            Bu sevkiyatı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
          </p>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900">{shipment.fba_shipment_id}</h4>
            <p className="text-sm text-gray-600">{shipment.carrier_company}</p>
            <p className="text-sm text-gray-600">${shipment.total_shipping_cost.toFixed(2)}</p>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="btn-secondary"
          >
            İptal
          </button>
          <button
            onClick={onConfirm}
            className="btn-danger"
          >
            Sil
          </button>
        </div>
      </div>
    </div>
  );
};

export default Shipments;
