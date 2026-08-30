import React, { useState, useEffect } from 'react';
import { X, Edit3, DollarSign, Store, Tag, MapPin, Sparkles, Check } from 'lucide-react';
import { ShoppingItem, ItemCategory, ItemPriority, CymbalDepartment, BrandTier, ItemStatus } from '../types';
import { DEPARTMENT_METADATA } from '../data/presets';

interface EditItemModalProps {
  isOpen: boolean;
  item: ShoppingItem | null;
  onClose: () => void;
  onSave: (itemId: string, updates: Partial<ShoppingItem>) => void;
  currency?: string;
}

export const EditItemModal: React.FC<EditItemModalProps> = ({
  isOpen,
  item,
  onClose,
  onSave,
  currency = '$',
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ItemCategory>('food_mains');
  const [department, setDepartment] = useState<CymbalDepartment>('Produce & Fresh Market');
  const [brandTier, setBrandTier] = useState<BrandTier>('cymbal_select');
  const [aisleNumber, setAisleNumber] = useState('Aisle 1-3');
  const [quantity, setQuantity] = useState<number>(1);
  const [unit, setUnit] = useState('packs');
  const [estimatedPrice, setEstimatedPrice] = useState<number>(10);
  const [unitPrice, setUnitPrice] = useState<number>(10);
  const [priority, setPriority] = useState<ItemPriority>('must_have');
  const [status, setStatus] = useState<ItemStatus>('to_buy');
  const [notes, setNotes] = useState('');
  const [dietaryTag, setDietaryTag] = useState('');

  useEffect(() => {
    if (item) {
      setName(item.name || '');
      setCategory(item.category || 'food_mains');
      setDepartment(item.department || 'Produce & Fresh Market');
      setBrandTier(item.brandTier || 'brand_name');
      setAisleNumber(item.aisleNumber || 'Aisle 1-3');
      const qty = item.quantity || 1;
      const price = item.estimatedPrice || 0;
      setQuantity(qty);
      setUnit(item.unit || 'items');
      setEstimatedPrice(price);
      setUnitPrice(qty > 0 ? +(price / qty).toFixed(2) : price);
      setPriority(item.priority || 'must_have');
      setStatus(item.status || 'to_buy');
      setNotes(item.notes || '');
      setDietaryTag(item.dietaryTag || '');
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const handleDepartmentChange = (dept: CymbalDepartment) => {
    setDepartment(dept);
    const meta = DEPARTMENT_METADATA[dept];
    if (meta) {
      setAisleNumber(meta.aisle.split('•')[0].trim());
    }
  };

  const handleQuantityChange = (newQty: number) => {
    const validQty = Math.max(1, newQty);
    setQuantity(validQty);
    // Auto recalculate total price based on unit price
    const recalculatedTotal = +(unitPrice * validQty).toFixed(2);
    setEstimatedPrice(recalculatedTotal);
  };

  const handleUnitPriceChange = (newUnitPrice: number) => {
    const validUnitPrice = Math.max(0, newUnitPrice);
    setUnitPrice(validUnitPrice);
    setEstimatedPrice(+(validUnitPrice * quantity).toFixed(2));
  };

  const handleTotalPriceChange = (newTotal: number) => {
    const validTotal = Math.max(0, newTotal);
    setEstimatedPrice(validTotal);
    if (quantity > 0) {
      setUnitPrice(+(validTotal / quantity).toFixed(2));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Recalculate originalPrice & savings if Cymbal Select
    let originalPrice = item.originalPrice;
    let savings = item.savings;
    if (brandTier === 'cymbal_select') {
      originalPrice = Math.round(estimatedPrice * 1.33);
      savings = Math.round(estimatedPrice * 0.33);
    } else if (brandTier === 'brand_name') {
      originalPrice = undefined;
      savings = undefined;
    }

    onSave(item.id, {
      name: name.trim(),
      category,
      department,
      brandTier,
      aisleNumber,
      quantity: Math.max(1, quantity),
      unit: unit.trim() || 'items',
      estimatedPrice: Math.max(0, estimatedPrice),
      originalPrice,
      savings,
      priority,
      status,
      notes: notes.trim(),
      dietaryTag: dietaryTag.trim(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 no-print animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-stone-200 overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 bg-blue-950 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-300">
              <Edit3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-white">
                Edit Shopping List Item
              </h3>
              <p className="text-[11px] text-blue-200">
                Update item details & auto-recalculate budget
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-blue-200 hover:text-white rounded-lg hover:bg-blue-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
              Item Name *
            </label>
            <input
              id="input-edit-item-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Cymbal Select Sweet Brioche Buns"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 text-xs text-stone-900 font-medium placeholder:text-stone-400 transition-all"
            />
          </div>

          {/* Department & Brand Tier */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                CymbalMart Department
              </label>
              <select
                value={department}
                onChange={(e) => handleDepartmentChange(e.target.value as CymbalDepartment)}
                className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-xs font-semibold text-stone-900 bg-white"
              >
                {Object.keys(DEPARTMENT_METADATA).map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                Brand Tier
              </label>
              <select
                value={brandTier}
                onChange={(e) => setBrandTier(e.target.value as BrandTier)}
                className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-xs font-semibold text-stone-900 bg-white"
              >
                <option value="cymbal_select">Cymbal Select (Save ~25%)</option>
                <option value="cymbal_organics">Cymbal Organics (Certified)</option>
                <option value="brand_name">National Brand</option>
              </select>
            </div>
          </div>

          {/* Aisle & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                Store Aisle / Location
              </label>
              <input
                type="text"
                value={aisleNumber}
                onChange={(e) => setAisleNumber(e.target.value)}
                placeholder="e.g. Aisle 5, Meat Counter"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                Priority Tier
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as ItemPriority)}
                className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-xs font-semibold text-stone-900 bg-white"
              >
                <option value="must_have">Must-Have (Essential)</option>
                <option value="recommended">Recommended</option>
                <option value="optional">Optional / Nice-to-Have</option>
              </select>
            </div>
          </div>

          {/* Dynamic Budget Calculation Box: Quantity, Unit Price & Total */}
          <div className="p-4 rounded-xl bg-blue-50/80 border border-blue-200/90 space-y-3">
            <div className="text-xs font-bold text-blue-950 flex items-center justify-between">
              <span>Automatic Budget Recalculation</span>
              <span className="text-[10px] font-semibold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-md">
                Auto-Synced
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  Quantity
                </label>
                <div className="flex items-center space-x-1">
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 text-xs font-bold text-stone-900 bg-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  Unit Type
                </label>
                <input
                  type="text"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="packs, lbs, bags"
                  className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 text-xs font-medium text-stone-900 bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  Unit Price ({currency})
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.25"
                  value={unitPrice}
                  onChange={(e) => handleUnitPriceChange(parseFloat(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 text-xs font-bold text-stone-900 bg-white font-mono"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-blue-200/80 flex items-center justify-between text-xs">
              <span className="text-stone-600 font-medium">
                Item Total ({quantity} × {currency}{unitPrice}):
              </span>
              <div className="flex items-center space-x-2">
                <span className="text-stone-500 font-mono text-[11px]">Total:</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={estimatedPrice}
                  onChange={(e) => handleTotalPriceChange(parseFloat(e.target.value) || 0)}
                  className="w-20 px-2 py-1 rounded-lg border border-blue-300 bg-white text-xs font-mono font-bold text-blue-950 text-right"
                />
              </div>
            </div>
          </div>

          {/* Status & Dietary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                Item Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ItemStatus)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-medium text-stone-900 bg-white"
              >
                <option value="to_buy">To Buy</option>
                <option value="in_cart">In Cart</option>
                <option value="purchased">Purchased</option>
                <option value="already_have">Already Have (At Home)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                Dietary / Allergen Tag
              </label>
              <input
                type="text"
                value={dietaryTag}
                onChange={(e) => setDietaryTag(e.target.value)}
                placeholder="e.g. Vegetarian, Gluten-Free, Nut-Free"
                className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs text-stone-900 font-medium"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
              Host Notes & Prep Instructions
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Chill before serving, ask butcher to slice thin"
              className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs text-stone-900 font-medium"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-stone-200 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-stone-300 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all active:scale-95 flex items-center space-x-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Update & Recalculate</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
