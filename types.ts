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