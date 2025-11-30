import React, { useState } from 'react';
import { X, Copy, Check } from 'lucide-react';
import { generateWidgetCode } from '../utils/widgetGenerator';

interface EmbedModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmbedModal: React.FC<EmbedModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const code = generateWidgetCode();

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]">
        
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">Embed Calculator</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            Copy the <strong>Iframe code</strong> below and paste it into your website (WordPress HTML Block, Elementor HTML Widget, or Shopify Custom Liquid).
          </p>
          
          <div className="relative group">
            <pre className="bg-slate-950 text-slate-300 p-4 rounded-lg text-xs font-mono overflow-x-auto h-40 border border-slate-800 whitespace-pre-wrap break-all">
              {code}
            </pre>
            <button 
              onClick={handleCopy}
              className="absolute top-2 right-2 bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-md transition-colors shadow-lg"
              title="Copy to clipboard"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          
          <div className="mt-6 space-y-3">
             <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg text-xs text-indigo-800 dark:text-indigo-200">
              <strong>WordPress/Elementor Instructions:</strong>
              <ol className="list-decimal list-inside mt-1 ml-1 space-y-1">
                <li>Add an <strong>HTML Widget</strong> to your page.</li>
                <li>Paste the code above into the widget.</li>
                <li>Update/Publish the page.</li>
              </ol>
            </div>
            
            <div className="text-xs text-slate-500 dark:text-slate-400">
              * You can adjust the <code>height="900"</code> value in the code if you need the calculator to be taller or shorter on your specific page.
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};