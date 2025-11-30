import { CalculatorInputs, CalculatorResults } from '../types';

export const calculateMetrics = (inputs: CalculatorInputs): CalculatorResults => {
  const {
    sellingPrice,
    productCost,
    shippingForward,
    shippingRTO,
    miscCost,
    totalAdSpend,
    costPerLead,
    confirmationPercentage,
    deliveredPercentage,
  } = inputs;

  // 1. Calculate Leads
  // Avoid division by zero
  const totalLeads = costPerLead > 0 ? Math.floor(totalAdSpend / costPerLead) : 0;

  // 2. Calculate Orders from Leads (Funnel Step 1)
  const totalOrders = Math.round(totalLeads * (confirmationPercentage / 100));

  // 3. Calculate Delivered vs RTO (Funnel Step 2)
  const deliveredOrders = Math.round(totalOrders * (deliveredPercentage / 100));
  const rtoOrders = totalOrders - deliveredOrders;

  // Revenue is only generated from delivered orders
  const revenue = deliveredOrders * sellingPrice;

  // Costs
  // CUSTOM LOGIC: User loses product cost on ALL orders (Delivered = Sold, RTO = Lost/Damaged).
  const totalCOGS = totalOrders * productCost;

  // CUSTOM LOGIC: Shipping is Free on RTO.
  // We assume Forward Shipping is only paid/retained for Delivered orders.
  // RTO Shipping is calculated based on input (which defaults to 0).
  const totalShipping = (deliveredOrders * shippingForward) + (rtoOrders * shippingRTO);

  // Misc (Packaging/Ops): You pay for ALL orders.
  const totalMisc = totalOrders * miscCost;

  const totalAds = totalAdSpend;

  const totalExpenses = totalCOGS + totalShipping + totalAds + totalMisc;
  const netProfit = revenue - totalExpenses;

  const netMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0;
  const roi = totalExpenses > 0 ? (netProfit / totalExpenses) * 100 : 0;
  
  // ROAS = Revenue / Ad Spend
  const roas = totalAdSpend > 0 ? revenue / totalAdSpend : 0;
  
  // Cost Per Purchase (CPA/CPP) = Total Ad Spend / Total Orders
  const costPerPurchase = totalOrders > 0 ? totalAdSpend / totalOrders : 0;

  // Break-even ROAS
  // Revenue = Costs + Ads
  // Ads_BreakEven = Revenue - (COGS + Shipping + Misc)
  const otherCosts = totalCOGS + totalShipping + totalMisc;
  const breakEvenAdSpend = revenue - otherCosts;
  const breakEvenROAS = breakEvenAdSpend > 0 ? revenue / breakEvenAdSpend : 0;

  return {
    revenue,
    totalCOGS,
    totalShipping,
    totalAds,
    totalMisc,
    netProfit,
    netMargin,
    roi,
    roas,
    costPerPurchase,
    totalLeads,
    totalOrders,
    deliveredOrders,
    rtoOrders,
    breakEvenROAS
  };
};

export const formatCurrency = (amount: number, symbol: string) => {
  return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
};

export const formatPercent = (amount: number) => {
  return `${amount.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;
};