
import React, { useState } from 'react';
import { Plus, Trash2, TrendingUp, Zap } from 'lucide-react';
import { AdScheduleEvent, Currency } from '../types';
import { formatCurrency } from '../utils/calculations';

interface AdScheduleManagerProps {
  events: AdScheduleEvent[];
  onChange: (events: AdScheduleEvent[]) => void;
  currency: Currency;
  maxDays: number;
}

export const AdScheduleManager: React.FC<AdScheduleManagerProps> = ({ events, onChange, currency, maxDays }) => {
  const [day, setDay] = useState<number>(Math.min(2, maxDays));
  const [type, setType] = useState<'increase_daily' | 'one_time_injection'>('increase_daily');
  const [amount, setAmount] = useState<number>(0);

  const addEvent = () => {
    if (amount <= 0) return;
    
    const newEvent: AdScheduleEvent = {
      id: Math.random().toString(36).substr(2, 9),
      day,
      type,
      amount
    };
    
    const updatedEvents = [...events, newEvent].sort((a, b) => a.day - b.day);
    onChange(updatedEvents);
    
    // Reset form mostly, keep type
    setAmount(0);
  };

  const removeEvent = (id: string) => {
    onChange(events.filter(e => e.id !== id));
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
        <h4 className="text-sm font-bold text-slate-800 dark:text-white">Budget Scaling & Injection</h4>
      </div>

      {/* List of Events */}
      <div className="space-y-2 mb-4">
        {events.length === 0 && (
          <p className="text-xs text-slate-500 italic text-center py-2">No scheduled budget changes.</p>
        )}
        {events.map((event) => (
          <div key={event.id} className="flex items-center justify-between bg-white dark:bg-slate-800 p-2 rounded border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className={`p-1.5 rounded-full ${event.type === 'increase_daily' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                 {event.type === 'increase_daily' ? <TrendingUp className="w-3 h-3"/> : <Zap className="w-3 h-3"/>}
              </div>
              <div className="text-xs">
                 <p className="font-semibold text-slate-700 dark:text-slate-200">
                   Day {event.day}: {event.type === 'increase_daily' ? 'Increase Daily Spend' : 'One-time Injection'}
                 </p>
                 <p className="text-slate-500">
                   +{formatCurrency(event.amount, currency)}
                 </p>
              </div>
            </div>
            <button onClick={() => removeEvent(event.id)} className="text-slate-400 hover:text-rose-500 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Add Form */}
      <div className="grid grid-cols-12 gap-2 items-end">
         <div className="col-span-3">
            <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Day</label>
            <input 
              type="number" 
              min={1} 
              max={maxDays} 
              value={day} 
              onChange={(e) => setDay(parseInt(e.target.value))}
              className="w-full text-xs p-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            />
         </div>
         <div className="col-span-5">
            <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Action</label>
            <select 
              value={type} 
              onChange={(e) => setType(e.target.value as any)}
              className="w-full text-xs p-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            >
              <option value="increase_daily">Increase Daily (+)</option>
              <option value="one_time_injection">Inject Once (+)</option>
            </select>
         </div>
         <div className="col-span-3">
            <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Amount</label>
            <input 
              type="number" 
              min={0}
              step={100}
              value={amount} 
              onChange={(e) => setAmount(parseFloat(e.target.value))}
              className="w-full text-xs p-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            />
         </div>
         <div className="col-span-1">
            <button 
              onClick={addEvent}
              disabled={amount <= 0}
              className="w-full h-[34px] flex items-center justify-center bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
            >
               <Plus className="w-4 h-4" />
            </button>
         </div>
      </div>
    </div>
  );
};
