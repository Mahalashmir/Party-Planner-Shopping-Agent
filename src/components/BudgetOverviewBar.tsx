import React from 'react';
import { 
  DollarSign, 
  TrendingDown, 
  TrendingUp, 
  Users, 
  Store, 
  AlertCircle, 
  Sparkles,
  ShoppingBag,
  BadgePercent,
  ArrowRight,
  Sliders
} from 'lucide-react';
import { PartyProfile, ShoppingItem } from '../types';
import { DEPARTMENT_METADATA } from '../data/presets';

interface BudgetOverviewBarProps {
  profile: PartyProfile;
  items: ShoppingItem[];
  agentAdvice?: string;
  onOpenSetup: () => void;
  onOpenPortions: () => void;
  onOpenRefineCheckout: () => void;
}

export const BudgetOverviewBar: React.FC<BudgetOverviewBarProps> = ({
  profile,
  items,
  agentAdvice,
  onOpenSetup,
  onOpenPortions,
  onOpenRefineCheckout,
}) => {
  const currency = profile.currency || '$';
  const totalCost = items.reduce((acc, item) => acc + (item.estimatedPrice || 0), 0);
  const budget = profile.budget || 0;
  const diff = budget - totalCost;
  const isOver = diff < 0;
  const totalGuests = profile.guestCount.total || 1;
  const costPerGuest = (totalCost / totalGuests).toFixed(2);
  const percentUsed = budget > 0 ? Math.min(100, Math.round((totalCost / budget) * 100)) : 0;

  // Calculate total savings from Cymbal Select/Organics
  const totalSavings = items.reduce((acc, it) => {
    if (it.savings) return acc + it.savings;
    if (it.brandTier === 'cymbal_select') return acc + Math.round(it.estimatedPrice * 0.33);
    return acc;
  }, 0);

  // Department totals
  const deptTotals: Record<string, number> = {};
  items.forEach((item) => {
    const dept = item.department || 'Produce & Fresh Market';
    deptTotals[dept] = (deptTotals[dept] || 0) + (item.estimatedPrice || 0);
  });

  const purchasedCount = items.filter((i) => i.status === 'purchased' || i.status === 'already_have').length;

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-5 shadow-xs space-y-4">
      
      {/* Top row: 4 Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Total Estimated Cost */}
        <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-100 flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-500 text-xs font-semibold">
            <span>Estimated Total</span>
            <DollarSign className="w-3.5 h-3.5 text-stone-400" />
          </div>
          <div className="mt-1">
            <div className="text-xl sm:text-2xl font-bold font-display text-stone-900">
              {currency}{totalCost.toLocaleString()}
            </div>
            <div className="text-[11px] text-stone-500 font-medium">
              Target: {currency}{budget.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Budget Status / Variance */}
        <div className={`p-3.5 rounded-xl border flex flex-col justify-between ${
          isOver 
            ? 'bg-rose-50/70 border-rose-200 text-rose-900' 
            : 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
        }`}>
          <div className="flex items-center justify-between text-xs font-semibold">
            <span>Budget Alignment</span>
            {isOver ? (
              <TrendingUp className="w-3.5 h-3.5 text-rose-600" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5 text-emerald-600" />
            )}
          </div>
          <div className="mt-1">
            <div className="text-xl sm:text-2xl font-bold font-display">
              {isOver ? `+${currency}${Math.abs(diff)}` : `-${currency}${diff}`}
            </div>
            <div className="text-[11px] font-medium opacity-80">
              {isOver ? 'Over target budget' : 'Under budget buffer'}
            </div>
          </div>
        </div>

        {/* Cost per Attendee */}
        <div 
          onClick={onOpenPortions}
          role="button"
          className="p-3.5 rounded-xl bg-stone-50 border border-stone-100 flex flex-col justify-between cursor-pointer hover:bg-stone-100/70 transition-colors"
          title="Click to view portion calculator"
        >
          <div className="flex items-center justify-between text-stone-500 text-xs font-semibold">
            <span>Per-Guest Cost</span>
            <Users className="w-3.5 h-3.5 text-stone-400" />
          </div>
          <div className="mt-1">
            <div className="text-xl sm:text-2xl font-bold font-display text-stone-900">
              {currency}{costPerGuest}
            </div>
            <div className="text-[11px] text-stone-500 font-medium">
              {totalGuests} guests ({profile.guestCount.adults}A, {profile.guestCount.kids}K)
            </div>
          </div>
        </div>

        {/* Cymbal Select Savings & Checkout Trigger */}
        <div 
          onClick={onOpenRefineCheckout}
          role="button"
          className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 flex flex-col justify-between cursor-pointer hover:bg-blue-100/80 transition-colors"
          title="Click to Refine & Checkout"
        >
          <div className="flex items-center justify-between text-blue-800 text-xs font-bold">
            <span className="flex items-center space-x-1">
              <BadgePercent className="w-3.5 h-3.5 text-blue-600" />
              <span>Cymbal Savings</span>
            </span>
            <span className="text-[10px] text-blue-700 font-bold uppercase">Refine & Pay →</span>
          </div>
          <div className="mt-1">
            <div className="text-xl sm:text-2xl font-bold font-display text-blue-950">
              ${totalSavings}
            </div>
            <div className="text-[11px] text-blue-800 font-medium">
              Unlocked via Cymbal Select
            </div>
          </div>
        </div>

      </div>

      {/* Progress Bar: Total Budget Usage */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-medium">
          <span className="text-stone-600 flex items-center space-x-1.5">
            <span>Budget Utilization</span>
            <span className="font-bold text-stone-900">({percentUsed}%)</span>
          </span>
          <span className="text-stone-500 text-[11px]">
            {purchasedCount} of {items.length} items acquired ({items.length > 0 ? Math.round((purchasedCount / items.length) * 100) : 0}%)
          </span>
        </div>

        <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden flex">
          <div 
            className={`h-full transition-all duration-500 ${
              isOver ? 'bg-rose-500' : 'bg-blue-600'
            }`}
            style={{ width: `${Math.min(100, (totalCost / (budget || 1)) * 100)}%` }}
          />
        </div>
      </div>

      {/* Department Breakdown Mini-Bar */}
      <div className="pt-2 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <span className="text-stone-400 text-[11px] font-semibold">Cymbal Aisles:</span>
          {Object.entries(deptTotals).slice(0, 5).map(([dept, cost]) => (
            <span 
              key={dept} 
              className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 text-[11px] font-medium"
            >
              <span className="truncate max-w-[120px]">{dept}</span>
              <span className="font-bold text-stone-900 font-mono">${cost}</span>
            </span>
          ))}
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onOpenRefineCheckout}
            className="inline-flex items-center space-x-1 px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all active:scale-95"
          >
            <Sliders className="w-3 h-3" />
            <span>Refine & Checkout</span>
          </button>
        </div>
      </div>

      {/* Agent Strategic Tip Banner */}
      {agentAdvice && (
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 flex items-start space-x-2.5 text-xs text-amber-900">
          <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold text-amber-950">CymbalMart Agent Advice: </span>
            <span className="text-amber-900/90">{agentAdvice}</span>
          </div>
        </div>
      )}

    </div>
  );
};
