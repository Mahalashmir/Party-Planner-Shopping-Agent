import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Sparkles, 
  Check, 
  Trash2, 
  ChevronDown, 
  ChevronRight, 
  ShoppingCart, 
  Store, 
  ArrowUpDown,
  Utensils,
  Salad,
  Soup,
  Cake,
  Wine,
  CupSoda,
  ShoppingBag,
  PartyPopper,
  Snowflake,
  RotateCcw,
  CheckCheck,
  BadgePercent,
  Layers,
  MapPin,
  Tag,
  Edit3,
  Calculator,
  Sliders,
  DollarSign,
  TrendingDown,
  TrendingUp,
  CheckCircle2
} from 'lucide-react';
import { ShoppingItem, PartyProfile, ItemCategory, StoreType, ItemStatus, ItemPriority, CymbalDepartment, BrandTier } from '../types';
import { CATEGORY_METADATA, STORE_BADGES, DEPARTMENT_METADATA, BRAND_TIERS } from '../data/presets';
import { EditItemModal } from './EditItemModal';

interface ShoppingListDashboardProps {
  profile: PartyProfile;
  items: ShoppingItem[];
  onUpdateItem: (itemId: string, updates: Partial<ShoppingItem>) => void;
  onDeleteItem: (itemId: string) => void;
  onAddItemClick: () => void;
  onOpenSubstituteModal: (item: ShoppingItem) => void;
  onBatchUpdateStatus: (itemIds: string[], status: ItemStatus) => void;
  onBatchUpdateItems?: (updatedItems: ShoppingItem[]) => void;
}

const CATEGORY_ICONS: Record<string, any> = {
  food_mains: Utensils,
  food_sides: Salad,
  food_appetizers: Soup,
  food_dessert: Cake,
  beverages_alcoholic: Wine,
  beverages_nonalcoholic: CupSoda,
  tableware_disposables: ShoppingBag,
  decorations: Sparkles,
  entertainment_favors: PartyPopper,
  ice_essentials: Snowflake,
  cleanup_hardware: Trash2,
};

export const ShoppingListDashboard: React.FC<ShoppingListDashboardProps> = ({
  profile,
  items,
  onUpdateItem,
  onDeleteItem,
  onAddItemClick,
  onOpenSubstituteModal,
  onBatchUpdateStatus,
  onBatchUpdateItems,
}) => {
  const currency = profile.currency || '$';
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [groupBy, setGroupBy] = useState<'department' | 'category' | 'brandTier' | 'store'>('department');
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const [editingItem, setEditingItem] = useState<ShoppingItem | null>(null);

  const toggleGroup = (key: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Step quantity with automatic proportional price and savings calculation
  const handleStepQuantity = (item: ShoppingItem, delta: number) => {
    const newQuantity = Math.max(1, item.quantity + delta);
    if (newQuantity === item.quantity) return;
    const unitPrice = item.quantity > 0 ? (item.estimatedPrice / item.quantity) : item.estimatedPrice;
    const newEstimatedPrice = Math.max(1, Math.round(unitPrice * newQuantity));
    let newOriginalPrice = item.originalPrice;
    let newSavings = item.savings;
    if (item.originalPrice && item.quantity > 0) {
      newOriginalPrice = Math.round((item.originalPrice / item.quantity) * newQuantity);
    }
    if (item.savings && item.quantity > 0) {
      newSavings = Math.round((item.savings / item.quantity) * newQuantity);
    }
    onUpdateItem(item.id, {
      quantity: newQuantity,
      estimatedPrice: newEstimatedPrice,
      originalPrice: newOriginalPrice,
      savings: newSavings,
    });
  };

  // Convert national brand items to Cymbal Select
  const handleBulkCymbalSelect = () => {
    const updated = items.map((it) => {
      if (it.brandTier === 'brand_name' || !it.brandTier) {
        const discounted = Math.max(1, Math.round(it.estimatedPrice * 0.75));
        const savingsAmount = it.estimatedPrice - discounted;
        const brandPrefixedName = it.name.includes('Cymbal Select')
          ? it.name
          : `Cymbal Select ${it.name.replace(/^[A-Z][a-z]+'s\s+/, '')}`;
        return {
          ...it,
          name: brandPrefixedName,
          brandTier: 'cymbal_select' as BrandTier,
          estimatedPrice: discounted,
          originalPrice: it.estimatedPrice,
          savings: (it.savings || 0) + savingsAmount,
        };
      }
      return it;
    });
    if (onBatchUpdateItems) {
      onBatchUpdateItems(updated);
    } else {
      updated.forEach((it) => onUpdateItem(it.id, it));
    }
  };

  // Auto-align quantities to match target budget
  const handleAutoAlignBudget = () => {
    const currentTotal = items.reduce((acc, it) => acc + (it.estimatedPrice || 0), 0);
    const targetBudget = profile.budget || 200;
    if (currentTotal <= targetBudget) return;

    const ratio = targetBudget / currentTotal;
    const updated = items.map((it) => {
      // Keep must-haves intact as much as possible, trim optional or scale quantities
      if (it.priority === 'optional' && it.quantity > 1) {
        const newQty = Math.max(1, Math.floor(it.quantity * ratio));
        const unitPrice = it.estimatedPrice / it.quantity;
        return {
          ...it,
          quantity: newQty,
          estimatedPrice: Math.max(1, Math.round(unitPrice * newQty)),
        };
      } else if (it.priority === 'recommended' && it.quantity > 2) {
        const newQty = Math.max(1, Math.floor(it.quantity * 0.85));
        const unitPrice = it.estimatedPrice / it.quantity;
        return {
          ...it,
          quantity: newQty,
          estimatedPrice: Math.max(1, Math.round(unitPrice * newQty)),
        };
      }
      return it;
    });

    if (onBatchUpdateItems) {
      onBatchUpdateItems(updated);
    } else {
      updated.forEach((it) => onUpdateItem(it.id, it));
    }
  };

  // Live Budget Calculations
  const totalListCost = useMemo(() => items.reduce((acc, it) => acc + (it.estimatedPrice || 0), 0), [items]);
  const mustHaveCost = useMemo(() => items.filter((it) => it.priority === 'must_have').reduce((acc, it) => acc + (it.estimatedPrice || 0), 0), [items]);
  const recommendedCost = useMemo(() => items.filter((it) => it.priority === 'recommended').reduce((acc, it) => acc + (it.estimatedPrice || 0), 0), [items]);
  const optionalCost = useMemo(() => items.filter((it) => it.priority === 'optional').reduce((acc, it) => acc + (it.estimatedPrice || 0), 0), [items]);
  const totalSavings = useMemo(() => {
    return items.reduce((acc, it) => {
      if (it.savings) return acc + it.savings;
      if (it.brandTier === 'cymbal_select') return acc + Math.round(it.estimatedPrice * 0.33);
      return acc;
    }, 0);
  }, [items]);

  const budgetDiff = profile.budget - totalListCost;
  const isOverBudget = budgetDiff < 0;

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesNotes = (item.notes || '').toLowerCase().includes(q);
        const matchesDiet = (item.dietaryTag || '').toLowerCase().includes(q);
        const matchesDept = (item.department || '').toLowerCase().includes(q);
        const matchesAisle = (item.aisleNumber || '').toLowerCase().includes(q);
        if (!matchesName && !matchesNotes && !matchesDiet && !matchesDept && !matchesAisle) return false;
      }
      // Department filter
      if (selectedDepartment !== 'all' && item.department !== selectedDepartment) return false;
      // Status filter
      if (selectedStatus !== 'all' && item.status !== selectedStatus) return false;
      // Priority filter
      if (selectedPriority !== 'all' && item.priority !== selectedPriority) return false;
      // Brand filter
      if (selectedBrand !== 'all' && item.brandTier !== selectedBrand) return false;

      return true;
    });
  }, [items, searchQuery, selectedDepartment, selectedStatus, selectedPriority, selectedBrand]);

  // Grouped structure
  const groupedData: Record<string, ShoppingItem[]> = useMemo(() => {
    const groups: Record<string, ShoppingItem[]> = {};

    if (groupBy === 'department') {
      filteredItems.forEach((item) => {
        const dept = item.department || 'Produce & Fresh Market';
        if (!groups[dept]) groups[dept] = [];
        groups[dept].push(item);
      });
    } else if (groupBy === 'brandTier') {
      filteredItems.forEach((item) => {
        const brand = item.brandTier || 'brand_name';
        if (!groups[brand]) groups[brand] = [];
        groups[brand].push(item);
      });
    } else if (groupBy === 'store') {
      filteredItems.forEach((item) => {
        const store = item.targetStore || 'CymbalMart Supercenter';
        if (!groups[store]) groups[store] = [];
        groups[store].push(item);
      });
    } else {
      // By category
      filteredItems.forEach((item) => {
        const cat = item.category || 'food_mains';
        if (!groups[cat]) groups[cat] = [];
        groups[cat].push(item);
      });
    }

    return groups;
  }, [filteredItems, groupBy]);

  const totalFilteredCost = filteredItems.reduce((acc, it) => acc + (it.estimatedPrice || 0), 0);

  return (
    <div className="space-y-4">
      
      {/* Controls Bar: Search, Filters & Grouping */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-3">
        
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          
          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="input-search-items"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search items, ingredients, aisles, dietary tags..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-stone-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-xs font-medium placeholder:text-stone-400 text-stone-900 transition-all bg-stone-50/50"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Group By Selector */}
          <div className="flex items-center space-x-2 shrink-0">
            <span className="text-xs font-bold text-stone-500 flex items-center space-x-1">
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Group By:</span>
            </span>
            <div className="flex rounded-xl bg-stone-100 p-1 border border-stone-200/70 text-xs font-semibold">
              <button
                id="btn-group-department"
                onClick={() => setGroupBy('department')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  groupBy === 'department' ? 'bg-white text-blue-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Cymbal Aisle
              </button>
              <button
                id="btn-group-category"
                onClick={() => setGroupBy('category')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  groupBy === 'category' ? 'bg-white text-blue-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Category
              </button>
              <button
                id="btn-group-brand"
                onClick={() => setGroupBy('brandTier')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  groupBy === 'brandTier' ? 'bg-white text-blue-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Store Brand
              </button>
            </div>
          </div>

          {/* Add Item Button */}
          <button
            id="btn-add-item-dashboard"
            onClick={onAddItemClick}
            className="inline-flex items-center justify-center space-x-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Item</span>
          </button>

        </div>

        {/* Second Row: Granular Filters */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-stone-100 text-xs">
          
          {/* Department Filter */}
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-stone-200 text-xs font-medium text-stone-700 bg-stone-50"
          >
            <option value="all">All Cymbal Departments</option>
            {Object.keys(DEPARTMENT_METADATA).map((dept) => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>

          {/* Brand Tier Filter */}
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-stone-200 text-xs font-medium text-stone-700 bg-stone-50"
          >
            <option value="all">All Brands</option>
            <option value="cymbal_select">Cymbal Select (Save ~25%)</option>
            <option value="cymbal_organics">Cymbal Organics</option>
            <option value="brand_name">National Brands</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-stone-200 text-xs font-medium text-stone-700 bg-stone-50"
          >
            <option value="all">All Statuses</option>
            <option value="to_buy">To Buy</option>
            <option value="in_cart">In Cart</option>
            <option value="purchased">Purchased</option>
            <option value="already_have">Already Have</option>
          </select>

          {/* Priority Filter */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-stone-200 text-xs font-medium text-stone-700 bg-stone-50"
          >
            <option value="all">All Priorities</option>
            <option value="must_have">Must-Have</option>
            <option value="recommended">Recommended</option>
            <option value="optional">Optional</option>
          </select>

          {/* Reset Filters */}
          {(selectedDepartment !== 'all' || selectedBrand !== 'all' || selectedStatus !== 'all' || selectedPriority !== 'all' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedDepartment('all');
                setSelectedBrand('all');
                setSelectedStatus('all');
                setSelectedPriority('all');
                setSearchQuery('');
              }}
              className="text-stone-500 hover:text-stone-800 text-[11px] underline font-semibold ml-auto"
            >
              Clear filters
            </button>
          )}

          <div className="ml-auto text-stone-500 font-medium text-[11px]">
            Showing {filteredItems.length} of {items.length} items (${totalFilteredCost})
          </div>

        </div>

        {/* Live Budget Breakdown & Quick Recalculate Tools */}
        <div className="pt-3 border-t border-stone-100 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-stone-50/70 p-3 rounded-xl border border-stone-200/60">
          
          {/* Quick Metrics Chips */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-bold text-stone-700 flex items-center gap-1">
              <Calculator className="w-3.5 h-3.5 text-blue-600" />
              <span>Budget Alignment:</span>
            </span>
            <span className="px-2 py-0.5 rounded-md bg-white border border-stone-200 text-stone-900 font-mono font-bold">
              Total: {currency}{totalListCost}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-rose-50 border border-rose-200 text-rose-800 font-medium">
              Must-Haves: {currency}{mustHaveCost}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-800 font-medium">
              Recommended: {currency}{recommendedCost}
            </span>
            {optionalCost > 0 && (
              <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 font-medium">
                Optional: {currency}{optionalCost}
              </span>
            )}
            <span className={`px-2 py-0.5 rounded-md font-bold font-mono border ${
              isOverBudget
                ? 'bg-rose-100 border-rose-300 text-rose-900'
                : 'bg-emerald-100 border-emerald-300 text-emerald-900'
            }`}>
              {isOverBudget ? `Over Target: +${currency}${Math.abs(budgetDiff)}` : `Buffer: ${currency}${budgetDiff}`}
            </span>
          </div>

          {/* 1-Click Budget Recalculator Actions */}
          <div className="flex items-center space-x-2 shrink-0 self-end lg:self-auto">
            <button
              onClick={handleBulkCymbalSelect}
              className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-blue-50 border border-stone-200 text-blue-900 text-xs font-semibold flex items-center space-x-1 transition-all shadow-2xs active:scale-95"
              title="Convert all national brand items to Cymbal Select to save ~25%"
            >
              <BadgePercent className="w-3.5 h-3.5 text-emerald-600" />
              <span>Store Brand Swaps</span>
            </button>
            {isOverBudget && (
              <button
                onClick={handleAutoAlignBudget}
                className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center space-x-1 transition-all shadow-2xs active:scale-95"
                title="Automatically scale optional item quantities to match target budget"
              >
                <Sliders className="w-3.5 h-3.5 text-amber-300" />
                <span>Auto-Align to {currency}{profile.budget}</span>
              </button>
            )}
          </div>

        </div>

      </div>

      {/* Grouped Lists */}
      {Object.keys(groupedData).length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-stone-400">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-sm text-stone-800">No items match your filter criteria</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Try adjusting your search terms or resetting the department and status filters above.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedData).map(([groupKey, groupItems]) => {
            const isCollapsed = collapsedGroups[groupKey];
            const groupCost = groupItems.reduce((acc, it) => acc + (it.estimatedPrice || 0), 0);
            const groupPurchased = groupItems.filter((i) => i.status === 'purchased' || i.status === 'already_have').length;

            // Metadata resolution based on groupBy
            let groupLabel = groupKey;
            let groupAisle = '';
            let groupBadge = null;

            if (groupBy === 'department') {
              const deptMeta = DEPARTMENT_METADATA[groupKey as CymbalDepartment];
              if (deptMeta) {
                groupAisle = deptMeta.aisle;
              }
            } else if (groupBy === 'category') {
              const catMeta = CATEGORY_METADATA[groupKey];
              if (catMeta) groupLabel = catMeta.label;
            } else if (groupBy === 'brandTier') {
              const brandMeta = BRAND_TIERS[groupKey as BrandTier];
              if (brandMeta) {
                groupLabel = brandMeta.label;
                groupBadge = brandMeta.tag;
              }
            }

            return (
              <div 
                key={groupKey}
                className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs"
              >
                
                {/* Group Header */}
                <div 
                  onClick={() => toggleGroup(groupKey)}
                  className="px-5 py-3.5 bg-stone-50/80 hover:bg-stone-100/70 border-b border-stone-200 flex items-center justify-between cursor-pointer transition-colors select-none"
                >
                  <div className="flex items-center space-x-2.5">
                    {isCollapsed ? (
                      <ChevronRight className="w-4 h-4 text-stone-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-stone-400" />
                    )}
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-display font-bold text-sm text-stone-900">{groupLabel}</span>
                        {groupAisle && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                            {groupAisle}
                          </span>
                        )}
                        {groupBadge && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                            {groupBadge}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 text-xs">
                    <span className="text-stone-500 font-medium hidden sm:inline">
                      {groupPurchased}/{groupItems.length} checked
                    </span>
                    <span className="font-mono font-bold text-stone-900 bg-white px-2.5 py-1 rounded-lg border border-stone-200">
                      ${groupCost}
                    </span>
                  </div>
                </div>

                {/* Items in Group */}
                {!isCollapsed && (
                  <div className="divide-y divide-stone-100">
                    {groupItems.map((item) => {
                      const isDone = item.status === 'purchased' || item.status === 'already_have';
                      const isInCart = item.status === 'in_cart';

                      return (
                        <div 
                          key={item.id}
                          className={`p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-stone-50/60 transition-colors ${
                            isDone ? 'bg-stone-50/70 opacity-75' : ''
                          }`}
                        >
                          
                          {/* Left: Status Checkbox & Name */}
                          <div className="flex items-start space-x-3 flex-1 min-w-0">
                            
                            {/* Status Selector Button */}
                            <button
                              id={`item-status-${item.id}`}
                              onClick={() => {
                                const nextStatus: Record<ItemStatus, ItemStatus> = {
                                  to_buy: 'in_cart',
                                  in_cart: 'purchased',
                                  purchased: 'already_have',
                                  already_have: 'to_buy',
                                };
                                onUpdateItem(item.id, { status: nextStatus[item.status] });
                              }}
                              className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all mt-0.5 shrink-0 border ${
                                item.status === 'purchased'
                                  ? 'bg-emerald-600 border-emerald-600 text-white'
                                  : item.status === 'in_cart'
                                  ? 'bg-blue-600 border-blue-600 text-white'
                                  : item.status === 'already_have'
                                  ? 'bg-stone-400 border-stone-400 text-white'
                                  : 'bg-white border-stone-300 hover:border-stone-500 text-transparent'
                              }`}
                              title={`Current: ${item.status}. Click to cycle status.`}
                            >
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </button>

                            {/* Details */}
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-1.5 mb-1">
                                <span className={`font-semibold text-xs text-stone-900 ${isDone ? 'line-through text-stone-500' : ''}`}>
                                  {item.name}
                                </span>

                                {/* Brand Tier Badge */}
                                {item.brandTier === 'cymbal_select' && (
                                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-blue-100 text-blue-800 border border-blue-200">
                                    Cymbal Select
                                  </span>
                                )}
                                {item.brandTier === 'cymbal_organics' && (
                                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
                                    Cymbal Organics
                                  </span>
                                )}

                                {/* Dietary Tag */}
                                {item.dietaryTag && item.dietaryTag !== 'All' && (
                                  <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-md bg-stone-100 text-stone-600">
                                    {item.dietaryTag}
                                  </span>
                                )}

                                {/* Priority Badge */}
                                <span className={`text-[9px] uppercase font-bold px-1.5 py-0.2 rounded-md ${
                                  item.priority === 'must_have'
                                    ? 'bg-rose-100 text-rose-800'
                                    : item.priority === 'recommended'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-stone-100 text-stone-600'
                                }`}>
                                  {item.priority.replace('_', ' ')}
                                </span>
                              </div>

                              {/* Aisle & Notes */}
                              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-stone-500">
                                {item.aisleNumber && (
                                  <span className="font-semibold text-blue-700 flex items-center space-x-1">
                                    <MapPin className="w-3 h-3" />
                                    <span>{item.aisleNumber}</span>
                                  </span>
                                )}
                                {item.notes && <span>{item.notes}</span>}
                              </div>
                            </div>

                          </div>

                          {/* Right: Quantity Stepper, Price, Edit & Swap Actions */}
                          <div className="flex items-center space-x-2.5 shrink-0 self-end sm:self-center">
                            
                            {/* Quantity Stepper with proportional auto-recalculation */}
                            <div className="flex items-center space-x-1 bg-stone-100 rounded-lg p-1 border border-stone-200 text-xs">
                              <button
                                onClick={() => handleStepQuantity(item, -1)}
                                className="w-5 h-5 rounded flex items-center justify-center hover:bg-white text-stone-600 font-bold active:scale-90 transition-transform"
                                title="Decrease quantity (recalculates item & total budget)"
                              >
                                -
                              </button>
                              <span className="px-1.5 font-bold text-stone-900 font-mono text-xs min-w-[20px] text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => handleStepQuantity(item, 1)}
                                className="w-5 h-5 rounded flex items-center justify-center hover:bg-white text-stone-600 font-bold active:scale-90 transition-transform"
                                title="Increase quantity (recalculates item & total budget)"
                              >
                                +
                              </button>
                              <span className="text-[10px] text-stone-500 pr-1">{item.unit}</span>
                            </div>

                            {/* Estimated Price (Click to Edit) */}
                            <div 
                              onClick={() => setEditingItem(item)}
                              role="button"
                              className="text-right min-w-[60px] cursor-pointer hover:bg-blue-50/60 p-1 rounded-md transition-colors"
                              title="Click to edit price & item details"
                            >
                              <div className="font-bold text-xs font-mono text-stone-900">
                                {currency}{item.estimatedPrice}
                              </div>
                              {item.originalPrice && item.originalPrice > item.estimatedPrice && (
                                <div className="text-[9px] text-stone-400 line-through">
                                  ${item.originalPrice}
                                </div>
                              )}
                            </div>

                            {/* Edit Item Details Button */}
                            <button
                              id={`btn-edit-item-${item.id}`}
                              onClick={() => setEditingItem(item)}
                              className="p-1.5 rounded-lg bg-stone-100 hover:bg-blue-100 text-stone-700 hover:text-blue-900 text-xs font-semibold flex items-center space-x-1 transition-colors"
                              title="Edit item name, price, quantity, brand tier, or aisle"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-stone-600" />
                              <span className="hidden md:inline">Edit</span>
                            </button>

                            {/* AI Substitution / Brand Swap Button */}
                            <button
                              id={`btn-swap-item-${item.id}`}
                              onClick={() => onOpenSubstituteModal(item)}
                              className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold flex items-center space-x-1 transition-colors"
                              title="Find store-brand swap or dietary alternative with AI"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                              <span className="hidden md:inline">Swap</span>
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => onDeleteItem(item.id)}
                              className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Remove item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>

                          </div>

                        </div>
                      );
                    })}
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

      {/* Edit Item Modal */}
      <EditItemModal
        isOpen={!!editingItem}
        item={editingItem}
        onClose={() => setEditingItem(null)}
        onSave={(id, updates) => {
          onUpdateItem(id, updates);
          setEditingItem(null);
        }}
        currency={currency}
      />

    </div>
  );
};
