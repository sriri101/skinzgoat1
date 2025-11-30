
export interface CalculatorInputs {
  sellingPrice: number;
  productCost: number;
  shippingForward: number;
  shippingRTO: number;
  miscCost: number; // Packaging, handling per order
  totalAdSpend: number;
  deliveredPercentage: number;
  costPerLead: number;
  confirmationPercentage: number;
  
  // Upsell Inputs
  upsellSellingPrice: number;
  upsellProductCost: number;
  upsellTakeRate: number; // Percentage 0-100
}

export interface CalculatorResults {
  revenue: number;
  totalCOGS: number;
  totalShipping: number;
  totalAds: number;
  totalMisc: number;
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