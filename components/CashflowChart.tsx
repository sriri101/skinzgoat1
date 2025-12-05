
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Brush, Label } from 'recharts';
import { DayFlow, Currency } from '../types';
import { formatCurrency } from '../utils/calculations';

interface CashflowChartProps {
  data: DayFlow[];
  currency: Currency;
  isDarkMode: boolean;
  peakCapitalDay?: number;
  roiDay?: number | null;
}

export const CashflowChart: React.FC<CashflowChartProps> = ({ data, currency, isDarkMode, peakCapitalDay, roiDay }) => {
  const gradientOffset = () => {
    const dataMax = Math.max(...data.map((i) => i.balance));
    const dataMin = Math.min(...data.map((i) => i.balance));

    if (dataMax <= 0) {
      return 0;
    }
    if (dataMin >= 0) {
      return 1;
    }

    return dataMax / (dataMax - dataMin);
  };

  const off = gradientOffset();

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 10,
            right: 10,
            left: 0,
            bottom: 0,
          }}
        >
          <defs>
            <linearGradient id="splitColor" x1="0" y1="0" x2="0" y2="1">
              <stop offset={off} stopColor="#10b981" stopOpacity={0.3} />
              <stop offset={off} stopColor="#ef4444" stopOpacity={0.3} />
            </linearGradient>
            <linearGradient id="splitStroke" x1="0" y1="0" x2="0" y2="1">
                <stop offset={off} stopColor="#10b981" stopOpacity={1} />
                <stop offset={off} stopColor="#ef4444" stopOpacity={1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#334155" : "#e2e8f0"} vertical={false} />
          <XAxis 
            dataKey="day" 
            tick={{ fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 12 }} 
            tickLine={false}
            axisLine={false}
            label={{ value: 'Days', position: 'insideBottomRight', offset: -5, fill: isDarkMode ? '#94a3b8' : '#64748b' }}
          />
          <YAxis 
            tick={{ fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(val) => `${currency}${val/1000}k`}
          />
          <Tooltip 
            formatter={(value: number) => formatCurrency(value, currency)}
            labelFormatter={(day) => `Day ${day}`}
            contentStyle={{ 
              backgroundColor: isDarkMode ? '#1e293b' : '#fff',
              borderColor: isDarkMode ? '#334155' : '#e2e8f0',
              color: isDarkMode ? '#fff' : '#0f172a',
              borderRadius: '8px'
            }}
          />
          <ReferenceLine y={0} stroke={isDarkMode ? "#94a3b8" : "#64748b"} strokeDasharray="3 3" />
          
          {peakCapitalDay !== undefined && peakCapitalDay > 0 && (
             <ReferenceLine x={peakCapitalDay} stroke="#f59e0b" strokeDasharray="3 3" label={{ position: 'top', value: 'Max Inv', fill: '#f59e0b', fontSize: 10 }} />
          )}
          {roiDay !== undefined && roiDay !== null && (
             <ReferenceLine x={roiDay} stroke="#10b981" strokeDasharray="3 3" label={{ position: 'top', value: 'Profit Start', fill: '#10b981', fontSize: 10 }} />
          )}

          <Area
            type="monotone"
            dataKey="balance"
            stroke="url(#splitStroke)"
            strokeWidth={2}
            fill="url(#splitColor)"
            name="Bank Balance"
            animationDuration={500}
          />
          <Brush 
            dataKey="day" 
            height={30} 
            stroke={isDarkMode ? "#6366f1" : "#818cf8"} 
            fill={isDarkMode ? "#1e293b" : "#f1f5f9"}
            tickFormatter={(day) => `Day ${day}`}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
