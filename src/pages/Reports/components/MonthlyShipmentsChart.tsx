import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface MonthlyData {
  month: string;
  shipments: number;
}

interface MonthlyShipmentsChartProps {
  data: MonthlyData[];
}

export const MonthlyShipmentsChart: React.FC<MonthlyShipmentsChartProps> = ({ data }) => {
  return (
    <div className="card">
      <h3 className="card-title mb-4">Aylık Sevkiyat Dağılımı</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="shipments" fill="#3B82F6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

