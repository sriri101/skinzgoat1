
import { CalculatorInputs, Currency } from './types';

export const DEFAULT_INPUTS: CalculatorInputs = {
  sellingPrice: 0,
  productCost: 0,
  shippingForward: 0,
  shippingRTO: 0,
  miscCost: 0,
  
  fixedMonthlyCosts: [], 
  miscOneTimeCosts: [],

  adSpendInput: 0,
  budgetType: 'total', // Default to total budget behavior
  budgetDuration: 30,  // Default to a month
  adSchedule: [],
  
  deliveredPercentage: 70,
  costPerLead: 0,
  confirmationPercentage: 70,
  
  upsellSellingPrice: 0,
  upsellProductCost: 0,
  upsellTakeRate: 0,

  logisticsTimeline: {
    dispatchDelay: 1, // Next day
    deliveryTime: 3,  // 72 hours
    payoutDelay: 2    // 48 hours later
  }
};

export const DEFAULT_CURRENCY = Currency.MAD;

export const CHART_COLORS = {
  profit: '#10b981', // emerald-500
  loss: '#ef4444',   // red-500
  ads: '#3b82f6',    // blue-500
  cogs: '#f59e0b',   // amber-500
  shipping: '#8b5cf6', // violet-500
  misc: '#64748b',   // slate-500
  fixed: '#ec4899',  // pink-500
  extras: '#6366f1'  // indigo-500
};
