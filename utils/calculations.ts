
import { CalculatorInputs, CalculatorResults, GoalMetrics, CashflowMetrics, DayFlow } from '../types';

export const calculateMetrics = (inputs: CalculatorInputs): CalculatorResults => {
  const {
    sellingPrice,
    productCost,
    shippingForward,
    shippingRTO,
    miscCost,
    fixedMonthlyCosts,
    miscOneTimeCosts,
    adSpendInput,
    budgetType,
    budgetDuration,
    adSchedule,
    costPerLead,
    confirmationPercentage,
    deliveredPercentage,
    upsellSellingPrice,
    upsellProductCost,
    upsellTakeRate,
    logisticsTimeline
  } = inputs;

  const confRate = confirmationPercentage / 100;
  const delRate = deliveredPercentage / 100;
  const upsellRate = upsellTakeRate / 100;

  // Safe duration to avoid division by zero
  const duration = budgetDuration > 0 ? budgetDuration : 1;

  // --- PHASE 1: GENERATE DAILY ARRAYS ---
  // We calculate everything day-by-day to account for scaling
  
  const dailyAdsArr: number[] = [];
  const dailyOrdersArr: number[] = [];
  const dailyDeliveredArr: number[] = [];
  const dailyRtoArr: number[] = [];
  const dailyUpsellOrdersArr: number[] = [];

  let baseDailySpend = 0;
  if (budgetType === 'daily') {
    baseDailySpend = adSpendInput;
  } else {
    baseDailySpend = adSpendInput / duration;
  }

  for (let day = 0; day < duration; day++) {
    // 1. Determine Ad Spend for this day
    
    // Apply "Increase Daily" events that happened ON or BEFORE this day
    // e.day means "Starting from Day X" (where input 1 = index 0)
    
    let currentDayBase = baseDailySpend;
    // Accumulate all daily increases
    adSchedule.forEach(e => {
        if (e.type === 'increase_daily' && day >= (e.day - 1)) {
            currentDayBase += e.amount;
        }
    });

    // Apply "One Time Injection" for THIS day specifically
    let injection = 0;
    adSchedule.forEach(e => {
        if (e.type === 'one_time_injection' && day === (e.day - 1)) {
            injection += e.amount;
        }
    });

    const todaysAdSpend = currentDayBase + injection;
    dailyAdsArr.push(todaysAdSpend);

    // 2. Determine Orders for this day
    const leadsToday = costPerLead > 0 ? Math.floor(todaysAdSpend / costPerLead) : 0;
    const ordersToday = Math.round(leadsToday * confRate);
    
    const deliveredToday = Math.round(ordersToday * delRate);
    const rtoToday = ordersToday - deliveredToday;

    const upsellOrdersToday = Math.round(ordersToday * upsellRate);
    const deliveredUpsellToday = Math.round(upsellOrdersToday * delRate);

    dailyOrdersArr.push(ordersToday);
    dailyDeliveredArr.push(deliveredToday);
    dailyRtoArr.push(rtoToday);
    dailyUpsellOrdersArr.push(deliveredUpsellToday);
  }

  // --- PHASE 2: AGGREGATE TOTALS ---
  const totalAds = dailyAdsArr.reduce((a, b) => a + b, 0);
  const totalOrders = dailyOrdersArr.reduce((a, b) => a + b, 0);
  const deliveredOrders = dailyDeliveredArr.reduce((a, b) => a + b, 0);
  const rtoOrders = dailyRtoArr.reduce((a, b) => a + b, 0);
  const totalUpsellOrders = dailyOrdersArr.reduce((acc, orders) => acc + Math.round(orders * upsellRate), 0); // Total raw upsell attempts/orders
  
  // Note: For Upsell Revenue/COGS, we strictly use the delivered portion
  const deliveredUpsellTotal = dailyUpsellOrdersArr.reduce((a, b) => a + b, 0);

  const totalLeads = costPerLead > 0 ? Math.floor(totalAds / costPerLead) : 0;

  // Revenue
  const mainRevenue = deliveredOrders * sellingPrice;
  const upsellRevenue = deliveredUpsellTotal * upsellSellingPrice;
  const revenue = mainRevenue + upsellRevenue;

  // COGS
  const mainCOGS = totalOrders * productCost;
  // Upsell COGS is incurred on ALL upsell orders (delivered + rto), assuming loss on RTO
  const upsellCOGS = totalUpsellOrders * upsellProductCost; 
  const totalCOGS = mainCOGS + upsellCOGS;

  // Shipping
  const totalShipping = (deliveredOrders * shippingForward) + (rtoOrders * shippingRTO);

  // Misc (Per Order)
  const totalMisc = totalOrders * miscCost;

  // Fixed Costs (Pro-rated)
  // Sum up all monthly items first
  const totalMonthlySum = fixedMonthlyCosts.reduce((sum, item) => sum + item.amount, 0);
  const dailyFixedCost = totalMonthlySum / 30;
  const totalFixedCosts = dailyFixedCost * duration;
  
  // Variable Daily Expenses (Extra Misc)
  const totalOneTimeMisc = miscOneTimeCosts.reduce((sum, item) => sum + item.amount, 0);

  const totalExpenses = totalCOGS + totalShipping + totalAds + totalMisc + totalFixedCosts + totalOneTimeMisc;
  const netProfit = revenue - totalExpenses;

  const netMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0;
  const roi = totalExpenses > 0 ? (netProfit / totalExpenses) * 100 : 0;
  const roas = totalAds > 0 ? revenue / totalAds : 0;
  const costPerPurchase = totalOrders > 0 ? totalAds / totalOrders : 0;

  // Break-even
  const otherCosts = totalCOGS + totalShipping + totalMisc + totalFixedCosts + totalOneTimeMisc;
  const breakEvenAdSpend = revenue - otherCosts;
  const breakEvenROAS = breakEvenAdSpend > 0 ? revenue / breakEvenAdSpend : 0;

  // AOV
  const averageOrderValue = deliveredOrders > 0 ? revenue / deliveredOrders : 0;


  // --- PHASE 3: CASHFLOW SIMULATION (DYNAMIC TIMELINE) ---
  
  const dailyCashflow: DayFlow[] = [];
  let cumulativeBalance = 0;
  let lowestBalance = 0;
  let peakCapitalDay = 0;
  let roiDay: number | null = null;
  
  // Timeline Settings
  const dispatchDelay = logisticsTimeline.dispatchDelay;
  const deliveryTime = logisticsTimeline.deliveryTime;
  const payoutDelay = logisticsTimeline.payoutDelay;
  const totalLag = dispatchDelay + deliveryTime + payoutDelay;

  // Simulate timeline: Campaign Duration + Full Lag + buffer
  const simulationDays = duration + totalLag + 5; 

  for (let day = 0; day <= simulationDays; day++) {
    let dailyOut = 0;
    let dailyIn = 0;

    // 1. FIXED COSTS (Daily operational)
    if (day < duration) {
        dailyOut += dailyFixedCost;
    }
    
    // 2. VARIABLE MISC EXPENSES (Specific Day)
    // miscOneTimeCosts use 1-based day input, loop is 0-based.
    const todaysMiscExpenses = miscOneTimeCosts
        .filter(c => c.day === day + 1)
        .reduce((sum, c) => sum + c.amount, 0);
    dailyOut += todaysMiscExpenses;

    // 3. AD SPEND (Day 0 relative)
    // Spending happens on the campaign day itself
    if (day < duration) {
        dailyOut += dailyAdsArr[day] || 0;
    }

    // 4. FULFILLMENT COST (Dispatch Day)
    // Paid when we ship. If dispatchDelay is 1, we pay on Day (OrderDay + 1).
    // So on 'day', we are paying for orders from 'day - dispatchDelay'.
    const orderDayForFulfillment = day - dispatchDelay;

    if (orderDayForFulfillment >= 0 && orderDayForFulfillment < duration) {
        const ordersThen = dailyOrdersArr[orderDayForFulfillment];
        const upsellOrdersThen = Math.round(ordersThen * upsellRate);
        
        const cogs = (ordersThen * productCost) + (upsellOrdersThen * upsellProductCost);
        const misc = ordersThen * miscCost;
        
        dailyOut += (cogs + misc);
    }

    // 5. PAYOUT (Payout Day)
    // Received after dispatch + delivery + payout wait.
    // Payout Day = Order Day + dispatchDelay + deliveryTime + payoutDelay.
    // So on 'day', we are getting paid for orders from 'day - totalLag'.
    const orderDayForPayout = day - totalLag;

    if (orderDayForPayout >= 0 && orderDayForPayout < duration) {
        const delOrders = dailyDeliveredArr[orderDayForPayout];
        const rtoOrders = dailyRtoArr[orderDayForPayout];
        const delUpsell = dailyUpsellOrdersArr[orderDayForPayout];

        const rev = (delOrders * sellingPrice) + (delUpsell * upsellSellingPrice);
        
        // Shipping is deducted from payout
        const ship = (delOrders * shippingForward) + (rtoOrders * shippingRTO);

        dailyIn += (rev - ship);
    }

    const netDaily = dailyIn - dailyOut;
    cumulativeBalance += netDaily;
    
    // Track Peak Capital (Lowest point)
    if (cumulativeBalance < lowestBalance) {
        lowestBalance = cumulativeBalance;
        peakCapitalDay = day;
    }

    // Track ROI Day (First day positive)
    if (cumulativeBalance > 0 && roiDay === null && day > 0) {
        roiDay = day;
    }

    dailyCashflow.push({
        day,
        spend: dailyOut,
        revenue: dailyIn,
        balance: cumulativeBalance
    });
  }

  // Representative static metrics for the UI cards
  const avgDailyAds = totalAds / duration;
  const avgDailyFulfillment = (totalCOGS + totalMisc) / duration;
  const avgDailyPayout = (revenue - totalShipping) / duration;

  const cashflow: CashflowMetrics = {
    day0_ads: avgDailyAds,
    day1_fulfillment: avgDailyFulfillment,
    day4_delivery: 0,
    day6_payout: avgDailyPayout,
    totalCycleDays: totalLag,
    workingCapitalRequired: Math.abs(lowestBalance),
    peakCapitalDay,
    roiDay,
    netCashflow: netProfit,
    dailySpendRate: avgDailyAds, // Average
    dailyCashflow
  };

  return {
    revenue,
    totalCOGS,
    totalShipping,
    totalAds,
    totalMisc,
    totalFixedCosts,
    totalOneTimeMisc,
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
    averageOrderValue,
    cashflow
  };
};

export const calculateRequiredMetrics = (inputs: CalculatorInputs, targetProfit: number): GoalMetrics => {
  const {
    sellingPrice,
    productCost,
    shippingForward,
    shippingRTO,
    miscCost,
    fixedMonthlyCosts,
    miscOneTimeCosts,
    budgetDuration,
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

  const totalMonthlySum = fixedMonthlyCosts.reduce((sum, item) => sum + item.amount, 0);
  const dailyFixedCost = totalMonthlySum / 30;
  const duration = budgetDuration > 0 ? budgetDuration : 1;
  const totalFixedCostsForDuration = dailyFixedCost * duration;
  
  const totalVariableMisc = miscOneTimeCosts.reduce((sum, item) => sum + item.amount, 0);

  const cpa = confRate > 0 ? costPerLead / confRate : 0;
  const revenuePerOrder = (sellingPrice * delRate) + (upsellSellingPrice * upsellRate * delRate);
  const cogsPerOrder = productCost + (upsellProductCost * upsellRate);
  const shippingPerOrder = (shippingForward * delRate) + (shippingRTO * (1 - delRate));
  const miscPerOrder = miscCost;

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

  // Target must cover Profit + Fixed Costs + Variable Misc
  const effectiveTarget = targetProfit + totalFixedCostsForDuration + totalVariableMisc;
  
  const requiredOrders = Math.ceil(effectiveTarget / unitProfit);
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
