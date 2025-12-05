
import React, { useState } from 'react';
import { Plus, Trash2, Receipt, Calendar, X, ChevronRight } from 'lucide-react';
import { MiscOneTimeCost, Currency } from '../types';
import { formatCurrency } from '../utils/calculations';

interface MiscExpenseManagerProps {
  expenses: MiscOneTimeCost[];
  onChange: (events: MiscOneTimeCost[]) => void;
  currency: Currency;
  maxDays: number;
}

export const MiscExpenseManager: React.FC<MiscExpenseManagerProps> = ({ expenses, onChange, currency, maxDays }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Form State
  const [day, setDay] = useState<number>(1);
  const [description, setDescription] = useState<string>('');
  const [amount, setAmount] = useState<number>(0);

  const addExpense = () => {
    if (amount <= 0) return;
    
    const newExpense: MiscOneTimeCost = {
      id: Math.random().toString(36).substr(2, 9),
      day,
      amount,
      description: description || 'Miscellaneous'
    };
    
    const updatedExpenses = [...expenses, newExpense].sort((a, b) => a.day - b.day);
    onChange(updatedExpenses);
    
    // Reset form
    setAmount(0);
    setDescription('');
  };

  const removeExpense = (id: string) => {
    onChange(expenses.filter(e => e.id !== id));
  };

  const totalExtraCost = expenses.reduce((sum, item) => sum + item.amount, 0);

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-indigo-500 hover:ring-1 hover:ring-indigo-500 transition-all group shadow-sm text-left"
      >
        <div className="flex items-center gap-3">
           <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-md text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 transition-colors">
              <Receipt className="w-4 h-4" />
           </div>
           <div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Variable Expenses</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                 {expenses.length > 0 
                    ? `${expenses.length} items • ${formatCurrency(totalExtraCost, currency)}`
                    : "Track daily operational costs"}
              </p>
           </div>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
      </button>

      {/* Popup Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
           <div 
             className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-lg border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
             onClick={(e) => e.stopPropagation()}
           >
              {/* Header */}
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950/50">
                <div className="flex items-center gap-2">
                   <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/30 rounded text-indigo-600 dark:text-indigo-400">
                      <Receipt className="w-4 h-4"/> 
                   </div>
                   <h3 className="text-md font-bold text-slate-800 dark:text-white">Manage Daily Expenses</h3>
                </div>
                <button 
                  onClick={() => setIsOpen(false)} 
                  className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-4 overflow-y-auto">
                 {/* List of Expenses */}
                 <div className="space-y-2 mb-6">
                    {expenses.length === 0 && (
                      <div className="text-center py-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
                        <Receipt className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">No expenses added yet.</p>
                        <p className="text-xs text-slate-400">Add daily one-off costs like tools, fees, or labor.</p>
                      </div>
                    )}
                    {expenses.map((item) => (
                      <div key={item.id} className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-3">
                          <div className="flex flex-col items-center justify-center min-w-[40px] h-[40px] bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
                             <span className="text-[10px] uppercase text-slate-400 font-bold leading-none">Day</span>
                             <span className="text-sm font-bold text-slate-800 dark:text-white leading-none mt-0.5">{item.day}</span>
                          </div>
                          <div>
                             <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                               {item.description}
                             </p>
                             <p className="text-xs text-slate-500 font-medium">
                               {formatCurrency(item.amount, currency)}
                             </p>
                          </div>
                        </div>
                        <button 
                          onClick={() => removeExpense(item.id)} 
                          className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                 </div>

                 {/* Add Form */}
                 <div className="bg-slate-50 dark:bg-slate-800/30 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                    <p className="text-xs font-bold uppercase text-slate-500 mb-3 tracking-wider">Add New Expense</p>
                    <div className="grid grid-cols-12 gap-3 items-end">
                       <div className="col-span-3 sm:col-span-2">
                          <label className="text-[10px] font-medium text-slate-500 block mb-1">Day</label>
                          <input 
                            type="number" 
                            min={1} 
                            max={maxDays} 
                            value={day} 
                            onChange={(e) => setDay(parseInt(e.target.value) || 1)}
                            className="w-full text-sm p-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                          />
                       </div>
                       <div className="col-span-9 sm:col-span-6">
                          <label className="text-[10px] font-medium text-slate-500 block mb-1">Description</label>
                          <input 
                            type="text" 
                            placeholder="e.g. Extra Tool"
                            value={description} 
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full text-sm p-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                          />
                       </div>
                       <div className="col-span-8 sm:col-span-3">
                          <label className="text-[10px] font-medium text-slate-500 block mb-1">Amount</label>
                          <input 
                            type="number" 
                            min={0}
                            step={10}
                            value={amount} 
                            onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                            className="w-full text-sm p-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                          />
                       </div>
                       <div className="col-span-4 sm:col-span-1">
                          <button 
                            onClick={addExpense}
                            disabled={amount <= 0}
                            className="w-full h-[38px] flex items-center justify-center bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm"
                          >
                             <Plus className="w-5 h-5" />
                          </button>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-end">
                <button 
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Done
                </button>
              </div>
           </div>
        </div>
      )}
    </>
  );
};
