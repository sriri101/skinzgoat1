
export interface CalculatorInputs {
  sellingPrice: number;
  productCost: number;
  shippingForward: number;
  shippingRTO: number;
  miscCost: number; // Packaging, handling per order
  
  fixedMonthlyCosts: FixedCost[]; // Replaces single monthlySubscriptions number
  miscOneTimeCosts: MiscOneTimeCost[]; // Variable daily expenses

  // Budget Inputs
  adSpendInput: number; // Replaces totalAdSpend as the raw input
  budgetType: 'daily' | 'total';
  budgetDuration: number; // Days
  
  // Advanced Schedule
  adSchedule: AdScheduleEvent[];

  deliveredPercentage: number;
  costPerLead: number;
  confirmationPercentage: number;
  
  // Upsell Inputs
  upsellSellingPrice: number;
  upsellProductCost: number;
  upsellTakeRate: number; // Percentage 0-100

  // Logistics & Cashflow Timing
  logisticsTimeline: {
    dispatchDelay: number; // Days after order to dispatch
    deliveryTime: number;  // Days in transit
    payoutDelay: number;   // Days from delivery to payout
  };
}

export type AdEventType = 'increase_daily' | 'one_time_injection';

export interface AdScheduleEvent {
  id: string;
  day: number;
  type: AdEventType;
  amount: number;
}

export interface MiscOneTimeCost {
  id: string;
  day: number;
  amount: number;
  description: string;
}

export interface FixedCost {
  id: string;
  description: string;
  amount: number; // Monthly amount
}

export interface DayFlow {
  day: number;
  spend: number;
  revenue: number;
  balance: number; // Cumulative Balance
}

export interface CashflowMetrics {
  day0_ads: number;          // Outflow
  day1_fulfillment: number;  // Outflow (COGS + Ship + Misc)
  day4_delivery: number;     // Event (No cash)
  day6_payout: number;       // Inflow (Revenue)
  totalCycleDays: number;
  workingCapitalRequired: number; // Based on cumulative simulation
  peakCapitalDay: number; // Day when balance is lowest (Self-sustaining after this)
  roiDay: number | null; // Day when balance crosses 0 (Profit starts)
  netCashflow: number;
  dailySpendRate: number;
  dailyCashflow: DayFlow[]; // Array for the chart
}

export interface CalculatorResults {
  revenue: number;
  totalCOGS: number;
  totalShipping: number;
  totalAds: number;
  totalMisc: number; // Per order misc
  totalFixedCosts: number; 
  totalOneTimeMisc: number; // Sum of variable daily expenses
  netProfit: number;
  netMargin: number;
  roi: number;
  roas: number;
  costPerPurchase: number; // CPP
  totalLeads: number;
  totalOrders: number;
  deliveredOrders: number;
  rtoOrders: number;
  breakEvenROAS: number;
  averageOrderValue: number;
  cashflow: CashflowMetrics;
}

export interface GoalMetrics {
  requiredOrders: number;
  requiredLeads: number;
  requiredAdSpend: number;
  isAchievable: boolean;
  unitProfit: number;
}

export enum Currency {
  USD = '$',
  INR = '₹',
  EUR = '€',
  GBP = '£',
  MAD = 'MAD '
}

export interface AIAnalysisResponse {
  analysis: string;
  tips: string[];
}
