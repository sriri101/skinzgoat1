
import { CalculatorInputs, CalculatorResults, GoalMetrics } from '../types';

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
    upsellSellingPrice,
    upsellProductCost,
    upsellTakeRate
  } = inputs;

  // 1. Calculate Leads
  const totalLeads = costPerLead > 0 ? Math.floor(totalAdSpend / costPerLead) : 0;

  // 2. Calculate Orders from Leads
  const totalOrders = Math.round(totalLeads * (confirmationPercentage / 100));

  // 3. Calculate Delivered vs RTO
  const deliveredOrders = Math.round(totalOrders * (deliveredPercentage / 100));
  const rtoOrders = totalOrders - deliveredOrders;

  // --- REVENUE ---
  // Main Product Revenue
  const mainRevenue = deliveredOrders * sellingPrice;
  
  // Upsell Revenue
  // Upsell count = Total Orders * Take Rate
  // We assume upsells are in the same package, so they share the Delivered Rate.
  const upsellTakeRateDecimal = upsellTakeRate / 100;
  const totalUpsellOrders = Math.round(totalOrders * upsellTakeRateDecimal);
  const deliveredUpsellOrders = Math.round(totalUpsellOrders * (deliveredPercentage / 100));
  const upsellRevenue = deliveredUpsellOrders * upsellSellingPrice;

  const revenue = mainRevenue + upsellRevenue;

  // --- COSTS ---
  // COGS: Product + Upsell Product
  // User logic: Product cost is lost on ALL orders (Delivered & RTO).
  const mainCOGS = totalOrders * productCost;
  const upsellCOGS = totalUpsellOrders * upsellProductCost;
  const totalCOGS = mainCOGS + upsellCOGS;

  // Shipping: Forward (Delivered Only) + RTO (Returned Only)
  // Upsell typically fits in same package, so no extra shipping calc unless specified.
  const totalShipping = (deliveredOrders * shippingForward) + (rtoOrders * shippingRTO);

  // Misc: Paid on all orders
  const totalMisc = totalOrders * miscCost;

  const totalAds = totalAdSpend;

  const totalExpenses = totalCOGS + totalShipping + totalAds + totalMisc;
  const netProfit = revenue - totalExpenses;

  const netMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0;
  const roi = totalExpenses > 0 ? (netProfit / totalExpenses) * 100 : 0;
  
  const roas = totalAdSpend > 0 ? revenue / totalAdSpend : 0;
  const costPerPurchase = totalOrders > 0 ? totalAdSpend / totalOrders : 0;

  // Break-even
  const otherCosts = totalCOGS + totalShipping + totalMisc;
  const breakEvenAdSpend = revenue - otherCosts;
  const breakEvenROAS = breakEvenAdSpend > 0 ? revenue / breakEvenAdSpend : 0;

  // AOV
  const averageOrderValue = deliveredOrders > 0 ? revenue / deliveredOrders : 0;

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
    breakEvenROAS,
    averageOrderValue
  };
};

export const calculateRequiredMetrics = (inputs: CalculatorInputs, targetProfit: number): GoalMetrics => {
  const {
    sellingPrice,
    productCost,
    shippingForward,
    shippingRTO,
    miscCost,
    costPerLead,
    confirmationPercentage,
    deliveredPercentage,
    upsellSellingPrice,
    upsellProductCost,
    upsellTakeRate
  } = inputs;

  const confRate = confirmationPercentage / 100;
  const delRate = deliveredPercentage / 100;
  const upsellRate = upsellTakeRate / 100;

  // 1. Marketing Cost Per Order (CPA)
  const cpa = confRate > 0 ? costPerLead / confRate : 0;

  // 2. Revenue per Order (Weighted Average including Upsell)
  // Main: SP * Del%
  // Upsell: UpsellSP * UpsellRate * Del%
  const revenuePerOrder = (sellingPrice * delRate) + (upsellSellingPrice * upsellRate * delRate);

  // 3. Costs per Order (Weighted Average)
  // COGS: MainCost + (UpsellCost * UpsellRate) -> Lost on 100% of orders
  const cogsPerOrder = productCost + (upsellProductCost * upsellRate);
  
  // Shipping: (Fwd * Del%) + (RTO_Cost * RTO%)
  const shippingPerOrder = (shippingForward * delRate) + (shippingRTO * (1 - delRate));
  
  // Misc
  const miscPerOrder = miscCost;

  // 4. Net Profit per Order
  const unitProfit = revenuePerOrder - cogsPerOrder - shippingPerOrder - miscPerOrder - cpa;

  if (unitProfit <= 0) {
    return {
      requiredOrders: 0,
      requiredLeads: 0,
      requiredAdSpend: 0,
      isAchievable: false,
      unitProfit
    };
  }

  const requiredOrders = Math.ceil(targetProfit / unitProfit);
  const requiredLeads = Math.ceil(requiredOrders / (confRate > 0 ? confRate : 1));
  const requiredAdSpend = requiredLeads * costPerLead;

  return {
    requiredOrders,
    requiredLeads,
    requiredAdSpend,
    isAchievable: true,
    unitProfit
  };
};

export const formatCurrency = (amount: number, symbol: string) => {
  return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
};

export const formatPercent = (amount: number) => {
  return `${amount.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;
};