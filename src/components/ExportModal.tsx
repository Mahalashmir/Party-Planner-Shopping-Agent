import React, { useState } from 'react';
import { 
  X, 
  Printer, 
  Copy, 
  Check, 
  Download, 
  Share2, 
  FileSpreadsheet, 
  FileText,
  Store
} from 'lucide-react';
import { PartyPlan, ShoppingItem } from '../types';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: PartyPlan;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  plan,
}) => {
  const [copied, setCopied] = useState(false);
  if (!isOpen) return null;

  const { profile, items } = plan;
  const currency = profile.currency || '$';
  const totalCost = items.reduce((acc, i) => acc + (i.estimatedPrice || 0), 0);

  // Group by store for clean sharing text
  const storeGroups: Record<string, ShoppingItem[]> = {};
  items.forEach((item) => {
    const s = item.targetStore || 'General Store';
    if (!storeGroups[s]) storeGroups[s] = [];
    storeGroups[s].push(item);
  });

  // Generate plain text for WhatsApp / SMS
  const generatePlainText = () => {
    let text = `🎉 PARTY SHOPPING LIST: ${profile.title}\n`;
    text += `👥 Guests: ${profile.guestCount.total} (${profile.guestCount.adults} Adults, ${profile.guestCount.kids} Kids) | Length: ${profile.durationHours}h\n`;
    text += `💰 Estimated Total: ${currency}${totalCost} / Budget: ${currency}${profile.budget}\n`;
    text += `------------------------------------\n\n`;

    Object.entries(storeGroups).forEach(([store, storeItems]) => {
      text += `📍 ${store.toUpperCase()}:\n`;
      storeItems.forEach((item) => {
        const check = item.status === 'purchased' ? '✅' : '⬜';
        text += `  ${check} ${item.name} (${item.quantity} ${item.unit}) - ${currency}${item.estimatedPrice}${item.notes ? ` [${item.notes}]` : ''}\n`;
      });
      text += `\n`;
    });

    return text;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatePlainText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCSV = () => {
    const headers = ['Item Name', 'Category', 'Quantity', 'Unit', 'Estimated Price', 'Target Store', 'Priority', 'Status', 'Notes', 'Dietary'];
    const rows = items.map((i) => [
      `"${i.name.replace(/"/g, '""')}"`,
      `"${i.category}"`,
      i.quantity,
      `"${i.unit}"`,
      i.estimatedPrice,
      `"${i.targetStore}"`,
      `"${i.priority}"`,
      `"${i.status}"`,
      `"${(i.notes || '').replace(/"/g, '""')}"`,
      `"${(i.dietaryTag || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${profile.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_shopping_list.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadJSON = () => {
    const blob = new Blob([JSON.stringify(plan, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${profile.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_plan.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 no-print">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-stone-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <Share2 className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-display text-base font-bold text-white">
                Export & Share Shopping Plan
              </h3>
              <p className="text-[11px] text-stone-300">
                Print, copy for group chats, or export to spreadsheet
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="p-4 sm:p-6 bg-stone-50 border-b border-stone-200 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          
          <button
            id="btn-export-copy"
            onClick={handleCopy}
            className="p-3 bg-white hover:bg-stone-100 border border-stone-200 rounded-xl text-center transition-all shadow-2xs flex flex-col items-center justify-center space-y-1 text-stone-800"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600 stroke-3" /> : <Copy className="w-4 h-4 text-amber-600" />}
            <span className="text-xs font-bold">{copied ? 'Copied!' : 'Copy for Chat'}</span>
          </button>

          <button
            id="btn-export-print"
            onClick={handlePrint}
            className="p-3 bg-white hover:bg-stone-100 border border-stone-200 rounded-xl text-center transition-all shadow-2xs flex flex-col items-center justify-center space-y-1 text-stone-800"
          >
            <Printer className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-bold">Print Checklist</span>
          </button>

          <button
            id="btn-export-csv"
            onClick={handleDownloadCSV}
            className="p-3 bg-white hover:bg-stone-100 border border-stone-200 rounded-xl text-center transition-all shadow-2xs flex flex-col items-center justify-center space-y-1 text-stone-800"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold">Export CSV</span>
          </button>

          <button
            id="btn-export-json"
            onClick={handleDownloadJSON}
            className="p-3 bg-white hover:bg-stone-100 border border-stone-200 rounded-xl text-center transition-all shadow-2xs flex flex-col items-center justify-center space-y-1 text-stone-800"
          >
            <Download className="w-4 h-4 text-purple-600" />
            <span className="text-xs font-bold">Backup JSON</span>
          </button>

        </div>

        {/* Text Preview */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-white">
          <label className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block mb-2">
            Shareable Text Format (Grouped by Store Run)
          </label>
          <pre className="text-xs font-mono text-stone-800 bg-stone-50 p-4 rounded-xl border border-stone-200 whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto select-all">
            {generatePlainText()}
          </pre>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-stone-50 border-t border-stone-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-stone-900 text-white rounded-xl text-xs font-bold hover:bg-stone-800 transition-all"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
