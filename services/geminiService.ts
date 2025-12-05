
import { GoogleGenAI } from "@google/genai";
import { CalculatorInputs, CalculatorResults, AIAnalysisResponse, Currency } from '../types';

export const analyzeProfitability = async (
  inputs: CalculatorInputs,
  results: CalculatorResults,
  currency: Currency
): Promise<AIAnalysisResponse> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key not found in environment variables");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Calculate RTO Impact based on the user's specific logic:
  // Loss = Product Cost (Lost) + Misc/Packaging Cost (Lost) + RTO Shipping (if any)
  // Note: Forward shipping is treated as free/refunded for RTOs in this model, so we don't count it as a loss here, 
  // or rather it was never an expense.
  const rtoFinancialImpact = results.rtoOrders * (inputs.productCost + inputs.miscCost + inputs.shippingRTO);

  const prompt = `
    You are an expert E-commerce Business Analyst specializing in Cash on Delivery (COD) dropshipping and brand building.
    
    Analyze the following business metrics for a store.
    NOTE: This business has a specific model where RTO (Return) orders result in the loss of the PRODUCT and PACKAGING, but Shipping is Free (no cost incurred for shipping on returns).
    
    Currency: ${currency}
    
    FUNNEL INPUTS:
    - Ad Spend: ${results.totalAds}
    - Cost Per Lead (CPL): ${inputs.costPerLead}
    - Lead Confirmation Rate: ${inputs.confirmationPercentage}%
    - Total Leads: ${results.totalLeads}
    - Total Confirmed Orders: ${results.totalOrders}
    - Delivered Rate: ${inputs.deliveredPercentage}% (RTO Rate: ${100 - inputs.deliveredPercentage}%)

    UNIT ECONOMICS:
    - Selling Price: ${inputs.sellingPrice}
    - Product Cost (COGS): ${inputs.productCost} (Lost on both Delivered and RTO orders)
    - Forward Shipping: ${inputs.shippingForward} (Paid only on Delivered orders)
    - RTO Shipping: ${inputs.shippingRTO}
    
    FINANCIAL RESULTS:
    - Total Revenue: ${results.revenue.toFixed(2)}
    - Net Profit: ${results.netProfit.toFixed(2)}
    - Net Margin: ${results.netMargin.toFixed(2)}%
    - ROAS: ${results.roas.toFixed(2)}
    - Cost Per Purchase (CPP/CPA): ${results.costPerPurchase.toFixed(2)}
    - RTO Impact (Total Loss from Returns): ${rtoFinancialImpact.toFixed(2)}
    
    Task:
    1. Provide a short, hard-hitting analysis of the profitability. Mention the Lead-to-Delivery funnel efficiency.
    2. Provide 3 specific, actionable tips to improve Net Profit. 
       - Consider if they should focus on lowering CPL, improving Confirmation Rate, or fixing RTOs.
       - Consider the impact of product loss on returns.
    
    Return the response as a valid JSON object with the following structure:
    {
      "analysis": "string",
      "tips": ["string", "string", "string"]
    }
    Do not use markdown code blocks in the output, just the raw JSON string.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const text = response.text || "{}";
    return JSON.parse(text) as AIAnalysisResponse;
  } catch (error) {
    console.error("Gemini analysis failed:", error);
    return {
      analysis: "Unable to generate analysis at this time. Please check your API key and connection.",
      tips: ["Check your internet connection.", "Ensure metrics are valid.", "Try again later."]
    };
  }
};
