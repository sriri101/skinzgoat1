
import { CalculatorInputs, Currency } from './types';

export const DEFAULT_INPUTS: CalculatorInputs = {
  sellingPrice: 0,
  productCost: 0,
  shippingForward: 0,
  shippingRTO: 0,
  miscCost: 0,
  totalAdSpend: 0,
  deliveredPercentage: 70,
  costPerLead: 0,
  confirmationPercentage: 70,
  
  upsellSellingPrice: 0,
  upsellProductCost: 0,
  upsellTakeRate: 0,
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