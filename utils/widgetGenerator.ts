import { CalculatorInputs, CalculatorResults, Currency } from '../types';
import { DEFAULT_INPUTS, DEFAULT_CURRENCY } from '../constants';

export const generateWidgetCode = () => {
  const code = `
<!-- COD Profit Calculator Widget -->
<div id="cod-calc-widget-root" style="width: 100%; min-height: 800px; isolation: isolate;">
  <div style="font-family: sans-serif; padding: 20px; text-align: center; color: #64748b;">
    Loading Profit Calculator...
  </div>
</div>

<!-- Load Babel for in-browser JSX transformation -->
<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>

<!-- Main Widget Script (text/babel handles JSX) -->
<script type="text/babel" data-type="module" data-presets="react,typescript">
import React, { useState, useEffect, useMemo } from 'https://esm.sh/react@18.2.0';
import ReactDOM from 'https://esm.sh/react-dom@18.2.0/client';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'https://esm.sh/recharts@2.12.0?deps=react@18.2.0,react-dom@18.2.0';
import { BarChart2, TrendingUp, BrainCircuit, Moon, Sun, Filter, Users, PackageCheck, AlertCircle, RefreshCw } from 'https://esm.sh/lucide-react@0.300.0?deps=react@18.2.0';
import { GoogleGenAI } from 'https://esm.sh/@google/genai@0.1.1';

// --- STYLES INJECTION ---
// We inject Tailwind via CDN but scoped to our root to avoid breaking the host site
if (!document.getElementById('cod-calc-tailwind')) {
  const tailwindScript = document.createElement('script');
  tailwindScript.id = 'cod-calc-tailwind';
  tailwindScript.src = "https://cdn.tailwindcss.com";
  tailwindScript.onload = () => {
    // Configure Tailwind to respect the host's dark mode or a class on our wrapper
    if (window.tailwind) {
      window.tailwind.config = {
        darkMode: 'class',
        corePlugins: {
          preflight: false, // Disable preflight to avoid resetting host site styles
        },
        blocklist: ['html', 'body'], // Prevent targeting root elements
      };
    }
  };
  document.head.appendChild(tailwindScript);
}

// --- APP CONSTANTS & LOGIC ---
const DEFAULT_INPUTS = {
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

const CHART_COLORS = {
  profit: '#10b981',
  loss: '#ef4444',
  ads: '#3b82f6',
  cogs: '#f59e0b',
  shipping: '#8b5cf6',
  misc: '#64748b'
};

const Currency = {
  USD: '$',
  INR: '₹',
  EUR: '€',
  GBP: '£',
  MAD: 'MAD '
};

const calculateMetrics = (inputs) => {
  const {
    sellingPrice, productCost, shippingForward, shippingRTO, miscCost,
    totalAdSpend, costPerLead, confirmationPercentage, deliveredPercentage
  } = inputs;

  const totalLeads = costPerLead > 0 ? Math.floor(totalAdSpend / costPerLead) : 0;
  const totalOrders = Math.round(totalLeads * (confirmationPercentage / 100));
  const deliveredOrders = Math.round(totalOrders * (deliveredPercentage / 100));
  const rtoOrders = totalOrders - deliveredOrders;

  const revenue = deliveredOrders * sellingPrice;
  // Cost Logic: Product cost lost on ALL orders.
  const totalCOGS = totalOrders * productCost;
  // Shipping: Forward on Delivered + RTO cost on RTO
  const totalShipping = (deliveredOrders * shippingForward) + (rtoOrders * shippingRTO);
  const totalMisc = totalOrders * miscCost;
  const totalAds = totalAdSpend;

  const totalExpenses = totalCOGS + totalShipping + totalAds + totalMisc;
  const netProfit = revenue - totalExpenses;
  const netMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0;
  const roi = totalExpenses > 0 ? (netProfit / totalExpenses) * 100 : 0;
  const roas = totalAdSpend > 0 ? revenue / totalAdSpend : 0;
  const costPerPurchase = totalOrders > 0 ? totalAdSpend / totalOrders : 0;

  const otherCosts = totalCOGS + totalShipping + totalMisc;
  const breakEvenAdSpend = revenue - otherCosts;
  const breakEvenROAS = breakEvenAdSpend > 0 ? revenue / breakEvenAdSpend : 0;

  return {
    revenue, totalCOGS, totalShipping, totalAds, totalMisc, netProfit,
    netMargin, roi, roas, costPerPurchase, totalLeads, totalOrders,
    deliveredOrders, rtoOrders, breakEvenROAS
  };
};

const analyzeProfitability = async (inputs, results, currency, apiKey) => {
  if (!apiKey) throw new Error("API Key is missing.");

  const ai = new GoogleGenAI({ apiKey });
  const rtoFinancialImpact = results.rtoOrders * (inputs.productCost + inputs.miscCost + inputs.shippingRTO);
  
  const prompt = \`
    You are an expert E-commerce Business Analyst for COD businesses.
    Currency: \${currency}
    
    FUNNEL:
    - Ad Spend: \${inputs.totalAdSpend}
    - CPL: \${inputs.costPerLead}
    - Confirmation: \${inputs.confirmationPercentage}%
    - Delivered: \${inputs.deliveredPercentage}%
    
    RESULTS:
    - Net Profit: \${results.netProfit.toFixed(2)}
    - ROAS: \${results.roas.toFixed(2)}
    - RTO Loss: \${rtoFinancialImpact.toFixed(2)}
    
    Task: Provide a short analysis and 3 actionable tips (focus on CPL, RTO, or Upsells) in JSON: { "analysis": "string", "tips": ["string"] }
  \`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("AI Error:", error);
    throw error;
  }
};

const formatCurrency = (amount, symbol) => \`\${symbol}\${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 } )}\`;
const formatPercent = (amount) => \`\${amount.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%\`;

// --- COMPONENTS ---
const InputGroup = ({ label, value, onChange, prefix, suffix, helperText, step = 1, min = 0 }) => (
  <div className="flex flex-col space-y-1 mb-3">
    <label className="text-sm font-medium text-slate-600 dark:text-slate-300 flex justify-between">
      {label}
      {helperText && <span className="text-xs text-slate-400 dark:text-slate-500 font-normal">{helperText}</span>}
    </label>
    <div className="relative rounded-md shadow-sm">
      {prefix && (
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <span className="text-slate-500 dark:text-slate-400 sm:text-sm">{prefix}</span>
        </div>
      )}
      <input
        type="number"
        min={min}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className={\`block w-full rounded-md border-0 py-2 text-slate-900 dark:text-white dark:bg-slate-900 ring-1 ring-inset ring-slate-300 dark:ring-slate-700 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 \${prefix ? 'pl-12' : 'pl-3'} \${suffix ? 'pr-8' : 'pr-3'}\`}
        style={{ colorScheme: 'light dark' }} 
      />
    </div>
  </div>
);

const MetricCard = ({ label, value, trend, subValue, highlight }) => {
  let valueColor = 'text-slate-900 dark:text-white';
  if (trend === 'positive') valueColor = 'text-emerald-600 dark:text-emerald-400';
  if (trend === 'negative') valueColor = 'text-rose-600 dark:text-rose-400';

  return (
    <div className={\`p-4 rounded-xl shadow-sm border \${
      highlight 
        ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800' 
        : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700'
    }\`}>
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
      <p className={\`mt-2 text-2xl font-bold \${valueColor}\`}>{value}</p>
      {subValue && <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{subValue}</p>}
    </div>
  );
};

// --- MAIN WIDGET APP ---
const WidgetApp = () => {
  const [inputs, setInputs] = useState(DEFAULT_INPUTS);
  const [results, setResults] = useState(calculateMetrics(DEFAULT_INPUTS));
  const [currency, setCurrency] = useState(Currency.MAD);
  const [apiKey, setApiKey] = useState('');
  
  // AI State
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);
  
  // Theme State
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setResults(calculateMetrics(inputs));
  }, [inputs]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const handleInputChange = (field, value) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  const handleAnalyze = async () => {
    if (!apiKey) {
      setAnalysisError("Please enter your Google Gemini API Key.");
      return;
    }
    setIsAnalyzing(true);
    setAnalysisError(null);
    try {
      const response = await analyzeProfitability(inputs, results, currency, apiKey);
      setAiAnalysis(response);
    } catch (e) {
      setAnalysisError("Analysis failed. Please check your API Key.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const costData = [
    { name: 'Product Cost', value: results.totalCOGS },
    { name: 'Shipping', value: results.totalShipping },
    { name: 'Ads', value: results.totalAds },
    { name: 'Misc', value: results.totalMisc },
  ];

  return (
    <div className={\`\${isDark ? 'dark' : ''} antialiased\`}>
      <div className="bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 max-w-5xl mx-auto font-sans text-slate-800 dark:text-slate-200 transition-colors duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
               <BarChart2 className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400">Profit Calc</h2>
          </div>
          <div className="flex items-center gap-3">
             <button onClick={toggleTheme} className="p-2 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg">
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
             </button>
             <select 
               value={currency} 
               onChange={(e) => setCurrency(e.target.value)}
               className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md py-1 px-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
             >
               <option value={Currency.MAD}>MAD</option>
               <option value={Currency.USD}>USD</option>
               <option value={Currency.EUR}>EUR</option>
               <option value={Currency.INR}>INR</option>
               <option value={Currency.GBP}>GBP</option>
             </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left: Inputs */}
          <div className="lg:col-span-5 space-y-5">
             <div className="bg-white dark:bg-slate-900 rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-800">
               <h3 className="text-xs font-bold uppercase text-slate-400 mb-4 tracking-wider">Unit Metrics</h3>
               <InputGroup label="Selling Price" value={inputs.sellingPrice} onChange={(v) => handleInputChange('sellingPrice', v)} prefix={currency} />
               <InputGroup label="Product Cost" value={inputs.productCost} onChange={(v) => handleInputChange('productCost', v)} prefix={currency} helperText="Lost on RTO" />
               <div className="grid grid-cols-2 gap-3">
                 <InputGroup label="Fwd Ship" value={inputs.shippingForward} onChange={(v) => handleInputChange('shippingForward', v)} prefix={currency} />
                 <InputGroup label="RTO Ship" value={inputs.shippingRTO} onChange={(v) => handleInputChange('shippingRTO', v)} prefix={currency} />
               </div>
               <InputGroup label="Misc Cost" value={inputs.miscCost} onChange={(v) => handleInputChange('miscCost', v)} prefix={currency} />
             </div>

             <div className="bg-white dark:bg-slate-900 rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-800">
               <h3 className="text-xs font-bold uppercase text-slate-400 mb-4 tracking-wider">Funnel Metrics</h3>
               <div className="grid grid-cols-2 gap-3 mb-4">
                 <InputGroup label="Ad Spend" value={inputs.totalAdSpend} onChange={(v) => handleInputChange('totalAdSpend', v)} prefix={currency} step={100} />
                 <InputGroup label="CPL" value={inputs.costPerLead} onChange={(v) => handleInputChange('costPerLead', v)} prefix={currency} />
               </div>
               
               <div className="space-y-4">
                 <div>
                    <div className="flex justify-between text-sm mb-1">
                       <span className="text-slate-600 dark:text-slate-400">Confirmation Rate</span>
                       <span className="font-bold text-indigo-600">{inputs.confirmationPercentage}%</span>
                    </div>
                    <input type="range" min="0" max="100" value={inputs.confirmationPercentage} onChange={(e) => handleInputChange('confirmationPercentage', parseFloat(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
                 </div>
                 <div>
                    <div className="flex justify-between text-sm mb-1">
                       <span className="text-slate-600 dark:text-slate-400">Delivered Rate</span>
                       <span className="font-bold text-emerald-600">{inputs.deliveredPercentage}%</span>
                    </div>
                    <input type="range" min="0" max="100" value={inputs.deliveredPercentage} onChange={(e) => handleInputChange('deliveredPercentage', parseFloat(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600" />
                 </div>
               </div>
             </div>
          </div>

          {/* Right: Results */}
          <div className="lg:col-span-7 space-y-5">
             
             {/* Big Profit Box */}
             <div className={\`rounded-xl p-6 text-white shadow-lg \${results.netProfit >= 0 ? 'bg-gradient-to-br from-emerald-500 to-teal-600' : 'bg-gradient-to-br from-rose-500 to-red-600'}\`}>
                <div className="flex justify-between items-start">
                   <div>
                     <p className="text-white/80 text-sm font-medium">Net Profit / Loss</p>
                     <p className="text-4xl font-bold mt-1">{formatCurrency(results.netProfit, currency)}</p>
                   </div>
                   <div className="text-right">
                     <p className="text-white/80 text-sm font-medium">Margin</p>
                     <p className="text-2xl font-bold mt-1">{formatPercent(results.netMargin)}</p>
                   </div>
                </div>
             </div>

             {/* Grid Stats */}
             <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <MetricCard label="ROAS" value={results.roas.toFixed(2) + 'x'} trend={results.roas >= results.breakEvenROAS ? 'positive' : 'negative'} />
                <MetricCard label="CPP" value={formatCurrency(results.costPerPurchase, currency)} highlight />
                <MetricCard label="RTO Loss" value={formatCurrency(results.rtoOrders * (inputs.productCost + inputs.miscCost + inputs.shippingRTO), currency)} trend="negative" />
                <MetricCard label="Total Orders" value={results.totalOrders} subValue={results.deliveredOrders + ' Delivered'} />
             </div>

             {/* Chart */}
             <div className="bg-white dark:bg-slate-900 p-5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
               <div className="flex flex-col sm:flex-row items-center gap-6">
                 <div className="h-48 w-full sm:w-1/2">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={costData.filter(d=>d.value>0)} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={5} dataKey="value" stroke="none">
                          {costData.map((e, i) => <Cell key={i} fill={[CHART_COLORS.cogs, CHART_COLORS.shipping, CHART_COLORS.ads, CHART_COLORS.misc][i]} />)}
                        </Pie>
                        <RechartsTooltip />
                      </PieChart>
                    </ResponsiveContainer>
                 </div>
                 <div className="w-full sm:w-1/2 space-y-2 text-sm">
                    {costData.map((d, i) => (
                      <div key={i} className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-1">
                         <span className="text-slate-500 dark:text-slate-400">{d.name}</span>
                         <span className="font-medium dark:text-white">{formatCurrency(d.value, currency)}</span>
                      </div>
                    ))}
                 </div>
               </div>
             </div>

             {/* AI Section */}
             <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-5 border border-indigo-100 dark:border-indigo-800">
                <div className="flex items-center gap-2 mb-3">
                   <BrainCircuit className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                   <h3 className="font-bold text-indigo-900 dark:text-indigo-200">AI Analysis</h3>
                </div>
                {!aiAnalysis ? (
                   <div className="flex gap-2">
                     <input 
                       type="password" 
                       placeholder="Enter Gemini API Key" 
                       value={apiKey}
                       onChange={(e) => setApiKey(e.target.value)}
                       className="flex-1 text-sm border border-slate-300 dark:border-slate-700 rounded px-3 py-2 dark:bg-slate-800 dark:text-white"
                     />
                     <button onClick={handleAnalyze} disabled={isAnalyzing} className="bg-indigo-600 text-white px-4 py-2 rounded text-sm hover:bg-indigo-700 disabled:opacity-50">
                        {isAnalyzing ? "..." : "Analyze"}
                     </button>
                   </div>
                ) : (
                   <div className="space-y-3">
                      <p className="text-sm text-indigo-800 dark:text-indigo-100 italic">"{aiAnalysis.analysis}"</p>
                      <button onClick={() => setAiAnalysis(null)} className="text-xs text-indigo-600 underline">Reset</button>
                   </div>
                )}
                {analysisError && <p className="text-xs text-rose-500 mt-2">{analysisError}</p>}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- MOUNTING ---
// Polling to wait for container to be ready in DOM (helps with Elementor/Builders)
const mountWidget = () => {
  const rootEl = document.getElementById('cod-calc-widget-root');
  if (rootEl && !rootEl.dataset.mounted) {
    rootEl.dataset.mounted = "true";
    try {
      const root = ReactDOM.createRoot(rootEl);
      root.render(<WidgetApp />);
    } catch (e) {
      console.error("Widget Mount Error:", e);
      rootEl.innerHTML = "<div style='color:red; padding:20px'>Error loading calculator. Check console.</div>";
    }
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountWidget);
} else {
  mountWidget();
}
// Fallback for async loading
setTimeout(mountWidget, 1000);
setTimeout(mountWidget, 3000);
</script>
`;
  return code;
};