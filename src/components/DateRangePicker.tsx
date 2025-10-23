import React, { useState } from 'react';

export interface DateRange {
  startDate: string;
  endDate: string;
  preset?: string;
}

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  className?: string;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({ value, onChange, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);

  const presets = [
    { label: 'Bugün', value: 'today' },
    { label: 'Dün', value: 'yesterday' },
    { label: 'Son 7 Gün', value: 'last7days' },
    { label: 'Son 30 Gün', value: 'last30days' },
    { label: 'Son 90 Gün', value: 'last90days' },
    { label: 'Bu Ay', value: 'thisMonth' },
    { label: 'Geçen Ay', value: 'lastMonth' },
    { label: 'Bu Yıl', value: 'thisYear' },
    { label: 'Geçen Yıl', value: 'lastYear' },
    { label: 'Tüm Zamanlar', value: 'allTime' },
  ];

  const getPresetDates = (preset: string): DateRange => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    switch (preset) {
      case 'today': {
        return { startDate: todayStr, endDate: todayStr, preset };
      }
      case 'yesterday': {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        return { startDate: yesterdayStr, endDate: yesterdayStr, preset };
      }
      case 'last7days': {
        const start = new Date(today);
        start.setDate(start.getDate() - 6);
        return { 
          startDate: start.toISOString().split('T')[0], 
          endDate: todayStr,
          preset 
        };
      }
      case 'last30days': {
        const start = new Date(today);
        start.setDate(start.getDate() - 29);
        return { 
          startDate: start.toISOString().split('T')[0], 
          endDate: todayStr,
          preset 
        };
      }
      case 'last90days': {
        const start = new Date(today);
        start.setDate(start.getDate() - 89);
        return { 
          startDate: start.toISOString().split('T')[0], 
          endDate: todayStr,
          preset 
        };
      }
      case 'thisMonth': {
        const start = new Date(today.getFullYear(), today.getMonth(), 1);
        return { 
          startDate: start.toISOString().split('T')[0], 
          endDate: todayStr,
          preset 
        };
      }
      case 'lastMonth': {
        const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const end = new Date(today.getFullYear(), today.getMonth(), 0);
        return { 
          startDate: start.toISOString().split('T')[0], 
          endDate: end.toISOString().split('T')[0],
          preset 
        };
      }
      case 'thisYear': {
        const start = new Date(today.getFullYear(), 0, 1);
        return { 
          startDate: start.toISOString().split('T')[0], 
          endDate: todayStr,
          preset 
        };
      }
      case 'lastYear': {
        const start = new Date(today.getFullYear() - 1, 0, 1);
        const end = new Date(today.getFullYear() - 1, 11, 31);
        return { 
          startDate: start.toISOString().split('T')[0], 
          endDate: end.toISOString().split('T')[0],
          preset 
        };
      }
      case 'allTime': {
        return { 
          startDate: '2020-01-01', 
          endDate: todayStr,
          preset 
        };
      }
      default:
        return value;
    }
  };

  const handlePresetClick = (preset: string) => {
    const range = getPresetDates(preset);
    onChange(range);
    setIsOpen(false);
  };

  const handleCustomDateChange = (field: 'startDate' | 'endDate', date: string) => {
    onChange({
      ...value,
      [field]: date,
      preset: undefined
    });
  };

  const getDisplayText = () => {
    if (value.preset) {
      const preset = presets.find(p => p.value === value.preset);
      return preset ? preset.label : 'Tarih Aralığı Seç';
    }
    
    if (value.startDate && value.endDate) {
      const start = new Date(value.startDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' });
      const end = new Date(value.endDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' });
      return `${start} - ${end}`;
    }
    
    return 'Tarih Aralığı Seç';
  };

  return (
    <div className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
      >
        <span className="mr-2">📅</span>
        <span>{getDisplayText()}</span>
        <span className="ml-2">{isOpen ? '▲' : '▼'}</span>
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Content */}
          <div className="absolute z-20 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
            <div className="grid grid-cols-2 divide-x divide-gray-200">
              {/* Presets */}
              <div className="p-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Hızlı Seçim</h4>
                <div className="space-y-1">
                  {presets.map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => handlePresetClick(preset.value)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        value.preset === preset.value
                          ? 'bg-blue-50 text-blue-700 font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Date Inputs */}
              <div className="p-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Özel Tarih</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Başlangıç Tarihi
                    </label>
                    <input
                      type="date"
                      value={value.startDate}
                      onChange={(e) => handleCustomDateChange('startDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Bitiş Tarihi
                    </label>
                    <input
                      type="date"
                      value={value.endDate}
                      onChange={(e) => handleCustomDateChange('endDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Uygula
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DateRangePicker;

