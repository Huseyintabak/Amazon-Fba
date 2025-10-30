import React from 'react';
import DateRangePicker, { DateRange } from '../../../components/DateRangePicker';

interface ReportFiltersProps {
  dateRange: DateRange;
  selectedCarrier: string;
  selectedStatus: string;
  onDateRangeChange: (range: DateRange) => void;
  onCarrierChange: (carrier: string) => void;
  onStatusChange: (status: string) => void;
}

export const ReportFilters: React.FC<ReportFiltersProps> = ({
  dateRange,
  selectedCarrier,
  selectedStatus,
  onDateRangeChange,
  onCarrierChange,
  onStatusChange
}) => {
  return (
    <div className="card">
      <h3 className="card-title mb-4">Filtreler</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="label">Tarih Aralığı</label>
          <DateRangePicker
            value={dateRange}
            onChange={onDateRangeChange}
          />
        </div>
        <div>
          <label className="label">Kargo Firması</label>
          <select
            value={selectedCarrier}
            onChange={(e) => onCarrierChange(e.target.value)}
            className="filter-select"
          >
            <option value="all">Tüm Kargo Firmaları</option>
            <option value="UPS">UPS</option>
            <option value="FedEx">FedEx</option>
            <option value="DHL">DHL</option>
            <option value="Amazon Logistics">Amazon Logistics</option>
          </select>
        </div>
        <div>
          <label className="label">Durum</label>
          <select
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            className="filter-select"
          >
            <option value="all">Tüm Durumlar</option>
            <option value="completed">Tamamlandı</option>
            <option value="draft">Taslak</option>
          </select>
        </div>
      </div>
    </div>
  );
};

