import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface MonthlyData {
  month: string;
  shipping_cost: number;
}

interface MonthlyCostTrendChartProps {
  data: MonthlyData[];
}

export const MonthlyCostTrendChart: React.FC<MonthlyCostTrendChartProps> = ({ data }) => {
  return (
    <div className="card">
      <h3 className="card-title mb-4">Aylık Kargo Maliyeti Trendi</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value) => [`$${value}`, 'Maliyet']} />
            <Area type="monotone" dataKey="shipping_cost" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

