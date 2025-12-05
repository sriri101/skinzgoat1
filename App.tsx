
import React, { useState, useEffect, useCallback } from 'react';
import { InputGroup } from './components/InputGroup';
import { MetricCard } from './components/MetricCard';
import { DonutChart } from './components/DonutChart';
import { CashflowChart } from './components/CashflowChart';
import { AdScheduleManager } from './components/AdScheduleManager';
import { MiscExpenseManager } from './components/MiscExpenseManager';
import { FixedExpenseManager } from './components/FixedExpenseManager';
import { DEFAULT_INPUTS, DEFAULT_CURRENCY, CHART_COLORS } from './constants';
import { calculateMetrics, calculateRequiredMetrics, formatCurrency, formatPercent } from './utils/calculations';
import { analyzeProfitability } from './services/geminiService';
import { CalculatorInputs, CalculatorResults, GoalMetrics, Currency, AIAnalysisResponse, AdScheduleEvent, MiscOneTimeCost, FixedCost } from './types';
import { BarChart2, TrendingUp, BrainCircuit, Moon, Sun, Filter, Users, PackageCheck, Target, AlertTriangle, PackagePlus, Clock, Truck, Landmark, Wallet, Calendar, Calculator, Info, Settings2 } from 'lucide-react';

const App: React.FC = () => {
  const [inputs, setInputs] = useState<CalculatorInputs>(DEFAULT_INPUTS);
  const [results, setResults] = useState<CalculatorResults>(calculateMetrics(DEFAULT_INPUTS));
  const [currency, setCurrency] = useState<Currency>(DEFAULT_CURRENCY);
  const [activeTab, setActiveTab] = useState<'input' | 'analysis'>('input');
  const [darkMode, setDarkMode] = useState(false);
  
  // Logistics Settings Toggle
  const [showLogisticsSettings, setShowLogisticsSettings] = useState(false);

  // Goal Simulator State
  const [targetProfit, setTargetProfit] = useState<number>(1000);
  const [goalMetrics, setGoalMetrics] = useState<GoalMetrics | null>(null);
  
  // AI State
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Dark Mode Toggle
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Update results when inputs change
  useEffect(() => {
    const calculatedResults = calculateMetrics(inputs);
    setResults(calculatedResults);
    setGoalMetrics(calculateRequiredMetrics(inputs, targetProfit));
  }, [inputs, targetProfit]);

  const handleInputChange = (field: keyof CalculatorInputs, value: any) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  const handleTimelineChange = (field: keyof typeof inputs.logisticsTimeline, value: number) => {
    setInputs(prev => ({
      ...prev,
      logisticsTimeline: {
        ...prev.logisticsTimeline,
        [field]: value
      }
    }));
  };

  const handleScheduleChange = (events: AdScheduleEvent[]) => {
    setInputs(prev => ({ ...prev, adSchedule: events }));
  };

  const handleMiscExpensesChange = (expenses: MiscOneTimeCost[]) => {
    setInputs(prev => ({ ...prev, miscOneTimeCosts: expenses }));
  };

  const handleFixedExpensesChange = (expenses: FixedCost[]) => {
    setInputs(prev => ({ ...prev, fixedMonthlyCosts: expenses }));
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setAnalysisError(null);
    try {
      const response = await analyzeProfitability(inputs, results, currency);
      setAiAnalysis(response);
      setActiveTab('analysis');
    } catch (e) {
      setAnalysisError("Could not generate AI insights. Check API Key.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const costData = [
    { name: 'Product Cost', value: results.totalCOGS },
    { name: 'Shipping', value: results.totalShipping },
    { name: 'Ads', value: results.totalAds },
    { name: 'Misc', value: results.totalMisc },
    { name: 'Fixed Costs', value: results.totalFixedCosts },
    { name: 'Extra Expenses', value: results.totalOneTimeMisc },
  ];
  
  // Calculated Days for Legend
  const dayDispatch = inputs.logisticsTimeline.dispatchDelay;
  const dayDelivered = dayDispatch + inputs.logisticsTimeline.deliveryTime;
  const dayPaid = dayDelivered + inputs.logisticsTimeline.payoutDelay;

  return (
    <div className="h-[100dvh] flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 transition-colors duration-200 overflow-hidden">
      
      {/* Header */}
      <header className="shrink-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-200 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <BarChart2 className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400">
              GoatCalculator
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
             <button 
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <select 
              value={currency} 
              onChange={(e) => setCurrency(e.target.value as Currency)}
              className="bg-slate-100 dark:bg-slate-800 border-none rounded-md py-1.5 pl-3 pr-8 text-sm font-bold text-slate-900 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value={Currency.INR}>INR (₹)</option>
              <option value={Currency.USD}>USD ($)</option>
              <option value={Currency.EUR}>EUR (€)</option>
              <option value={Currency.MAD}>MAD (MAD)</option>
            </select>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Inputs */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* 1. Unit Economics */}
              <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 p-6 transition-colors duration-200">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-1 h-6 bg-indigo-500 rounded-full"></div>
                  <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Unit Economics</h2>
                </div>
                
                <div className="space-y-4">
                  <InputGroup 
                    label="Selling Price" 
                    value={inputs.sellingPrice} 
                    onChange={(v) => handleInputChange('sellingPrice', v)} 
                    prefix={currency}
                  />
                  <InputGroup 
                    label="Product Cost (COGS)" 
                    value={inputs.productCost} 
                    onChange={(v) => handleInputChange('productCost', v)} 
                    prefix={currency}
                    helperText="Cost lost on all orders (Delivered & RTO)"
                  />
                  <div className="grid grid-cols-2 gap-4">
                     <InputGroup 
                      label="Fwd Shipping" 
                      value={inputs.shippingForward} 
                      onChange={(v) => handleInputChange('shippingForward', v)} 
                      prefix={currency}
                      helperText="Paid on delivered only"
                    />
                    <InputGroup 
                      label="RTO Shipping" 
                      value={inputs.shippingRTO} 
                      onChange={(v) => handleInputChange('shippingRTO', v)} 
                      prefix={currency}
                      helperText="Charge on return"
                    />
                  </div>
                   <InputGroup 
                    label="Misc / Packaging" 
                    value={inputs.miscCost} 
                    onChange={(v) => handleInputChange('miscCost', v)} 
                    prefix={currency}
                    helperText="Paid on all orders"
                  />
                  
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
                    {/* New Fixed Costs Manager */}
                    <FixedExpenseManager 
                       expenses={inputs.fixedMonthlyCosts}
                       onChange={handleFixedExpensesChange}
                       currency={currency}
                       campaignDuration={inputs.budgetDuration || 1}
                    />

                    {/* Variable Daily Expenses Manager */}
                    <MiscExpenseManager 
                      expenses={inputs.miscOneTimeCosts} 
                      onChange={handleMiscExpensesChange} 
                      currency={currency}
                      maxDays={inputs.budgetDuration}
                    />
                  </div>
                </div>
              </div>

              {/* 2. Upsell Strategy */}
              <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 p-6 transition-colors duration-200">
                 <div className="flex items-center gap-2 mb-6">
                  <div className="w-1 h-6 bg-amber-500 rounded-full"></div>
                  <h2 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                    Upsell Strategy 
                    <PackagePlus className="w-4 h-4 text-slate-400" />
                  </h2>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <InputGroup 
                      label="Upsell Price" 
                      value={inputs.upsellSellingPrice} 
                      onChange={(v) => handleInputChange('upsellSellingPrice', v)} 
                      prefix={currency}
                    />
                    <InputGroup 
                      label="Upsell Cost" 
                      value={inputs.upsellProductCost} 
                      onChange={(v) => handleInputChange('upsellProductCost', v)} 
                      prefix={currency}
                    />
                  </div>
                  
                  {/* Take Rate Slider */}
                  <div className="space-y-3 pt-2">
                    <div className="flex justify-between items-end">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Take Rate (% of Orders)
                      </label>
                      <span className="text-sm font-bold text-amber-600 dark:text-amber-400">{inputs.upsellTakeRate}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={inputs.upsellTakeRate} 
                      onChange={(e) => handleInputChange('upsellTakeRate', parseFloat(e.target.value))}
                      className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                     <div className="flex justify-between text-xs text-slate-500 dark:text-slate-500 font-medium">
                      <span>Upsell Rev: {formatCurrency((results.revenue - (results.deliveredOrders * inputs.sellingPrice)), currency)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Campaign Funnel */}
              <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 p-6 transition-colors duration-200">
                 <div className="flex items-center gap-2 mb-6">
                  <div className="w-1 h-6 bg-rose-500 rounded-full"></div>
                  <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Campaign Funnel</h2>
                </div>
                
                <div className="space-y-6">
                  {/* Budget Toggle Section */}
                  <div className="space-y-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                       <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Budget Type</label>
                       <div className="flex bg-slate-200 dark:bg-slate-700 rounded-lg p-1">
                          <button
                            onClick={() => handleInputChange('budgetType', 'daily')}
                            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${inputs.budgetType === 'daily' ? 'bg-white dark:bg-slate-500 text-indigo-600 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
                          >
                            Daily
                          </button>
                          <button
                            onClick={() => handleInputChange('budgetType', 'total')}
                            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${inputs.budgetType === 'total' ? 'bg-white dark:bg-slate-500 text-indigo-600 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
                          >
                            Total
                          </button>
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <InputGroup 
                        label={inputs.budgetType === 'daily' ? "Daily Base" : "Total Budget"} 
                        value={inputs.adSpendInput} 
                        onChange={(v) => handleInputChange('adSpendInput', v)} 
                        prefix={currency}
                        step={100}
                      />
                       <InputGroup 
                        label="Duration (Days)" 
                        value={inputs.budgetDuration} 
                        onChange={(v) => handleInputChange('budgetDuration', v)} 
                        suffix="days"
                        min={1}
                        step={1}
                      />
                    </div>
                    {inputs.budgetType === 'total' && (
                       <div className="text-xs text-slate-500 dark:text-slate-400 text-right">
                          Base Daily: {formatCurrency(inputs.adSpendInput / (inputs.budgetDuration || 1), currency)}
                       </div>
                    )}
                    {inputs.budgetType === 'daily' && (
                       <div className="text-xs text-slate-500 dark:text-slate-400 text-right">
                          Base Total: {formatCurrency(inputs.adSpendInput * inputs.budgetDuration, currency)}
                       </div>
                    )}
                  </div>

                  {/* Advanced Budget Scheduling */}
                  <AdScheduleManager 
                    events={inputs.adSchedule} 
                    onChange={handleScheduleChange} 
                    currency={currency}
                    maxDays={inputs.budgetDuration}
                  />

                  <InputGroup 
                    label="Cost Per Lead" 
                    value={inputs.costPerLead} 
                    onChange={(v) => handleInputChange('costPerLead', v)} 
                    prefix={currency}
                    step={1}
                  />

                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 flex justify-between items-center text-sm border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-600 dark:text-slate-400 flex items-center gap-2 font-medium">
                      <Filter className="w-4 h-4" /> Est. Leads
                    </span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{results.totalLeads.toLocaleString()}</span>
                  </div>
                  
                  {/* Confirmation Slider */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-end">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-slate-400" />
                        Lead Confirmation
                      </label>
                      <div className="text-right">
                         <span className="text-xs text-slate-500 block mb-0.5 font-medium">Orders: {results.totalOrders}</span>
                         <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{inputs.confirmationPercentage}%</span>
                      </div>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={inputs.confirmationPercentage} 
                      onChange={(e) => handleInputChange('confirmationPercentage', parseFloat(e.target.value))}
                      className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                  </div>

                  {/* Delivered Slider */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-end">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <PackageCheck className="w-4 h-4 text-slate-400" />
                        Delivered Rate
                      </label>
                      <div className="text-right">
                         <span className="text-xs text-slate-500 block mb-0.5 font-medium">Delivered: {results.deliveredOrders}</span>
                         <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{inputs.deliveredPercentage}%</span>
                      </div>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={inputs.deliveredPercentage} 
                      onChange={(e) => handleInputChange('deliveredPercentage', parseFloat(e.target.value))}
                      className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                    <div className="flex justify-between text-xs text-slate-500 dark:text-slate-500 font-medium">
                      <span>RTO Rate: {100 - inputs.deliveredPercentage}%</span>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* Right Column: Results & Analysis */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Tabs for Mobile/Desktop organization */}
              <div className="flex space-x-1 rounded-xl bg-slate-200 dark:bg-slate-800 p-1 mb-4 transition-colors duration-200">
                <button
                  onClick={() => setActiveTab('input')}
                  className={`w-full rounded-lg py-2.5 text-sm font-medium leading-5 ring-white ring-opacity-60 ring-offset-2 ring-offset-indigo-400 focus:outline-none focus:ring-2 transition-all ${
                    activeTab === 'input'
                      ? 'bg-white dark:bg-slate-600 text-indigo-700 dark:text-white shadow'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-white/[0.12] dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setActiveTab('analysis')}
                  className={`w-full rounded-lg py-2.5 text-sm font-medium leading-5 ring-white ring-opacity-60 ring-offset-2 ring-offset-indigo-400 focus:outline-none focus:ring-2 transition-all ${
                    activeTab === 'analysis'
                      ? 'bg-white dark:bg-slate-600 text-indigo-700 dark:text-white shadow'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-white/[0.12] dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                   AI Insights
                </button>
              </div>

              {activeTab === 'input' && (
                <div className="space-y-6">
                  {/* Big Profit Card */}
                  <div className={`rounded-2xl p-6 text-white shadow-lg transition-colors duration-300 ${results.netProfit >= 0 ? 'bg-gradient-to-br from-emerald-500 to-teal-600 dark:from-emerald-600 dark:to-teal-700' : 'bg-gradient-to-br from-rose-500 to-red-600 dark:from-rose-600 dark:to-red-700'}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-emerald-50 opacity-90 font-medium">Net Profit / Loss</p>
                        <h2 className="text-4xl md:text-5xl font-bold mt-2">
                          {formatCurrency(results.netProfit, currency)}
                        </h2>
                      </div>
                      <div className="text-right">
                         <p className="text-emerald-50 opacity-90 font-medium">Net Margin</p>
                         <p className="text-2xl font-bold mt-1">{formatPercent(results.netMargin)}</p>
                      </div>
                    </div>
                    <div className="mt-6 pt-4 border-t border-white/20 flex gap-6 text-sm font-medium opacity-90">
                      <div>
                        <span className="opacity-75 block text-xs">Total Revenue</span>
                        {formatCurrency(results.revenue, currency)}
                      </div>
                      <div>
                        <span className="opacity-75 block text-xs">Total Spend</span>
                        {formatCurrency(results.totalCOGS + results.totalShipping + results.totalAds + results.totalMisc + results.totalFixedCosts + results.totalOneTimeMisc, currency)}
                      </div>
                    </div>
                  </div>

                  {/* CASHFLOW CYCLE CARD */}
                  <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 p-6 transition-colors duration-200">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2">
                         <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                         <h3 className="text-lg font-bold text-slate-800 dark:text-white">Cashflow & Logistics Cycle</h3>
                      </div>
                      <div className="flex gap-2">
                        <button 
                            onClick={() => setShowLogisticsSettings(!showLogisticsSettings)}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors rounded bg-slate-100 dark:bg-slate-800"
                            title="Customize Timeline"
                        >
                            <Settings2 className="w-4 h-4" />
                        </button>
                        <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                            <Info className="w-3 h-3"/>
                            <span>Simulation: {inputs.budgetDuration} Days</span>
                        </div>
                      </div>
                    </div>

                    {/* Collapsible Timeline Settings */}
                    {showLogisticsSettings && (
                        <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 animate-in slide-in-from-top-2 duration-200">
                            <h4 className="text-xs font-bold uppercase text-slate-500 mb-3 tracking-wider">Customize Cycle Timeline (Days)</h4>
                            <div className="grid grid-cols-3 gap-4">
                                <InputGroup 
                                    label="Dispatch Delay" 
                                    value={inputs.logisticsTimeline.dispatchDelay} 
                                    onChange={(v) => handleTimelineChange('dispatchDelay', v)}
                                    suffix="days"
                                    min={0}
                                />
                                <InputGroup 
                                    label="Transit Time" 
                                    value={inputs.logisticsTimeline.deliveryTime} 
                                    onChange={(v) => handleTimelineChange('deliveryTime', v)}
                                    suffix="days"
                                    min={1}
                                />
                                <InputGroup 
                                    label="Payout Delay" 
                                    value={inputs.logisticsTimeline.payoutDelay} 
                                    onChange={(v) => handleTimelineChange('payoutDelay', v)}
                                    suffix="days"
                                    min={1}
                                />
                            </div>
                        </div>
                    )}

                    {/* Investment Analysis Grid */}
                     <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                       <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                          <div className="flex items-center gap-2 mb-2">
                            <Landmark className="w-4 h-4 text-indigo-500" />
                            <span className="text-xs font-bold uppercase text-slate-500 tracking-wide">Investment Needed</span>
                          </div>
                          <p className="text-xl font-bold text-slate-900 dark:text-white">{formatCurrency(results.cashflow.workingCapitalRequired, currency)}</p>
                          <p className="text-[10px] text-slate-500 mt-1">Total cash needed to sustain operations.</p>
                       </div>
                       
                       <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                          <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="w-4 h-4 text-emerald-500" />
                            <span className="text-xs font-bold uppercase text-slate-500 tracking-wide">Self-Sustaining</span>
                          </div>
                          <p className="text-xl font-bold text-slate-900 dark:text-white">Day {results.cashflow.peakCapitalDay}</p>
                          <p className="text-[10px] text-slate-500 mt-1">Balance stops dropping after this day.</p>
                       </div>
                       
                       <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                          <div className="flex items-center gap-2 mb-2">
                            <Calendar className="w-4 h-4 text-indigo-500" />
                            <span className="text-xs font-bold uppercase text-slate-500 tracking-wide">Profitable By</span>
                          </div>
                          <p className="text-xl font-bold text-slate-900 dark:text-white">
                             {results.cashflow.roiDay !== null ? `Day ${results.cashflow.roiDay}` : 'Never'}
                          </p>
                          <p className="text-[10px] text-slate-500 mt-1">Day you earn back all investment.</p>
                       </div>
                    </div>

                    {/* New Cumulative Chart */}
                    <div className="mb-6">
                       <div className="flex justify-between items-end mb-2">
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Cumulative Cash Balance</p>
                          <p className="text-xs text-slate-400 italic">Drag slider to zoom</p>
                       </div>
                       <div className="bg-slate-50 dark:bg-slate-950/50 rounded-lg p-2 border border-slate-100 dark:border-slate-800">
                         <CashflowChart 
                            data={results.cashflow.dailyCashflow} 
                            currency={currency} 
                            isDarkMode={darkMode} 
                            peakCapitalDay={results.cashflow.peakCapitalDay}
                            roiDay={results.cashflow.roiDay}
                         />
                       </div>
                    </div>

                    {/* Unit Timeline (Legend) */}
                    <div>
                       <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Unit Logistics Cycle (Days)</p>
                       <div className="grid grid-cols-4 gap-2 text-center relative">
                          <div className="absolute top-3 left-0 right-0 h-0.5 bg-slate-200 dark:bg-slate-700 z-0 mx-8 hidden md:block"></div>
                          
                          <div className="relative z-10 flex flex-col items-center">
                             <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-indigo-500 flex items-center justify-center shrink-0 mb-2">
                               <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">0</span>
                             </div>
                             <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase">Confirm</span>
                          </div>
                          <div className="relative z-10 flex flex-col items-center">
                             <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-amber-500 flex items-center justify-center shrink-0 mb-2">
                               <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">{dayDispatch}</span>
                             </div>
                             <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase">Dispatch</span>
                          </div>
                          <div className="relative z-10 flex flex-col items-center">
                             <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-slate-400 flex items-center justify-center shrink-0 mb-2">
                               <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">{dayDelivered}</span>
                             </div>
                             <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase">Delivered</span>
                          </div>
                          <div className="relative z-10 flex flex-col items-center">
                             <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-emerald-500 flex items-center justify-center shrink-0 mb-2">
                               <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">{dayPaid}</span>
                             </div>
                             <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase">Paid</span>
                          </div>
                       </div>
                    </div>
                  </div>

                  {/* PROFIT GOAL SIMULATOR */}
                  <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 p-6 transition-colors duration-200">
                    <div className="flex items-center gap-2 mb-4">
                      <Target className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      <h3 className="text-lg font-bold text-slate-800 dark:text-white">Profit Goal Simulator</h3>
                    </div>
                    
                    <div className="flex flex-col md:flex-row gap-6 items-end">
                      <div className="w-full md:w-1/3">
                         <InputGroup 
                            label="Target Net Profit" 
                            value={targetProfit} 
                            onChange={(v) => setTargetProfit(v)} 
                            prefix={currency} 
                         />
                      </div>
                      
                      <div className="w-full md:w-2/3 bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                         {goalMetrics?.isAchievable ? (
                            <div className="flex flex-col gap-2">
                               <p className="text-sm text-slate-600 dark:text-slate-400">
                                 To reach <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(targetProfit, currency)}</span>, you need:
                               </p>
                               <div className="grid grid-cols-3 gap-4 mt-2">
                                  <div>
                                     <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block mb-1">Orders</span>
                                     <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{goalMetrics.requiredOrders.toLocaleString()}</p>
                                  </div>
                                   <div>
                                     <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block mb-1">Ad Spend</span>
                                     <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{formatCurrency(goalMetrics.requiredAdSpend, currency)}</p>
                                  </div>
                                   <div>
                                     <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block mb-1">Leads</span>
                                     <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{goalMetrics.requiredLeads.toLocaleString()}</p>
                                  </div>
                               </div>
                            </div>
                         ) : (
                            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
                               <AlertTriangle className="w-6 h-6 shrink-0" />
                               <div>
                                  <p className="font-bold text-sm">Goal Unachievable</p>
                                  <p className="text-xs mt-1 text-rose-600/80 dark:text-rose-400/80">
                                    Your unit economics are negative ({formatCurrency(goalMetrics?.unitProfit || 0, currency)} per order).
                                  </p>
                               </div>
                            </div>
                         )}
                      </div>
                    </div>
                  </div>

                  {/* Key Metrics Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <MetricCard 
                      label="ROAS" 
                      value={results.roas.toFixed(2) + 'x'} 
                      subValue={`Target: ${results.breakEvenROAS.toFixed(2)}x (BE)`}
                      trend={results.roas >= results.breakEvenROAS ? 'positive' : 'negative'}
                    />
                    <MetricCard 
                      label="AOV" 
                      value={formatCurrency(results.averageOrderValue, currency)} 
                      highlight
                    />
                    <MetricCard 
                      label="CPP (Cost/Order)" 
                      value={formatCurrency(results.costPerPurchase, currency)} 
                    />
                    <MetricCard 
                      label="RTO Orders" 
                      value={results.rtoOrders.toString()} 
                      subValue={`Loss: ${formatCurrency(results.rtoOrders * (inputs.productCost + inputs.miscCost + inputs.shippingRTO), currency)}`}
                      trend="negative"
                    />
                    <MetricCard 
                      label="ROI" 
                      value={formatPercent(results.roi)}
                      trend={results.roi > 0 ? 'positive' : 'negative'}
                    />
                    <MetricCard 
                      label="Total Orders" 
                      value={results.totalOrders.toString()}
                      subValue={`${results.deliveredOrders} Delivered`}
                    />
                  </div>

                  {/* Charts */}
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors duration-200">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Cost Breakdown</h3>
                    <div className="flex flex-col md:flex-row items-center gap-6">
                      <div className="flex-1 w-full">
                         <DonutChart data={costData} />
                      </div>
                      <div className="flex-1 space-y-3 w-full">
                         {costData.map((item, idx) => (
                           <div key={idx} className="flex justify-between items-center text-sm border-b border-slate-50 dark:border-slate-800 pb-2 last:border-0">
                             <div className="flex items-center gap-2">
                               <div className="w-3 h-3 rounded-full" style={{ 
                                 backgroundColor: 
                                  item.name === 'Product Cost' ? CHART_COLORS.cogs :
                                  item.name === 'Shipping' ? CHART_COLORS.shipping :
                                  item.name === 'Ads' ? CHART_COLORS.ads : 
                                  item.name === 'Fixed Costs' ? CHART_COLORS.fixed :
                                  item.name === 'Extra Expenses' ? CHART_COLORS.extras :
                                  CHART_COLORS.misc
                               }}></div>
                               <span className="text-slate-600 dark:text-slate-300">{item.name}</span>
                             </div>
                             <span className="font-semibold text-slate-900 dark:text-white">{formatCurrency(item.value, currency)}</span>
                           </div>
                         ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'analysis' && (
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 p-6 min-h-[400px] transition-colors duration-200">
                  {!aiAnalysis ? (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-4 py-12">
                       <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-full">
                         <BrainCircuit className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                       </div>
                       <div className="max-w-md">
                         <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Get AI-Powered Profit Analysis</h3>
                         <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
                           Let our AI analyze your funnel (CPL, Confirmation, RTO) and suggest 3 actionable ways to increase your cash flow.
                         </p>
                       </div>
                       <button
                          onClick={handleAnalyze}
                          disabled={isAnalyzing}
                          className="mt-4 inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-full font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                       >
                         {isAnalyzing ? (
                           <>
                             <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                             </svg>
                             Analyzing...
                           </>
                         ) : (
                           <>
                             Analyze Profitability <TrendingUp className="w-4 h-4" />
                           </>
                         )}
                       </button>
                       {analysisError && (
                         <p className="text-rose-500 text-sm bg-rose-50 dark:bg-rose-900/20 px-4 py-2 rounded-lg mt-4">{analysisError}</p>
                       )}
                    </div>
                  ) : (
                    <div className="space-y-6 animate-in fade-in duration-500">
                      <div className="flex justify-between items-center">
                         <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                           <BrainCircuit className="w-6 h-6 text-indigo-600 dark:text-indigo-400" /> 
                           AI Analysis
                         </h3>
                         <button onClick={handleAnalyze} className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium">
                           Refresh
                         </button>
                      </div>
                      
                      <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-lg p-5">
                        <p className="text-indigo-900 dark:text-indigo-100 leading-relaxed font-medium">
                          "{aiAnalysis.analysis}"
                        </p>
                      </div>

                      <div className="space-y-4">
                        <h4 className="font-semibold text-slate-800 dark:text-white text-lg">Recommended Actions</h4>
                        <div className="grid gap-4">
                          {aiAnalysis.tips.map((tip, idx) => (
                            <div key={idx} className="flex gap-4 p-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                              <div className="flex-shrink-0 w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center font-bold text-sm">
                                {idx + 1}
                              </div>
                              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{tip}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
            </div>
          </div>
        </div>
      </main>
      
      {/* Sticky footer for mobile */}
      <footer className="shrink-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-3 px-4 md:hidden transition-colors duration-200">
        <div className="flex justify-between items-center text-sm font-medium">
          <div>
            <span className="text-slate-500 dark:text-slate-400 text-xs block">Net Profit</span>
            <span className={results.netProfit >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}>
              {formatCurrency(results.netProfit, currency)}
            </span>
          </div>
          <button 
             onClick={() => {
                setActiveTab('analysis');
                if(!aiAnalysis) handleAnalyze();
             }}
             className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-xs"
          >
             Analyze Now
          </button>
        </div>
      </footer>
    </div>
  );
};

export default App;
