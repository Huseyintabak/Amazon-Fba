import React from 'react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

interface MonthlyData {
  month: string;
  shipments: number;
  cost: number;
}

interface MonthlyChartProps {
  data: MonthlyData[];
}

export const MonthlyChart: React.FC<MonthlyChartProps> = ({ data }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900">Aylık Performans</h3>
        <p className="text-sm text-gray-500 mt-1">Sevkiyat ve maliyet trendi</p>
      </div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorShipments" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="month" tick={{ fill: '#6B7280', fontSize: 12 }} />
            <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#FFF', 
                border: '1px solid #E5E7EB', 
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
              formatter={(value: number | string, name: string) => {
                if (name === 'cost') return [`$${value.toFixed(2)}`, 'Toplam Maliyet'];
                if (name === 'shipments') return [value, 'Sevkiyat'];
                return [value, name];
              }}
            />
            <Area 
              type="monotone" 
              dataKey="shipments" 
              stroke="#3B82F6" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorShipments)" 
              name="Sevkiyat"
            />
            <Area 
              type="monotone" 
              dataKey="cost" 
              stroke="#10B981" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorCost)" 
              name="Maliyet"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

