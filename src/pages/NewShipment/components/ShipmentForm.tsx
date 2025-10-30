import React from 'react';

interface ShipmentFormData {
  fba_shipment_id: string;
  shipment_date: string;
  carrier_company: string;
  total_shipping_cost: number;
  notes: string;
}

interface ShipmentFormProps {
  formData: ShipmentFormData;
  errors: Record<string, string>;
  onChange: (data: Partial<ShipmentFormData>) => void;
}

export const ShipmentForm: React.FC<ShipmentFormProps> = ({
  formData,
  errors,
  onChange
}) => {
  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Temel Bilgiler</h3>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="label">FBA Shipment ID *</label>
          <input
            type="text"
            value={formData.fba_shipment_id}
            onChange={(e) => onChange({ fba_shipment_id: e.target.value })}
            className={`input-field ${errors.fba_shipment_id ? 'input-error' : ''}`}
            placeholder="FBA123456789"
          />
          {errors.fba_shipment_id && <p className="error-message">{errors.fba_shipment_id}</p>}
        </div>

        <div>
          <label className="label">Sevkiyat Tarihi</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">📅</span>
            <input
              type="date"
              value={formData.shipment_date}
              onChange={(e) => onChange({ shipment_date: e.target.value })}
              className={`input-field pl-10 ${errors.shipment_date ? 'input-error' : ''}`}
            />
          </div>
          {errors.shipment_date && <p className="error-message">{errors.shipment_date}</p>}
        </div>

        <div>
          <label className="label">Kargo Firması *</label>
          <select
            value={formData.carrier_company}
            onChange={(e) => onChange({ carrier_company: e.target.value })}
            className={`filter-select ${errors.carrier_company ? 'input-error' : ''}`}
          >
            <option value="">Kargo firması seçin</option>
            <option value="UPS">UPS</option>
            <option value="FedEx">FedEx</option>
            <option value="DHL">DHL</option>
            <option value="Amazon Logistics">Amazon Logistics</option>
          </select>
          {errors.carrier_company && <p className="error-message">{errors.carrier_company}</p>}
        </div>

        <div>
          <label className="label">Toplam Kargo Maliyeti ($) *</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">💰</span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.total_shipping_cost}
              onChange={(e) => onChange({ total_shipping_cost: parseFloat(e.target.value) || 0 })}
              className={`input-field pl-10 ${errors.total_shipping_cost ? 'input-error' : ''}`}
              placeholder="0.00"
            />
          </div>
          {errors.total_shipping_cost && <p className="error-message">{errors.total_shipping_cost}</p>}
        </div>

        <div>
          <label className="label">Notlar</label>
          <div className="relative">
            <span className="absolute left-3 top-3 text-gray-400">📝</span>
            <textarea
              value={formData.notes}
              onChange={(e) => onChange({ notes: e.target.value })}
              className="input-field pl-10 h-20 resize-none"
              placeholder="Sevkiyat notları..."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

