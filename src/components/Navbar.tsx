import React from 'react';
import { 
  Sparkles, 
  ShoppingBag, 
  Bot, 
  Calculator, 
  Clock, 
  Share2, 
  PlusCircle, 
  Utensils, 
  CheckCircle2,
  Store,
  Sliders,
  Check,
  MapPin,
  Mic,
  MicOff
} from 'lucide-react';
import { PartyProfile } from '../types';

interface NavbarProps {
  profile: PartyProfile | null;
  activeTab: 'list' | 'stores' | 'timeline' | 'portions';
  setActiveTab: (tab: 'list' | 'stores' | 'timeline' | 'portions') => void;
  onOpenSetup: () => void;
  onOpenChat: () => void;
  onOpenExport: () => void;
  onOpenAddItem: () => void;
  onOpenRefineCheckout: () => void;
  isChatOpen: boolean;
  totalCost: number;
  purchasedCount: number;
  totalItemCount: number;
  isVoiceListening?: boolean;
  onToggleVoice?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  profile,
  activeTab,
  setActiveTab,
  onOpenSetup,
  onOpenChat,
  onOpenExport,
  onOpenAddItem,
  onOpenRefineCheckout,
  isChatOpen,
  totalCost,
  purchasedCount,
  totalItemCount,
  isVoiceListening = false,
  onToggleVoice,
}) => {
  const budget = profile?.budget || 0;
  const currency = profile?.currency || '$';
  const isOverBudget = totalCost > budget && budget > 0;
  const progressPercent = totalItemCount > 0 ? Math.round((purchasedCount / totalItemCount) * 100) : 0;

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-xs no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Header Bar */}
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & CymbalMart Branding */}
          <div className="flex items-center space-x-3">
            <button 
              id="btn-header-logo"
              onClick={onOpenSetup}
              className="flex items-center space-x-2.5 text-left group transition-all"
              title="Click to edit party setup (Step 1)"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-700 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform font-black">
                <Store className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-display font-black text-lg text-blue-950 leading-tight tracking-tight">
                    CymbalMart
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-200">
                    Party Agent
                  </span>
                </div>
                <p className="text-xs text-stone-500 truncate max-w-[180px] sm:max-w-xs font-medium">
                  {profile ? `${profile.title} (${profile.guestCount.total} guests)` : 'New Party Plan'}
                </p>
              </div>
            </button>
          </div>

          {/* Center: CUJ 3-Step Guided Bar (Desktop) */}
          <div className="hidden lg:flex items-center space-x-1.5 bg-stone-100/90 p-1 rounded-xl border border-stone-200/80 text-xs">
            
            {/* Step 1: Define */}
            <button
              id="step-define-event"
              onClick={onOpenSetup}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-stone-700 hover:bg-white/80 hover:text-stone-900 transition-all font-semibold"
            >
              <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">1</span>
              <span>Define Event</span>
            </button>

            <span className="text-stone-300">→</span>

            {/* Step 2: Review List */}
            <button
              id="step-review-list"
              onClick={() => setActiveTab('list')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all font-bold ${
                activeTab === 'list' 
                  ? 'bg-white text-blue-900 shadow-xs border border-stone-200/50' 
                  : 'text-stone-700 hover:bg-white/80'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">2</span>
              <span>Review & Align List</span>
            </button>

            <span className="text-stone-300">→</span>

            {/* Step 3: Refine & Checkout */}
            <button
              id="step-refine-checkout"
              onClick={onOpenRefineCheckout}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-400/90 hover:bg-amber-400 text-blue-950 transition-all font-bold shadow-xs"
            >
              <span className="w-4 h-4 rounded-full bg-blue-950 text-amber-300 flex items-center justify-center text-[10px] font-bold">3</span>
              <span>Refine & Checkout</span>
            </button>

          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* 1-Click Refine & Checkout CTA Button */}
            <button
              id="btn-nav-checkout-direct"
              onClick={onOpenRefineCheckout}
              className="hidden sm:inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all active:scale-95"
            >
              <ShoppingBag className="w-4 h-4 text-amber-300" />
              <span>Checkout (${totalCost})</span>
            </button>

            {/* Voice Control Hands-Free Trigger */}
            {onToggleVoice && (
              <button
                id="btn-nav-voice-control"
                onClick={onToggleVoice}
                className={`relative inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  isVoiceListening
                    ? 'bg-rose-600 text-white border-rose-700 shadow-md ring-2 ring-rose-300 animate-pulse'
                    : 'bg-rose-50 border-rose-200 text-rose-900 hover:bg-rose-100'
                }`}
                title={isVoiceListening ? 'Voice Control Active - Click to stop' : 'Start Hands-Free Voice Control'}
              >
                {isVoiceListening ? (
                  <Mic className="w-4 h-4 text-white" />
                ) : (
                  <Mic className="w-4 h-4 text-rose-600" />
                )}
                <span className="hidden sm:inline">
                  {isVoiceListening ? 'Voice Active' : 'Voice Control'}
                </span>
                {isVoiceListening && (
                  <span className="w-2 h-2 rounded-full bg-white absolute -top-0.5 -right-0.5 animate-ping" />
                )}
              </button>
            )}

            {/* CymbalMart Assistant Chatbot Trigger */}
            <button
              id="btn-nav-ai-chat"
              onClick={onOpenChat}
              className={`relative inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                isChatOpen
                  ? 'bg-blue-600 text-white border-blue-700 shadow-sm'
                  : 'bg-amber-50 border-amber-300 text-amber-950 hover:bg-amber-100'
              }`}
              title="Chat with CymbalMart Assistant"
            >
              <Bot className="w-4 h-4 text-blue-700" />
              <span className="hidden sm:inline">CymbalMart Assistant</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 absolute -top-0.5 -right-0.5 animate-pulse" />
            </button>

            {/* Export & Share */}
            <button
              id="btn-nav-export"
              onClick={onOpenExport}
              className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition-colors"
              title="Export, Print & Share Shopping List"
            >
              <Share2 className="w-4 h-4" />
            </button>

            {/* Event Settings Trigger */}
            <button
              id="btn-nav-party-settings"
              onClick={onOpenSetup}
              className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition-colors"
              title="Edit Event Specifications"
            >
              <Utensils className="w-4 h-4" />
            </button>

          </div>

        </div>

        {/* Sub-Navigation Tabs: List, Aisle Route, Portions, Timeline */}
        <div className="flex items-center space-x-2 py-2 border-t border-stone-100 overflow-x-auto text-xs">
          
          <button
            id="tab-shopping-list"
            onClick={() => setActiveTab('list')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap ${
              activeTab === 'list'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Shopping List ({totalItemCount})</span>
          </button>

          <button
            id="tab-store-runs"
            onClick={() => setActiveTab('stores')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap ${
              activeTab === 'stores'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-blue-400" />
            <span>In-Store Aisle Route</span>
            {progressPercent > 0 && (
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full font-bold ml-0.5">
                {progressPercent}%
              </span>
            )}
          </button>

          <button
            id="tab-portion-calc"
            onClick={() => setActiveTab('portions')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap ${
              activeTab === 'portions'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Portion Calculator</span>
          </button>

          <button
            id="tab-timeline-recipes"
            onClick={() => setActiveTab('timeline')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap ${
              activeTab === 'timeline'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Prep Timeline & Recipes</span>
          </button>

        </div>

      </div>
    </header>
  );
};
