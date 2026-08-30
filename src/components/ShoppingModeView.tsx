import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  Store, 
  CheckCircle2, 
  Circle, 
  Sparkles, 
  DollarSign, 
  ShoppingBag, 
  ArrowRight,
  PartyPopper,
  Filter,
  MapPin,
  Snowflake,
  BadgePercent
} from 'lucide-react';
import { ShoppingItem, PartyProfile, CymbalDepartment } from '../types';
import { DEPARTMENT_METADATA } from '../data/presets';

interface ShoppingModeViewProps {
  profile: PartyProfile;
  items: ShoppingItem[];
  onUpdateItem: (itemId: string, updates: Partial<ShoppingItem>) => void;
  onOpenAddItem: () => void;
}

export const ShoppingModeView: React.FC<ShoppingModeViewProps> = ({
  profile,
  items,
  onUpdateItem,
  onOpenAddItem,
}) => {
  const currency = profile.currency || '$';
  const [activeDeptFilter, setActiveDeptFilter] = useState<string>('all');

  // Group items by CymbalMart Department / Aisle in optimal in-store walking order
  const departmentGroups = React.useMemo(() => {
    const groups: Record<string, ShoppingItem[]> = {};
    
    // Sort according to recommended route (Produce -> Deli -> Bakery -> Snacks -> Beverages -> Party -> Household -> Frozen/Ice)
    items.forEach((item) => {
      const dept = item.department || 'Produce & Fresh Market';
      if (!groups[dept]) groups[dept] = [];
      groups[dept].push(item);
    });
    return groups;
  }, [items]);

  const uniqueDepartments = Object.keys(departmentGroups);

  const toggleItemCheck = (item: ShoppingItem, deptName: string) => {
    const isNowBought = item.status !== 'purchased';
    const newStatus = isNowBought ? 'purchased' : 'to_buy';
    onUpdateItem(item.id, { status: newStatus });

    if (isNowBought) {
      const deptItems = departmentGroups[deptName] || [];
      const remainingUnbought = deptItems.filter(
        (i) => i.id !== item.id && i.status !== 'purchased' && i.status !== 'already_have'
      );
      if (remainingUnbought.length === 0) {
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.6 },
        });
      }
    }
  };

  const markAllDeptItems = (deptName: string, bought: boolean) => {
    const deptItems = departmentGroups[deptName] || [];
    deptItems.forEach((item) => {
      onUpdateItem(item.id, { status: bought ? 'purchased' : 'to_buy' });
    });
    if (bought) {
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.6 },
      });
    }
  };

  const visibleDepts = activeDeptFilter === 'all' 
    ? uniqueDepartments 
    : uniqueDepartments.filter((d) => d === activeDeptFilter);

  const totalCost = items.reduce((acc, it) => acc + (it.estimatedPrice || 0), 0);
  const purchasedCost = items
    .filter((i) => i.status === 'purchased' || i.status === 'already_have')
    .reduce((acc, it) => acc + (it.estimatedPrice || 0), 0);

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-950 text-white rounded-2xl p-4 sm:p-6 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-amber-300 text-xs font-bold uppercase tracking-wider mb-1">
            <MapPin className="w-4 h-4" />
            <span>CymbalMart In-Store Smart Navigator</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold font-display text-white">
            Optimized Aisle-by-Aisle Shopping Route
          </h2>
          <p className="text-xs sm:text-sm text-blue-200 max-w-xl mt-0.5">
            Follow our proven path: start with fresh produce, grab butcher meats, swing by party supplies, and hit the Ice Bay last so nothing melts!
          </p>
        </div>

        <div className="bg-blue-800/80 border border-blue-700/80 rounded-xl px-4 py-3 text-right shrink-0">
          <div className="text-[10px] uppercase font-bold text-blue-200">Cart Progress</div>
          <div className="text-lg font-bold font-mono text-white">
            {currency}{purchasedCost} <span className="text-blue-300 font-normal">/ {currency}{totalCost}</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setActiveDeptFilter('all')}
          className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
            activeDeptFilter === 'all'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
          }`}
        >
          All Departments ({items.length})
        </button>
        {uniqueDepartments.map((dept) => {
          const count = departmentGroups[dept]?.length || 0;
          return (
            <button
              key={dept}
              onClick={() => setActiveDeptFilter(dept)}
              className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
                activeDeptFilter === dept
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
              }`}
            >
              <span>{dept}</span>
              <span className="ml-1 opacity-70">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Department Cards */}
      <div className="space-y-4">
        {visibleDepts.map((deptName) => {
          const deptItems = departmentGroups[deptName] || [];
          const boughtCount = deptItems.filter((i) => i.status === 'purchased' || i.status === 'already_have').length;
          const isComplete = boughtCount === deptItems.length && deptItems.length > 0;
          const deptMeta = DEPARTMENT_METADATA[deptName as CymbalDepartment];
          const deptCost = deptItems.reduce((acc, it) => acc + (it.estimatedPrice || 0), 0);

          return (
            <div
              key={deptName}
              className={`rounded-2xl border transition-all overflow-hidden ${
                isComplete
                  ? 'bg-emerald-50/50 border-emerald-200'
                  : 'bg-white border-stone-200 shadow-xs'
              }`}
            >
              
              {/* Department Header */}
              <div className="p-4 sm:p-5 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-stone-50/60">
                <div className="flex items-center space-x-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
                    isComplete ? 'bg-emerald-600 text-white' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {isComplete ? <CheckCircle2 className="w-5 h-5" /> : <Store className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-bold text-sm text-stone-900">{deptName}</h3>
                      {deptMeta?.aisle && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                          {deptMeta.aisle}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-stone-500 mt-0.5">
                      {boughtCount} of {deptItems.length} items collected (${deptCost})
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => markAllDeptItems(deptName, !isComplete)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      isComplete
                        ? 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600 shadow-xs'
                    }`}
                  >
                    {isComplete ? 'Uncheck All' : 'Mark Aisle Complete'}
                  </button>
                </div>
              </div>

              {/* Items List */}
              <div className="divide-y divide-stone-100">
                {deptItems.map((item) => {
                  const isBought = item.status === 'purchased' || item.status === 'already_have';

                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleItemCheck(item, deptName)}
                      className={`p-4 flex items-center justify-between cursor-pointer transition-colors ${
                        isBought ? 'bg-stone-50/80 text-stone-400' : 'hover:bg-blue-50/40 text-stone-900'
                      }`}
                    >
                      <div className="flex items-center space-x-3.5 min-w-0 flex-1 pr-3">
                        <div className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-colors ${
                          isBought ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-stone-300 bg-white'
                        }`}>
                          {isBought && <CheckCircle2 className="w-4 h-4" />}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-2">
                            <span className={`text-xs font-bold truncate ${isBought ? 'line-through text-stone-400' : ''}`}>
                              {item.name}
                            </span>
                            {item.brandTier === 'cymbal_select' && (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-blue-100 text-blue-800">
                                Cymbal Select
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-stone-500 mt-0.5 flex items-center space-x-2">
                            <span>{item.quantity} {item.unit}</span>
                            {item.aisleNumber && <span>• {item.aisleNumber}</span>}
                            {item.notes && <span className="italic truncate">• {item.notes}</span>}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className={`text-xs font-mono font-bold ${isBought ? 'text-stone-400' : 'text-stone-900'}`}>
                          {currency}{item.estimatedPrice}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
