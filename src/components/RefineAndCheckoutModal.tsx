import React, { useState } from 'react';
import { 
  X, 
  Check, 
  ShoppingBag, 
  Truck, 
  MapPin, 
  Clock, 
  DollarSign, 
  Sparkles, 
  TrendingDown, 
  ArrowRight, 
  QrCode, 
  Printer, 
  Share2, 
  CreditCard, 
  ShieldCheck, 
  Store,
  BadgePercent,
  Sliders,
  CheckCircle2
} from 'lucide-react';
import { PartyProfile, ShoppingItem, FulfillmentType, OrderCheckoutDetails } from '../types';

interface RefineAndCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: PartyProfile;
  items: ShoppingItem[];
  onUpdateItems: (newItems: ShoppingItem[]) => void;
  onOpenSubstituteModal: (item: ShoppingItem) => void;
}

export const RefineAndCheckoutModal: React.FC<RefineAndCheckoutModalProps> = ({
  isOpen,
  onClose,
  profile,
  items,
  onUpdateItems,
  onOpenSubstituteModal,
}) => {
  const [activeStep, setActiveStep] = useState<'refine' | 'fulfillment' | 'confirmed'>('refine');
  const [fulfillmentType, setFulfillmentType] = useState<FulfillmentType>('curbside_pickup');
  const [storeLocation, setStoreLocation] = useState('CymbalMart Supercenter #1042 - Metro Central');
  const [timeSlot, setTimeSlot] = useState('Today • 3:00 PM - 4:00 PM (1 hour prep)');
  const [hostPhone, setHostPhone] = useState('(555) 382-9014');
  const [instructions, setInstructions] = useState('Loading into trunk. Please ensure ice bags are loaded last to prevent melting.');
  const [confirmedOrder, setConfirmedOrder] = useState<OrderCheckoutDetails | null>(null);

  if (!isOpen) return null;

  const totalCost = items.reduce((acc, it) => acc + (it.estimatedPrice || 0), 0);
  const budget = profile.budget || 300;
  const variance = budget - totalCost;
  const isOverBudget = variance < 0;

  // Calculate Cymbal Select savings
  const totalSavings = items.reduce((acc, it) => {
    if (it.savings) return acc + it.savings;
    if (it.brandTier === 'cymbal_select') return acc + Math.round(it.estimatedPrice * 0.33);
    return acc;
  }, 0);

  // 1-Click Refine Actions
  const handleAutoBalanceToBudget = () => {
    if (totalCost <= budget) return;
    const ratio = budget / totalCost;
    
    const refined = items.map((it) => {
      if (it.priority === 'optional') {
        // Drop price or mark already have / reduce quantity
        const newQty = Math.max(1, Math.round(it.quantity * 0.7));
        return {
          ...it,
          quantity: newQty,
          estimatedPrice: Math.max(1, Math.round(it.estimatedPrice * 0.6)),
          notes: `${it.notes || ''} (Auto-budget scaled)`.trim(),
        };
      }
      if (it.priority === 'recommended' && it.estimatedPrice > 15) {
        return {
          ...it,
          brandTier: 'cymbal_select' as const,
          estimatedPrice: Math.max(1, Math.round(it.estimatedPrice * ratio)),
          notes: `${it.notes || ''} (Adjusted to Cymbal Select value brand)`.trim(),
        };
      }
      return it;
    });

    onUpdateItems(refined);
  };

  const handleSwitchAllToCymbalSelect = () => {
    const refined = items.map((it) => {
      if (it.brandTier !== 'cymbal_select') {
        const discountedPrice = Math.max(1, Math.round(it.estimatedPrice * 0.75));
        const originalPrice = it.originalPrice || it.estimatedPrice;
        return {
          ...it,
          brandTier: 'cymbal_select' as const,
          originalPrice,
          estimatedPrice: discountedPrice,
          savings: originalPrice - discountedPrice,
          name: it.name.startsWith('Cymbal') ? it.name : `Cymbal Select ${it.name}`,
        };
      }
      return it;
    });
    onUpdateItems(refined);
  };

  const handleAddDietarySafetyBuffer = () => {
    const hasVegan = items.some((i) => i.dietaryTag === 'Vegan' || i.dietaryTag === 'Vegetarian');
    const newAdditions: ShoppingItem[] = [];

    if (!hasVegan) {
      newAdditions.push({
        id: `diet-add-${Date.now()}-1`,
        name: 'Cymbal Organics Plant-Based Veggie Burger Patties (4-pack)',
        category: 'food_mains',
        department: 'Produce & Fresh Market',
        aisleNumber: 'Aisle 1',
        brandTier: 'cymbal_organics',
        quantity: 1,
        unit: 'packs',
        estimatedPrice: 9,
        originalPrice: 12,
        savings: 3,
        targetStore: 'CymbalMart Supercenter',
        priority: 'recommended',
        status: 'to_buy',
        notes: 'Dietary alternative for vegetarian guests',
        dietaryTag: 'Vegetarian',
      });
    }

    onUpdateItems([...newAdditions, ...items]);
  };

  const handlePlaceOrder = () => {
    const orderDetails: OrderCheckoutDetails = {
      orderId: `CYM-${Math.floor(100000 + Math.random() * 900000)}`,
      fulfillmentType,
      slotTime: timeSlot,
      storeLocation,
      specialInstructions: instructions,
      subtotal: totalCost,
      cymbalSavings: totalSavings,
      finalTotal: totalCost,
      itemCount: items.length,
      status: 'confirmed',
      placedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setConfirmedOrder(orderDetails);
    setActiveStep('confirmed');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 no-print">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-blue-900 text-white flex items-center justify-between border-b border-blue-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-blue-950 flex items-center justify-center font-bold shadow-sm">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-amber-300">
                  Step 3: Refine & Checkout
                </span>
                <span className="text-blue-300">•</span>
                <span className="text-xs text-blue-200">CymbalMart Order Concierge</span>
              </div>
              <h2 className="font-display text-lg font-bold text-white">
                {activeStep === 'refine' && 'Refine Constraints & Budget'}
                {activeStep === 'fulfillment' && 'Select Fulfillment & Review Cart'}
                {activeStep === 'confirmed' && 'Order Confirmed & Plan Finalized!'}
              </h2>
            </div>
          </div>

          <button
            id="btn-close-checkout-modal"
            onClick={onClose}
            className="p-2 text-blue-200 hover:text-white rounded-lg hover:bg-blue-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Stepper Navigation */}
        <div className="bg-blue-950/40 border-b border-stone-200 px-6 py-2.5 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setActiveStep('refine')}
              className={`flex items-center space-x-1.5 font-bold transition-colors ${
                activeStep === 'refine' ? 'text-blue-600' : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px]">1</span>
              <span>Refine Constraints</span>
            </button>
            <span className="text-stone-300">→</span>
            <button
              onClick={() => setActiveStep('fulfillment')}
              className={`flex items-center space-x-1.5 font-bold transition-colors ${
                activeStep === 'fulfillment' ? 'text-blue-600' : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px]">2</span>
              <span>Fulfillment & Pay</span>
            </button>
            <span className="text-stone-300">→</span>
            <span className={`flex items-center space-x-1.5 font-bold ${
              activeStep === 'confirmed' ? 'text-emerald-600' : 'text-stone-400'
            }`}>
              <span className="w-5 h-5 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center text-[10px]">3</span>
              <span>Finalized Pass</span>
            </span>
          </div>

          <div className="hidden sm:flex items-center space-x-2 text-xs font-bold">
            <span className="text-stone-500">Cart:</span>
            <span className="font-mono text-stone-900">${totalCost}</span>
            <span className="text-stone-400">/ ${budget}</span>
          </div>
        </div>

        {/* Modal Content by Step */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* STEP 1: REFINE & BUDGET CONSTRAINTS */}
          {activeStep === 'refine' && (
            <div className="space-y-6">
              
              {/* Budget Health Card */}
              <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                isOverBudget 
                  ? 'bg-rose-50 border-rose-200 text-rose-900' 
                  : 'bg-emerald-50 border-emerald-200 text-emerald-900'
              }`}>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm">
                      {isOverBudget ? 'List is currently over target budget' : 'List is aligned within budget!'}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-white/80 border border-current">
                      {isOverBudget ? `+$${Math.abs(variance)} over` : `-$${variance} under target`}
                    </span>
                  </div>
                  <p className="text-xs mt-1 text-stone-600">
                    Target budget: <strong>${budget}</strong> • Current list ({items.length} items): <strong>${totalCost}</strong>
                  </p>
                </div>

                {totalSavings > 0 && (
                  <div className="bg-amber-100 text-amber-900 px-3 py-1.5 rounded-xl border border-amber-200 text-xs font-bold flex items-center space-x-1.5 shrink-0">
                    <BadgePercent className="w-4 h-4 text-amber-700" />
                    <span>Saving ${totalSavings} with Cymbal Select</span>
                  </div>
                )}
              </div>

              {/* Refinement One-Click Actions */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 mb-3 flex items-center space-x-1.5">
                  <Sliders className="w-3.5 h-3.5 text-blue-600" />
                  <span>1-Click Smart Refinement Actions</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  
                  {/* Action 1: Auto-Balance */}
                  <button
                    onClick={handleAutoBalanceToBudget}
                    disabled={!isOverBudget}
                    className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                      isOverBudget
                        ? 'bg-blue-50/70 hover:bg-blue-100/80 border-blue-300 text-blue-950 shadow-xs'
                        : 'bg-stone-50 border-stone-200 opacity-60 cursor-not-allowed text-stone-600'
                    }`}
                  >
                    <div>
                      <div className="flex items-center space-x-1.5 text-blue-700 font-bold text-xs mb-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Auto-Balance to ${budget}</span>
                      </div>
                      <p className="text-[11px] text-stone-600">
                        Automatically adjust optional quantities & store brands to match target budget.
                      </p>
                    </div>
                    <span className="text-[10px] font-bold text-blue-700 mt-2 inline-flex items-center">
                      Apply Smart Trim →
                    </span>
                  </button>

                  {/* Action 2: Switch all to Cymbal Select */}
                  <button
                    onClick={handleSwitchAllToCymbalSelect}
                    className="p-3.5 rounded-xl border border-amber-300 bg-amber-50/70 hover:bg-amber-100/80 text-amber-950 text-left flex flex-col justify-between transition-all shadow-xs"
                  >
                    <div>
                      <div className="flex items-center space-x-1.5 text-amber-800 font-bold text-xs mb-1">
                        <BadgePercent className="w-3.5 h-3.5" />
                        <span>Switch to Cymbal Select</span>
                      </div>
                      <p className="text-[11px] text-stone-600">
                        Swap national brand items to CymbalMart store brands to shave ~25% off.
                      </p>
                    </div>
                    <span className="text-[10px] font-bold text-amber-800 mt-2 inline-flex items-center">
                      Save Extra ~25% →
                    </span>
                  </button>

                  {/* Action 3: Dietary Buffer */}
                  <button
                    onClick={handleAddDietarySafetyBuffer}
                    className="p-3.5 rounded-xl border border-emerald-300 bg-emerald-50/70 hover:bg-emerald-100/80 text-emerald-950 text-left flex flex-col justify-between transition-all shadow-xs"
                  >
                    <div>
                      <div className="flex items-center space-x-1.5 text-emerald-800 font-bold text-xs mb-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Dietary Safety Kit</span>
                      </div>
                      <p className="text-[11px] text-stone-600">
                        Add guaranteed allergen-safe and plant-based protein options.
                      </p>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-800 mt-2 inline-flex items-center">
                      Add Safe Buffer →
                    </span>
                  </button>

                </div>
              </div>

              {/* Items List Preview with Quick Swap */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700">
                    Review Key Cost Drivers ({items.length} Items)
                  </h3>
                  <span className="text-[11px] text-stone-500">Click swap on high cost items</span>
                </div>

                <div className="divide-y divide-stone-200 border border-stone-200 rounded-xl overflow-hidden max-h-60 overflow-y-auto bg-white">
                  {items.map((item) => (
                    <div key={item.id} className="p-3 flex items-center justify-between hover:bg-stone-50 transition-colors">
                      <div className="min-w-0 flex-1 pr-3">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-xs text-stone-900 truncate">{item.name}</span>
                          {item.brandTier === 'cymbal_select' && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-800">
                              Cymbal Select
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-stone-500 mt-0.5">
                          {item.quantity} {item.unit} • {item.department}
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 shrink-0">
                        <div className="text-right">
                          <span className="font-bold text-xs font-mono text-stone-900">${item.estimatedPrice}</span>
                          {item.originalPrice && item.originalPrice > item.estimatedPrice && (
                            <div className="text-[9px] text-stone-400 line-through">${item.originalPrice}</div>
                          )}
                        </div>
                        <button
                          onClick={() => onOpenSubstituteModal(item)}
                          className="px-2 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-[11px] font-semibold transition-colors"
                        >
                          Swap AI
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* STEP 2: FULFILLMENT & CHECKOUT */}
          {activeStep === 'fulfillment' && (
            <div className="space-y-6">
              
              {/* Choose Fulfillment Option */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2.5">
                  Select CymbalMart Fulfillment Method
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  
                  {/* Curbside */}
                  <div
                    onClick={() => setFulfillmentType('curbside_pickup')}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      fulfillmentType === 'curbside_pickup'
                        ? 'bg-blue-50 border-blue-600 ring-2 ring-blue-600/20 text-blue-950'
                        : 'bg-white border-stone-200 hover:bg-stone-50 text-stone-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <Store className="w-4 h-4 text-blue-600" />
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        Free Pickup
                      </span>
                    </div>
                    <div className="font-bold text-xs">Express Curbside</div>
                    <p className="text-[11px] text-stone-500 mt-1">
                      Staff loads groceries & ice directly into your trunk.
                    </p>
                  </div>

                  {/* Delivery */}
                  <div
                    onClick={() => setFulfillmentType('express_delivery')}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      fulfillmentType === 'express_delivery'
                        ? 'bg-blue-50 border-blue-600 ring-2 ring-blue-600/20 text-blue-950'
                        : 'bg-white border-stone-200 hover:bg-stone-50 text-stone-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <Truck className="w-4 h-4 text-blue-600" />
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                        Under 2 Hrs
                      </span>
                    </div>
                    <div className="font-bold text-xs">Doorstep Delivery</div>
                    <p className="text-[11px] text-stone-500 mt-1">
                      Straight to your party venue in temperature-controlled totes.
                    </p>
                  </div>

                  {/* In Store Route */}
                  <div
                    onClick={() => setFulfillmentType('instore_run')}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      fulfillmentType === 'instore_run'
                        ? 'bg-blue-50 border-blue-600 ring-2 ring-blue-600/20 text-blue-950'
                        : 'bg-white border-stone-200 hover:bg-stone-50 text-stone-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-stone-200 text-stone-800">
                        Smart Route
                      </span>
                    </div>
                    <div className="font-bold text-xs">In-Store Checklist</div>
                    <p className="text-[11px] text-stone-500 mt-1">
                      Guided aisle-by-aisle navigation on your mobile screen.
                    </p>
                  </div>

                </div>
              </div>

              {/* Store & Time Slot Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-stone-50 border border-stone-200">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                    CymbalMart Location
                  </label>
                  <select
                    value={storeLocation}
                    onChange={(e) => setStoreLocation(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-semibold text-stone-900 bg-white"
                  >
                    <option value="CymbalMart Supercenter #1042 - Metro Central">CymbalMart Supercenter #1042 - Metro Central</option>
                    <option value="Cymbal Wholesale Club #204 - West Bay">Cymbal Wholesale Club #204 - West Bay</option>
                    <option value="Cymbal Fresh Market #512 - Downtown">Cymbal Fresh Market #512 - Downtown</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Time Window
                  </label>
                  <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-semibold text-stone-900 bg-white"
                  >
                    <option value="Today • 3:00 PM - 4:00 PM (1 hour prep)">Today • 3:00 PM - 4:00 PM (1 hour prep)</option>
                    <option value="Today • 5:00 PM - 6:00 PM (Evening Kickoff)">Today • 5:00 PM - 6:00 PM (Evening Kickoff)</option>
                    <option value="Tomorrow • 10:00 AM - 11:00 AM (Morning Prep)">Tomorrow • 10:00 AM - 11:00 AM (Morning Prep)</option>
                    <option value="Party Day • 2 Hours Before Event">Party Day • 2 Hours Before Event</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Host Contact & Trunk Instructions
                  </label>
                  <input
                    type="text"
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder="e.g. Loading into white SUV trunk, please keep ice separate."
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs text-stone-900 bg-white font-medium"
                  />
                </div>
              </div>

              {/* Order Summary Breakdown */}
              <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 space-y-2.5">
                <div className="flex items-center justify-between text-xs text-stone-600">
                  <span>Items Subtotal ({items.length} items)</span>
                  <span className="font-semibold text-stone-900">${totalCost}.00</span>
                </div>
                {totalSavings > 0 && (
                  <div className="flex items-center justify-between text-xs text-emerald-700 font-bold">
                    <span>Cymbal Select Private Label Discount</span>
                    <span>-${totalSavings}.00</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-xs text-stone-600">
                  <span>Fulfillment Fee</span>
                  <span className="text-emerald-700 font-bold">FREE ($0.00)</span>
                </div>
                <div className="border-t border-blue-200 pt-2 flex items-center justify-between">
                  <div className="text-sm font-bold text-blue-950">Final Total at Pickup</div>
                  <div className="text-xl font-bold font-mono text-blue-900">${totalCost}.00</div>
                </div>
              </div>

            </div>
          )}

          {/* STEP 3: FINALIZED ORDER & PASS */}
          {activeStep === 'confirmed' && confirmedOrder && (
            <div className="space-y-6 text-center py-2">
              
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                <Check className="w-8 h-8" />
              </div>

              <div>
                <span className="text-xs uppercase font-bold tracking-widest text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  Order Successfully Transmitted
                </span>
                <h3 className="font-display text-2xl font-bold text-stone-900 mt-2">
                  Ready for Party Day!
                </h3>
                <p className="text-xs text-stone-600 max-w-md mx-auto mt-1">
                  Your curated CymbalMart shopping list has been scheduled for <strong>{confirmedOrder.slotTime}</strong> at <strong>{confirmedOrder.storeLocation}</strong>.
                </p>
              </div>

              {/* Digital Pass Card */}
              <div className="max-w-md mx-auto bg-stone-900 text-white rounded-2xl p-5 text-left shadow-lg border border-stone-800 space-y-4">
                <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                  <div>
                    <div className="text-[10px] uppercase font-bold tracking-wider text-amber-400">CymbalMart Express Pass</div>
                    <div className="font-mono font-bold text-sm text-white">{confirmedOrder.orderId}</div>
                  </div>
                  <div className="p-2 bg-white rounded-lg text-stone-900">
                    <QrCode className="w-8 h-8" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <div className="text-[10px] text-stone-400">Event</div>
                    <div className="font-bold text-stone-200 truncate">{profile.title}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-stone-400">Total Items</div>
                    <div className="font-bold text-stone-200">{confirmedOrder.itemCount} Items (${confirmedOrder.finalTotal})</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-stone-400">Pickup Slot</div>
                    <div className="font-bold text-stone-200 truncate">{confirmedOrder.slotTime}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-stone-400">Savings Unlocked</div>
                    <div className="font-bold text-emerald-400">${confirmedOrder.cymbalSavings}</div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs inline-flex items-center space-x-2 transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Loading Slip</span>
                </button>

                <button
                  onClick={onClose}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-colors"
                >
                  Done & Return to Dashboard
                </button>
              </div>

            </div>
          )}

        </div>

        {/* Footer Actions */}
        {activeStep !== 'confirmed' && (
          <div className="px-6 py-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
            {activeStep === 'refine' ? (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-100 font-semibold text-xs transition-colors"
                >
                  Back to List
                </button>
                <button
                  type="button"
                  id="btn-proceed-to-fulfillment"
                  onClick={() => setActiveStep('fulfillment')}
                  className="inline-flex items-center space-x-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all active:scale-95"
                >
                  <span>Proceed to Fulfillment</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setActiveStep('refine')}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-100 font-semibold text-xs transition-colors"
                >
                  ← Back to Refinement
                </button>
                <button
                  type="button"
                  id="btn-finalize-cymbalmart-order"
                  onClick={handlePlaceOrder}
                  className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all active:scale-95"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Finalize & Submit CymbalMart Order</span>
                </button>
              </>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
