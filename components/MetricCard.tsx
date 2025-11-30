import React from 'react';

interface MetricCardProps {
  label: string;
  value: string;
  trend?: 'positive' | 'negative' | 'neutral';
  subValue?: string;
  highlight?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({ label, value, trend, subValue, highlight }) => {
  let valueColor = 'text-slate-900 dark:text-white';
  if (trend === 'positive') valueColor = 'text-emerald-600 dark:text-emerald-400';
  if (trend === 'negative') valueColor = 'text-rose-600 dark:text-rose-400';

  return (
    <div className={`p-4 rounded-xl shadow-sm border ${
      highlight 
        ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800' 
        : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700'
    }`}>
      <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">{label}</p>
      <p className={`mt-2 text-2xl font-bold ${valueColor}`}>{value}</p>
      {subValue && <p className="mt-1 text-xs text-slate-500 dark:text-slate-500 font-medium">{subValue}</p>}
    </div>
  );
};