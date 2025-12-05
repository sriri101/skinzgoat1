
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { CHART_COLORS } from '../constants';

interface DataPoint {
  name: string;
  value: number;
}

interface DonutChartProps {
  data: DataPoint[];
}

export const DonutChart: React.FC<DonutChartProps> = ({ data }) => {
  // Map colors based on names or order
  const getColor = (name: string) => {
    switch (name) {
      case 'Product Cost': return CHART_COLORS.cogs;
      case 'Shipping': return CHART_COLORS.shipping;
      case 'Ads': return CHART_COLORS.ads;
      case 'Misc': return CHART_COLORS.misc;
      case 'Fixed Costs': return CHART_COLORS.fixed;
      case 'Extra Expenses': return CHART_COLORS.extras;
      case 'Profit': return CHART_COLORS.profit;
      default: return '#cbd5e1';
    }
  };

  const filteredData = data.filter(d => d.value > 0);

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={filteredData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
            stroke="none"
          >
            {filteredData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getColor(entry.name)} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number) => value.toLocaleString()}
            contentStyle={{ 
              borderRadius: '8px', 
              border: '1px solid #334155', 
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              backgroundColor: '#1e293b',
              color: '#f8fafc'
            }}
            itemStyle={{ color: '#f8fafc' }}
          />
          <Legend verticalAlign="bottom" height={36}/>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
