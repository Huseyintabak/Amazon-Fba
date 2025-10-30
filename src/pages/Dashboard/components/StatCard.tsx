import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  trend?: number;
  subtitle?: string;
  color: string;
  trendLabel?: string;
}

// Helper function to convert color names to bg colors
const getBackgroundColor = (colorClass: string): string => {
  const mapping: Record<string, string> = {
    'text-blue-600': 'bg-blue-50',
    'text-green-600': 'bg-green-50',
    'text-emerald-600': 'bg-emerald-50',
    'text-purple-600': 'bg-purple-50',
  };
  return mapping[colorClass] || 'bg-gray-50';
};

export const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon, 
  trend, 
  subtitle, 
  color,
  trendLabel 
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className={`text-3xl font-bold ${color} mb-2`}>{value}</p>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
          {trend !== undefined && (
            <div className={`inline-flex items-center text-xs font-semibold mt-2 px-2 py-1 rounded-full ${
              trend >= 0 
                ? 'bg-green-50 text-green-700' 
                : 'bg-red-50 text-red-700'
            }`}>
              <span className="mr-1">{trend >= 0 ? '↑' : '↓'}</span>
              {Math.abs(trend).toFixed(1)}% vs {trendLabel}
            </div>
          )}
        </div>
        <div className={`w-14 h-14 rounded-xl ${getBackgroundColor(color)} flex items-center justify-center`}>
          <span className="text-3xl">{icon}</span>
        </div>
      </div>
    </div>
  );
};

