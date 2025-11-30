import { CalculatorInputs, Currency } from './types';

export const DEFAULT_INPUTS: CalculatorInputs = {
  sellingPrice: 400,
  productCost: 100,
  shippingForward: 30,
  shippingRTO: 0,
  miscCost: 10,
  totalAdSpend: 5000,
  deliveredPercentage: 70,
  costPerLead: 15,
  confirmationPercentage: 50,
};

export const DEFAULT_CURRENCY = Currency.MAD;

export const CHART_COLORS = {
  profit: '#10b981', // emerald-500
  loss: '#ef4444',   // red-500
  ads: '#3b82f6',    // blue-500
  cogs: '#f59e0b',   // amber-500
  shipping: '#8b5cf6', // violet-500
  misc: '#64748b'    // slate-500
};