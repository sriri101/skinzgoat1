export const generateWidgetCode = () => {
  const appUrl = "https://copy-of-cod-profit-calculator-846499830447.us-west1.run.app";
  
  return `<!-- GoatCalculator Embed -->
<iframe 
  src="${appUrl}" 
  width="100%" 
  height="900" 
  style="border: none; border-radius: 12px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); background-color: transparent;" 
  title="GoatCalculator"
  loading="lazy"
></iframe>`;
};