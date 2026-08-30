import React, { useState } from 'react';
import { X, PlusCircle, DollarSign, Store, Tag, MapPin } from 'lucide-react';
import { ShoppingItem, ItemCategory, StoreType, ItemPriority, CymbalDepartment, BrandTier } from '../types';
import { CATEGORY_METADATA, DEPARTMENT_METADATA } from '../data/presets';

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddItem: (item: ShoppingItem) => void;
  currency?: string;
}

export const AddItemModal: React.FC<AddItemModalProps> = ({
  isOpen,
  onClose,
  onAddItem,
  currency = '$',
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ItemCategory>('food_mains');
  const [department, setDepartment] = useState<CymbalDepartment>('Produce & Fresh Market');
  const [brandTier, setBrandTier] = useState<BrandTier>('cymbal_select');
  const [aisleNumber, setAisleNumber] = useState('Aisle 1-3');
  const [quantity, setQuantity] = useState<number>(1);
  const [unit, setUnit] = useState('packs');
  const [estimatedPrice, setEstimatedPrice] = useState<number>(12);
  const [priority, setPriority] = useState<ItemPriority>('must_have');
  const [notes, setNotes] = useState('');
  const [dietaryTag, setDietaryTag] = useState('');

  if (!isOpen) return null;

  const handleDepartmentChange = (dept: CymbalDepartment) => {
    setDepartment(dept);
    const meta = DEPARTMENT_METADATA[dept];
    if (meta) {
      setAisleNumber(meta.aisle.split('•')[0].trim());
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newItem: ShoppingItem = {
      id: 'custom-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      name: name.trim(),
      category,
      department,
      brandTier,
      aisleNumber,
      quantity: Math.max(1, quantity),
      unit: unit.trim() || 'items',
      estimatedPrice: Math.max(0, estimatedPrice),
      targetStore: 'CymbalMart Supercenter',
      priority,
      status: 'to_buy',
      notes: notes.trim(),
      dietaryTag: dietaryTag.trim(),
      isCustom: true,
    };

    onAddItem(newItem);
    onClose();
    // Reset
    setName('');
    setNotes('');
    setDietaryTag('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 no-print">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-stone-200 overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 bg-blue-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <PlusCircle className="w-5 h-5 text-amber-300" />
            <h3 className="font-display text-base font-bold text-white">
              Add Custom CymbalMart Item
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-blue-200 hover:text-white rounded-lg hover:bg-blue-800 transition-colors"
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
              id="input-new-item-name"
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Cymbal Select Sweet Brioche Buns, Sparklers, Gluten-Free Tortillas"
              className="w-full px-3.5 py-2 rounded-xl border border-stone-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-xs text-stone-900 font-medium placeholder:text-stone-400 transition-all"
            />
          </div>

          {/* Department & Aisle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                CymbalMart Department
              </label>
              <select
                value={department}
                onChange={(e) => handleDepartmentChange(e.target.value as CymbalDepartment)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-semibold text-stone-900 bg-white"
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
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-semibold text-stone-900 bg-white"
              >
                <option value="cymbal_select">Cymbal Select (Save ~25%)</option>
                <option value="cymbal_organics">Cymbal Organics (Organic)</option>
                <option value="brand_name">National Brand</option>
              </select>
            </div>
          </div>

          {/* Quantity, Unit & Price */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                Quantity
              </label>
              <input
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-bold text-stone-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                Unit
              </label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="packs, lbs, bags"
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-medium text-stone-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                Price ({currency})
              </label>
              <input
                type="number"
                min="0"
                step="0.5"
                required
                value={estimatedPrice}
                onChange={(e) => setEstimatedPrice(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-bold text-stone-900 font-mono"
              />
            </div>
          </div>

          {/* Priority & Dietary */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as ItemPriority)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-semibold text-stone-900 bg-white"
              >
                <option value="must_have">Must-Have (Essential)</option>
                <option value="recommended">Recommended</option>
                <option value="optional">Optional / Nice-to-Have</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                Dietary Tag
              </label>
              <input
                type="text"
                value={dietaryTag}
                onChange={(e) => setDietaryTag(e.target.value)}
                placeholder="e.g. Vegetarian, Gluten-Free"
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs text-stone-900"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
              Host Notes / Portion Tip
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Pick up cold morning-of, 2 per guest"
              className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs text-stone-900"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 flex items-center justify-end space-x-2 border-t border-stone-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-100 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="btn-submit-add-item"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs active:scale-95 transition-all"
            >
              Add to Shopping List
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
