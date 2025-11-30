import JSZip from 'jszip';

export const generatePluginZip = async () => {
  const zip = new JSZip();

  // 1. PHP Plugin File
  const phpContent = `<?php
/**
 * Plugin Name: COD Profit Calculator
 * Description: A React-based profitability calculator for COD e-commerce. Use shortcode [cod_profit_calculator] to display.
 * Version: 1.1.0
 * Author: AI Assistant
 */

function cpc_enqueue_scripts() {
    global $post;
    if ( is_a( $post, 'WP_Post' ) && has_shortcode( $post->post_content, 'cod_profit_calculator' ) ) {
        
        // Tailwind CSS
        wp_enqueue_script( 'tailwindcss', 'https://cdn.tailwindcss.com', array(), '3.4.0', false );
        
        // Tailwind Config to scope styles and enable dark mode
        wp_add_inline_script('tailwindcss', "
            tailwind.config = {
                darkMode: 'class',
                important: '#cod-calculator-root', // High specificity to override theme styles
            }
        ");

        // Enqueue the main app script
        $script_url = plugins_url( 'assets/cod-app.js', __FILE__ );
        wp_enqueue_script( 'cod-calculator-app', $script_url, array(), '1.1.0', true );
        
        // Add type="module" attribute
        add_filter( 'script_loader_tag', 'cpc_add_type_attribute', 10, 3 );
    }
}
add_action( 'wp_enqueue_scripts', 'cpc_enqueue_scripts' );

function cpc_add_type_attribute( $tag, $handle, $src ) {
    if ( 'cod-calculator-app' !== $handle ) {
        return $tag;
    }
    return '<script type="module" src="' . esc_url( $src ) . '"></script>';
}

// Shortcode with attributes for Elementor control
function cpc_shortcode($atts) {
    $a = shortcode_atts( array(
        'max_width' => '100%',
        'align' => 'center', // left, center, right
    ), $atts );
    
    $style = "max-width: " . esc_attr($a['max_width']) . "; width: 100%;";
    
    if ($a['align'] === 'center') {
        $style .= " margin-left: auto; margin-right: auto;";
    } elseif ($a['align'] === 'right') {
        $style .= " margin-left: auto; margin-right: 0;";
    } else {
        $style .= " margin-right: auto; margin-left: 0;";
    }
    
    // Add min-height to prevent layout shift
    $style .= " min-height: 600px;";

    return '<div id="cod-calculator-root" style="' . $style . '" data-mounted="false">Loading Calculator...</div>';
}
add_shortcode( 'cod_profit_calculator', 'cpc_shortcode' );
?>`;

  // 2. JavaScript Application Bundle (Consolidated)
  // We use explicit dependencies in the URL to ensure all libraries share the EXACT SAME React instance.
  // This prevents the "Hooks can only be called inside the body of a function component" error.
  const jsContent = `
import React, { useState, useEffect } from 'https://esm.sh/react@18.2.0';
import ReactDOM from 'https://esm.sh/react-dom@18.2.0/client';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'https://esm.sh/recharts@2.12.0?deps=react@18.2.0,react-dom@18.2.0';
import { BarChart2, TrendingUp, BrainCircuit, Moon, Sun, Filter, Users, PackageCheck, Download } from 'https://esm.sh/lucide-react@0.300.0?deps=react@18.2.0';
import { GoogleGenAI } from 'https://esm.sh/@google/genai@0.1.1';

// --- CONSTANTS & TYPES ---
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

// --- UTILS ---
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
  const totalCOGS = totalOrders * productCost;
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

const formatCurrency = (amount, symbol) => {
  return \`\${symbol}\${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}\`;
};

const formatPercent = (amount) => {
  return \`\${amount.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%\`;
};

// --- SERVICES ---
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
      />
      {suffix && (
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
          <span className="text-slate-500 dark:text-slate-400 sm:text-sm">{suffix}</span>
        </div>
      )}
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

const DonutChart = ({ data }) => {
  const getColor = (name) => {
    switch (name) {
      case 'Product Cost': return CHART_COLORS.cogs;
      case 'Shipping': return CHART_COLORS.shipping;
      case 'Ads': return CHART_COLORS.ads;
      case 'Misc': return CHART_COLORS.misc;
      case 'Profit': return CHART_COLORS.profit;
      default: return '#cbd5e1';
    }
  };
  const filteredData = data.filter(d => d.value > 0);
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={filteredData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
            stroke="none"
          >
            {filteredData.map((entry, index) => (
              <Cell key={\`cell-\${index}\`} fill={getColor(entry.name)} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value) => value.toLocaleString()}
            contentStyle={{ borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#1e293b', color: '#f8fafc' }}
          />
          <Legend verticalAlign="bottom" height={36}/>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

// --- MAIN APP ---
const App = () => {
  const [inputs, setInputs] = useState(DEFAULT_INPUTS);
  const [results, setResults] = useState(calculateMetrics(DEFAULT_INPUTS));
  const [currency, setCurrency] = useState(Currency.MAD);
  const [apiKey, setApiKey] = useState('');
  
  // AI State
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);

  useEffect(() => {
    setResults(calculateMetrics(inputs));
  }, [inputs]);

  const handleInputChange = (field, value) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  const handleAnalyze = async () => {
    if (!apiKey) {
      setAnalysisError("Please enter your Google Gemini API Key below.");
      return;
    }
    setIsAnalyzing(true);
    setAnalysisError(null);
    try {
      const response = await analyzeProfitability(inputs, results, currency, apiKey);
      setAiAnalysis(response);
    } catch (e) {
      setAnalysisError("Analysis failed. Verify your API Key.");
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
    <div className="p-4 sm:p-6 bg-slate-50 dark:bg-slate-950 rounded-lg text-slate-800 dark:text-slate-200">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
           <BarChart2 className="w-6 h-6 text-indigo-600" />
           Profit Calculator
        </h2>
        <div className="flex gap-2">
            <select 
              value={currency} 
              onChange={(e) => setCurrency(e.target.value)}
              className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md py-1 px-3 text-sm"
            >
              <option value={Currency.MAD}>MAD</option>
              <option value={Currency.USD}>USD ($)</option>
              <option value={Currency.EUR}>EUR (€)</option>
            </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* INPUTS */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 p-5">
             <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-4">Unit Economics</h3>
             <InputGroup label="Selling Price" value={inputs.sellingPrice} onChange={(v) => handleInputChange('sellingPrice', v)} prefix={currency} />
             <InputGroup label="Product Cost" value={inputs.productCost} onChange={(v) => handleInputChange('productCost', v)} prefix={currency} helperText="Lost on RTO" />
             <div className="grid grid-cols-2 gap-3">
               <InputGroup label="Fwd Shipping" value={inputs.shippingForward} onChange={(v) => handleInputChange('shippingForward', v)} prefix={currency} />
               <InputGroup label="RTO Shipping" value={inputs.shippingRTO} onChange={(v) => handleInputChange('shippingRTO', v)} prefix={currency} />
             </div>
             <InputGroup label="Misc / Packing" value={inputs.miscCost} onChange={(v) => handleInputChange('miscCost', v)} prefix={currency} />
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 p-5">
             <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-4">Funnel Metrics</h3>
             <div className="grid grid-cols-2 gap-3 mb-4">
                <InputGroup label="Total Ad Spend" value={inputs.totalAdSpend} onChange={(v) => handleInputChange('totalAdSpend', v)} prefix={currency} step={100} />
                <InputGroup label="CPL" value={inputs.costPerLead} onChange={(v) => handleInputChange('costPerLead', v)} prefix={currency} />
             </div>
             
             <div className="space-y-4">
               <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1"><Users className="w-3 h-3"/> Confirmation Rate</span>
                    <span className="font-bold text-indigo-600">{inputs.confirmationPercentage}%</span>
                  </div>
                  <input type="range" min="0" max="100" value={inputs.confirmationPercentage} onChange={(e) => handleInputChange('confirmationPercentage', parseFloat(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
               </div>
               <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1"><PackageCheck className="w-3 h-3"/> Delivered Rate</span>
                    <span className="font-bold text-emerald-600">{inputs.deliveredPercentage}%</span>
                  </div>
                  <input type="range" min="0" max="100" value={inputs.deliveredPercentage} onChange={(e) => handleInputChange('deliveredPercentage', parseFloat(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600" />
               </div>
             </div>
          </div>
        </div>

        {/* RESULTS */}
        <div className="lg:col-span-7 space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
             <div className={\`col-span-2 sm:col-span-3 rounded-xl p-5 text-white \${results.netProfit >= 0 ? 'bg-gradient-to-r from-emerald-500 to-teal-600' : 'bg-gradient-to-r from-rose-500 to-red-600'}\`}>
                <p className="opacity-90 text-sm font-medium">Net Profit</p>
                <p className="text-3xl font-bold mt-1">{formatCurrency(results.netProfit, currency)}</p>
                <div className="flex gap-4 mt-3 text-sm opacity-90 border-t border-white/20 pt-2">
                   <span>Margin: {formatPercent(results.netMargin)}</span>
                   <span>Revenue: {formatCurrency(results.revenue, currency)}</span>
                </div>
             </div>
             <MetricCard label="ROAS" value={results.roas.toFixed(2) + 'x'} trend={results.roas >= results.breakEvenROAS ? 'positive' : 'negative'} />
             <MetricCard label="CPP" value={formatCurrency(results.costPerPurchase, currency)} />
             <MetricCard label="RTO Loss" value={formatCurrency(results.rtoOrders * (inputs.productCost + inputs.miscCost + inputs.shippingRTO), currency)} trend="negative" />
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
             <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="flex-1 w-full"><DonutChart data={costData} /></div>
                <div className="flex-1 space-y-2 w-full text-sm">
                   {costData.map((d, i) => (
                      <div key={i} className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-1">
                         <span className="text-slate-600 dark:text-slate-400">{d.name}</span>
                         <span className="font-medium dark:text-white">{formatCurrency(d.value, currency)}</span>
                      </div>
                   ))}
                </div>
             </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
             <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-4">
               <BrainCircuit className="w-5 h-5 text-indigo-500" /> AI Insights
             </h3>
             
             {!aiAnalysis ? (
               <div className="space-y-3">
                 <input 
                   type="password" 
                   placeholder="Paste Gemini API Key here to unlock insights" 
                   value={apiKey}
                   onChange={(e) => setApiKey(e.target.value)}
                   className="w-full border p-2 rounded text-sm bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-white placeholder-slate-400"
                 />
                 <button 
                   onClick={handleAnalyze} 
                   disabled={isAnalyzing}
                   className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition disabled:opacity-50 flex justify-center items-center gap-2"
                 >
                   {isAnalyzing ? "Analyzing..." : <>Analyze with Gemini <TrendingUp className="w-3 h-3"/></>}
                 </button>
                 {analysisError && <p className="text-rose-500 text-sm">{analysisError}</p>}
               </div>
             ) : (
               <div className="space-y-4 animate-in fade-in">
                 <p className="text-slate-700 dark:text-slate-300 italic">"{aiAnalysis.analysis}"</p>
                 <ul className="space-y-2">
                   {aiAnalysis.tips.map((tip, i) => (
                     <li key={i} className="flex gap-2 text-sm text-slate-600 dark:text-slate-400">
                       <span className="text-emerald-500 font-bold">•</span> {tip}
                     </li>
                   ))}
                 </ul>
                 <button onClick={() => setAiAnalysis(null)} className="text-xs text-indigo-500 hover:underline">New Analysis</button>
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- MOUNTING LOGIC ---
const mountApp = () => {
    const rootElement = document.getElementById('cod-calculator-root');
    // Ensure element exists and we haven't mounted already
    if (rootElement && rootElement.dataset.mounted !== "true") {
        rootElement.dataset.mounted = "true";
        rootElement.innerHTML = ""; // Clear loading text
        const root = ReactDOM.createRoot(rootElement);
        root.render(<App />);
    }
};

// 1. Try mounting immediately (fastest)
mountApp();

// 2. Retry on standard window events
window.addEventListener('DOMContentLoaded', mountApp);
window.addEventListener('load', mountApp);

// 3. Polling fallback for Page Builders (Elementor/Divi) that load content via JS/Ajax
const pollInterval = setInterval(() => {
    const rootElement = document.getElementById('cod-calculator-root');
    if (rootElement && rootElement.dataset.mounted === "true") {
        clearInterval(pollInterval); // Stop if mounted
    } else {
        mountApp(); // Try to mount
    }
}, 500);

// Stop polling after 10 seconds to save performance
setTimeout(() => clearInterval(pollInterval), 10000);
`;

  // 3. Add files to ZIP
  zip.file("cod-profit-calculator.php", phpContent);
  zip.file("assets/cod-app.js", jsContent);
  
  // 4. Generate Blob
  const blob = await zip.generateAsync({ type: "blob" });
  
  // 5. Trigger Download
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "cod-profit-calculator-plugin-v1.1.zip";
  a.click();
  window.URL.revokeObjectURL(url);
};