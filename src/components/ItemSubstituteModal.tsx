import React, { useState } from 'react';
import { X, Sparkles, ArrowRight, DollarSign, Check, RefreshCw, BadgePercent, Store } from 'lucide-react';
import { ShoppingItem, PartyProfile, StoreType, BrandTier, CymbalDepartment } from '../types';

interface ItemSubstituteModalProps {
  isOpen: boolean;
  item: ShoppingItem | null;
  profile: PartyProfile;
  onClose: () => void;
  onApplySwap: (originalItem: ShoppingItem, newItem: Partial<ShoppingItem>) => void;
}

interface SwapOption {
  name: string;
  brandTier?: BrandTier;
  department?: CymbalDepartment;
  quantity?: number;
  unit?: string;
  estimatedPrice: number;
  store: StoreType;
  reason: string;
}

export const ItemSubstituteModal: React.FC<ItemSubstituteModalProps> = ({
  isOpen,
  item,
  profile,
  onClose,
  onApplySwap,
}) => {
  const [goal, setGoal] = useState<'cut_cost' | 'dietary' | 'easier_prep' | 'bulk_deal'>('cut_cost');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<SwapOption[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  if (!isOpen || !item) return null;

  const currency = profile.currency || '$';

  const fetchSuggestions = async (selectedGoal = goal) => {
    setIsLoading(true);
    setHasSearched(true);
    try {
      const res = await fetch('/api/party/item-substitute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item,
          goal:
            selectedGoal === 'cut_cost'
              ? 'Find budget-friendly Cymbal Select private label brand or cost-saving swap'
              : selectedGoal === 'dietary'
              ? 'Find vegan / vegetarian / gluten-free friendly alternative in CymbalMart'
              : selectedGoal === 'bulk_deal'
              ? 'Cymbal Wholesale Club bulk buying option'
              : 'Easier prep / pre-made convenience deli option',
          profile,
        }),
      });
      const data = await res.json();
      setSuggestions(data.suggestions || []);
    } catch (err) {
      console.error('Error fetching substitutes:', err);
      // Fallback suggestions
      setSuggestions([
        {
          name: `Cymbal Select ${item.name}`,
          brandTier: 'cymbal_select',
          department: item.department,
          quantity: item.quantity,
          unit: item.unit,
          estimatedPrice: Math.round(item.estimatedPrice * 0.75),
          store: 'CymbalMart Supercenter',
          reason: 'Switching to Cymbal Select store brand saves 25% with identical chef-quality taste.',
        },
        {
          name: `Cymbal Wholesale Club Pack ${item.name}`,
          brandTier: 'cymbal_select',
          department: 'Cymbal Wholesale Bulk',
          quantity: Math.round(item.quantity * 1.5),
          unit: item.unit,
          estimatedPrice: Math.round(item.estimatedPrice * 1.1),
          store: 'Cymbal Wholesale Club',
          reason: 'Wholesale bundle gives 50% more quantity for only 10% extra spend.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoalChange = (newGoal: typeof goal) => {
    setGoal(newGoal);
    fetchSuggestions(newGoal);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 no-print">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-stone-200 overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="px-5 py-4 bg-blue-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-white">
                CymbalMart Smart Swap Engine
              </h3>
              <p className="text-[11px] text-blue-200">
                Lower budget or swap dietary alternatives with AI
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-blue-200 hover:text-white rounded-lg hover:bg-blue-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Item Overview */}
        <div className="p-5 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-stone-500">Current Item in List</div>
            <div className="font-bold text-sm text-stone-900 mt-0.5">{item.name}</div>
            <div className="text-xs text-stone-500 mt-0.5">
              {item.quantity} {item.unit} • {item.department || item.targetStore}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-bold font-mono text-stone-900">{currency}{item.estimatedPrice}</div>
            <div className="text-[10px] font-semibold text-stone-500 capitalize">{item.priority.replace('_', ' ')}</div>
          </div>
        </div>

        {/* Goal Selector Buttons */}
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
              Select Substitution Goal
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleGoalChange('cut_cost')}
                className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-left flex items-center space-x-2 ${
                  goal === 'cut_cost'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                }`}
              >
                <BadgePercent className="w-4 h-4" />
                <span>Save 25% (Store Brand)</span>
              </button>

              <button
                type="button"
                onClick={() => handleGoalChange('dietary')}
                className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-left flex items-center space-x-2 ${
                  goal === 'dietary'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>Dietary / Allergen Safe</span>
              </button>

              <button
                type="button"
                onClick={() => handleGoalChange('bulk_deal')}
                className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-left flex items-center space-x-2 ${
                  goal === 'bulk_deal'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                }`}
              >
                <Store className="w-4 h-4" />
                <span>Wholesale Club Bulk</span>
              </button>

              <button
                type="button"
                onClick={() => handleGoalChange('easier_prep')}
                className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-left flex items-center space-x-2 ${
                  goal === 'easier_prep'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                }`}
              >
                <RefreshCw className="w-4 h-4" />
                <span>Pre-Made Convenience</span>
              </button>
            </div>
          </div>

          {/* Search Trigger if not fetched */}
          {!hasSearched && (
            <button
              onClick={() => fetchSuggestions(goal)}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all active:scale-95 flex items-center justify-center space-x-2"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Generate AI Swaps for this Item</span>
            </button>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="py-8 text-center space-y-2">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-stone-500">Searching CymbalMart catalog for best alternatives...</p>
            </div>
          )}

          {/* Suggestions List */}
          {!isLoading && hasSearched && suggestions.length > 0 && (
            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-stone-700">
                Recommended CymbalMart Swaps
              </div>

              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {suggestions.map((sug, idx) => {
                  const savings = item.estimatedPrice - sug.estimatedPrice;
                  return (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/70 hover:bg-blue-50/50 transition-colors flex flex-col justify-between space-y-2"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-bold text-xs text-stone-900">{sug.name}</div>
                          <div className="text-[11px] text-stone-500 mt-0.5">
                            {sug.quantity || item.quantity} {sug.unit || item.unit} • {sug.department || sug.store}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="font-bold font-mono text-xs text-stone-900">{currency}{sug.estimatedPrice}</div>
                          {savings > 0 && (
                            <div className="text-[10px] font-bold text-emerald-600">
                              Save {currency}{savings}
                            </div>
                          )}
                        </div>
                      </div>

                      <p className="text-[11px] text-stone-600 italic bg-white/70 p-2 rounded-lg border border-stone-200/60">
                        "{sug.reason}"
                      </p>

                      <button
                        onClick={() => {
                          onApplySwap(item, {
                            name: sug.name,
                            estimatedPrice: sug.estimatedPrice,
                            quantity: sug.quantity || item.quantity,
                            unit: sug.unit || item.unit,
                            brandTier: sug.brandTier || (sug.name.includes('Cymbal Select') ? 'cymbal_select' : 'brand_name'),
                            targetStore: sug.store || item.targetStore,
                            department: sug.department || item.department,
                          });
                          onClose();
                        }}
                        className="w-full py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-2xs flex items-center justify-center space-x-1.5 transition-all"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Apply Swap to Cart</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
