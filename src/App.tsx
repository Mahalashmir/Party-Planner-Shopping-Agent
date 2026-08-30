/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Plus, 
  ShoppingBag, 
  Calculator, 
  Clock, 
  Share2, 
  Bot, 
  RotateCcw,
  CheckCircle2,
  Utensils,
  Store
} from 'lucide-react';
import { PartyProfile, PartyPlan, ShoppingItem, ChatMessage, ItemStatus } from './types';
import { PARTY_PRESETS } from './data/presets';
import { generatePortionRulesList } from './utils/partyCalculations';
import { Navbar } from './components/Navbar';
import { BudgetOverviewBar } from './components/BudgetOverviewBar';
import { ShoppingListDashboard } from './components/ShoppingListDashboard';
import { ShoppingModeView } from './components/ShoppingModeView';
import { PortionRulesDrawer } from './components/PortionRulesDrawer';
import { PartyTimelineView } from './components/PartyTimelineView';
import { PartySetupModal } from './components/PartySetupModal';
import { AddItemModal } from './components/AddItemModal';
import { ItemSubstituteModal } from './components/ItemSubstituteModal';
import { AgentChatDrawer } from './components/AgentChatDrawer';
import { ExportModal } from './components/ExportModal';
import { RefineAndCheckoutModal } from './components/RefineAndCheckoutModal';
import { VoiceAssistantHUD } from './components/VoiceAssistantHUD';
import { useVoiceAssistant } from './hooks/useVoiceAssistant';

// Initial default party profile for CymbalMart
const DEFAULT_PROFILE: PartyProfile = {
  id: 'party-init-1',
  title: 'Cinco de Mayo Taco & Marg Fiesta',
  eventType: 'dinner',
  theme: 'Vibrant Festive Mexican Cantina',
  guestCount: {
    adults: 18,
    kids: 4,
    total: 22,
  },
  dietary: ['Vegetarian', 'Gluten-Free'],
  durationHours: 4,
  budget: 350,
  currency: '$',
  venue: 'indoor_home',
  specialRequests: 'Include fresh guacamole bar, kid-safe mild options, and private-label Cymbal Select ingredients.',
  vibeDescription: 'Build-your-own street taco bar with Cymbal Select meats and fresh cilantro from Produce Aisle 1.',
};

export default function App() {
  const [profile, setProfile] = useState<PartyProfile>(() => {
    const saved = localStorage.getItem('cymbalmart_party_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved profile:', e);
      }
    }
    return DEFAULT_PROFILE;
  });

  const [items, setItems] = useState<ShoppingItem[]>(() => {
    const saved = localStorage.getItem('cymbalmart_party_items');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved items:', e);
      }
    }
    return [];
  });

  const [plan, setPlan] = useState<PartyPlan>(() => {
    const saved = localStorage.getItem('cymbalmart_party_plan');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved plan:', e);
      }
    }
    return {
      profile: DEFAULT_PROFILE,
      items: [],
      portionRules: generatePortionRulesList(DEFAULT_PROFILE),
      timeline: [],
      recipesAndDrinks: [],
      budgetTips: [],
      agentAdvice: 'Start your shopping in Produce (Aisle 1-3) and hit the Ice Bay last near checkout to keep everything frozen solid.',
    };
  });

  const [activeTab, setActiveTab] = useState<'list' | 'stores' | 'timeline' | 'portions'>('list');
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isRefineCheckoutOpen, setIsRefineCheckoutOpen] = useState(false);
  const [substituteItem, setSubstituteItem] = useState<ShoppingItem | null>(null);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('cymbalmart_party_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('cymbalmart_party_items', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem('cymbalmart_party_plan', JSON.stringify(plan));
  }, [plan]);

  // Initial plan load if items are empty
  useEffect(() => {
    if (items.length === 0) {
      generatePlanForProfile(profile);
    }
  }, []);

  const generatePlanForProfile = async (targetProfile: PartyProfile) => {
    setIsGeneratingPlan(true);
    try {
      const res = await fetch('/api/party/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile: targetProfile }),
      });
      const data = await res.json();

      const newItems: ShoppingItem[] = (data.items || []).map((it: any, idx: number) => ({
        id: `item-${Date.now()}-${idx}`,
        name: it.name,
        category: it.category || 'food_mains',
        department: it.department || 'Produce & Fresh Market',
        aisleNumber: it.aisleNumber || 'Aisle 1-3',
        brandTier: it.brandTier || (it.name.includes('Cymbal Select') ? 'cymbal_select' : it.name.includes('Cymbal Organics') ? 'cymbal_organics' : 'brand_name'),
        quantity: it.quantity || 1,
        unit: it.unit || 'items',
        estimatedPrice: it.estimatedPrice || 10,
        originalPrice: it.originalPrice || (it.brandTier === 'cymbal_select' ? Math.round(it.estimatedPrice * 1.33) : undefined),
        savings: it.savings || (it.brandTier === 'cymbal_select' ? Math.round(it.estimatedPrice * 0.33) : undefined),
        targetStore: it.targetStore || 'CymbalMart Supercenter',
        priority: it.priority || 'must_have',
        status: 'to_buy',
        notes: it.notes || '',
        dietaryTag: it.dietaryTag || '',
        isCustom: false,
      }));

      setItems(newItems);
      setPlan({
        profile: targetProfile,
        items: newItems,
        portionRules: generatePortionRulesList(targetProfile),
        timeline: data.timeline || [],
        recipesAndDrinks: data.recipesAndDrinks || [],
        budgetTips: data.budgetTips || [],
        agentAdvice: data.agentAdvice || 'Plan drinks and fresh foods carefully for smooth party flow at CymbalMart.',
      });
    } catch (err) {
      console.error('Failed to generate plan:', err);
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const handleSaveProfile = (newProfile: PartyProfile, shouldRegenerateAI: boolean) => {
    setProfile(newProfile);
    if (shouldRegenerateAI) {
      generatePlanForProfile(newProfile);
    } else {
      // Just update portion rules without discarding custom items
      setPlan((prev) => ({
        ...prev,
        profile: newProfile,
        portionRules: generatePortionRulesList(newProfile),
      }));
    }
  };

  const handleUpdateItem = (itemId: string, updates: Partial<ShoppingItem>) => {
    setItems((prev) =>
      prev.map((it) => (it.id === itemId ? { ...it, ...updates } : it))
    );
  };

  const handleDeleteItem = (itemId: string) => {
    setItems((prev) => prev.filter((it) => it.id !== itemId));
  };

  const handleAddItem = (newItem: ShoppingItem) => {
    setItems((prev) => [newItem, ...prev]);
  };

  const handleApplySwap = (originalItem: ShoppingItem, newFields: Partial<ShoppingItem>) => {
    setItems((prev) =>
      prev.map((it) => (it.id === originalItem.id ? { ...it, ...newFields } : it))
    );
  };

  const handleBatchUpdateStatus = (itemIds: string[], status: ItemStatus) => {
    const idSet = new Set(itemIds);
    setItems((prev) =>
      prev.map((it) => (idSet.has(it.id) ? { ...it, status } : it))
    );
  };

  const handleUpdateGuests = (adults: number, kids: number, hours: number) => {
    const updated: PartyProfile = {
      ...profile,
      durationHours: hours,
      guestCount: {
        adults,
        kids,
        total: adults + kids,
      },
    };
    setProfile(updated);
    setPlan((prev) => ({
      ...prev,
      profile: updated,
      portionRules: generatePortionRulesList(updated),
    }));
  };

  const handleSendMessageToAgent = async (userText: string) => {
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setIsChatLoading(true);

    try {
      const res = await fetch('/api/party/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: chatMessages.concat(userMsg),
          userMessage: userText,
          currentPlan: { ...plan, items },
        }),
      });
      const data = await res.json();

      let suggestedActions = undefined;
      if (data.actions && data.actions.addItems) {
        suggestedActions = [
          {
            label: `Add CymbalMart items (${data.actions.addItems.length})`,
            actionType: 'add_item' as const,
            payload: {
              addItems: data.actions.addItems.map((aiItem: any, idx: number) => ({
                id: `ai-add-${Date.now()}-${idx}`,
                name: aiItem.name,
                category: aiItem.category || 'food_mains',
                department: aiItem.department || 'Produce & Fresh Market',
                aisleNumber: aiItem.aisleNumber || 'Aisle 1-3',
                brandTier: aiItem.brandTier || 'cymbal_select',
                quantity: aiItem.quantity || 1,
                unit: aiItem.unit || 'items',
                estimatedPrice: aiItem.estimatedPrice || 10,
                targetStore: aiItem.targetStore || 'CymbalMart Supercenter',
                priority: aiItem.priority || 'recommended',
                status: 'to_buy' as const,
                notes: aiItem.notes || '',
                isCustom: true,
              })),
            },
          },
        ];
      }

      const agentMsg: ChatMessage = {
        id: `msg-agent-${Date.now()}`,
        role: 'assistant',
        content: data.reply || 'I am ready to help you optimize your CymbalMart shopping list!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedActions,
      };

      setChatMessages((prev) => [...prev, agentMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      const errorMsg: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        role: 'assistant',
        content: 'I had a momentary glitch connecting to the planning agent, but your CymbalMart shopping list is ready to be modified directly.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleApplyActionItems = (newItems: ShoppingItem[]) => {
    setItems((prev) => [...newItems, ...prev]);
  };

  const handleClearChat = () => {
    setChatMessages([]);
  };

  const totalCost = items.reduce((acc, i) => acc + (i.estimatedPrice || 0), 0);
  const purchasedCount = items.filter((i) => i.status === 'purchased' || i.status === 'already_have').length;

  // Initialize Hands-Free Voice Assistant Controller
  const voiceAssistant = useVoiceAssistant({
    profile,
    items,
    plan,
    activeTab,
    onUpdateProfile: (updates) => {
      setProfile((prev) => ({ ...prev, ...updates }));
      setPlan((prev) => ({
        ...prev,
        profile: { ...prev.profile, ...updates },
        portionRules: updates.guestCount ? generatePortionRulesList({ ...prev.profile, ...updates }) : prev.portionRules,
      }));
    },
    onUpdateItems: (newItems) => setItems(newItems),
    onAddItem: handleAddItem,
    onRemoveItem: handleDeleteItem,
    onUpdateItem: handleUpdateItem,
    onChangeTab: setActiveTab,
    onOpenCheckout: () => setIsRefineCheckoutOpen(true),
    onOpenSetup: () => setIsSetupOpen(true),
    onOpenChat: () => setIsChatOpen(true),
    onOpenAddItem: () => setIsAddItemOpen(true),
  });

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col selection:bg-blue-100 selection:text-blue-900 pb-20">
      
      {/* Top Navbar with CUJ Stepper */}
      <Navbar
        profile={profile}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSetup={() => setIsSetupOpen(true)}
        onOpenChat={() => setIsChatOpen(!isChatOpen)}
        onOpenExport={() => setIsExportOpen(true)}
        onOpenAddItem={() => setIsAddItemOpen(true)}
        onOpenRefineCheckout={() => setIsRefineCheckoutOpen(true)}
        isChatOpen={isChatOpen}
        totalCost={totalCost}
        purchasedCount={purchasedCount}
        totalItemCount={items.length}
        isVoiceListening={voiceAssistant.isListening}
        onToggleVoice={voiceAssistant.toggleListening}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Top Summary & Budget Bar with CUJ Triggers */}
        <BudgetOverviewBar
          profile={profile}
          items={items}
          agentAdvice={plan.agentAdvice}
          onOpenSetup={() => setIsSetupOpen(true)}
          onOpenPortions={() => setActiveTab('portions')}
          onOpenRefineCheckout={() => setIsRefineCheckoutOpen(true)}
        />

        {/* Tab Views */}
        {activeTab === 'list' && (
          <ShoppingListDashboard
            profile={profile}
            items={items}
            onUpdateItem={handleUpdateItem}
            onDeleteItem={handleDeleteItem}
            onAddItemClick={() => setIsAddItemOpen(true)}
            onOpenSubstituteModal={(item) => setSubstituteItem(item)}
            onBatchUpdateStatus={handleBatchUpdateStatus}
            onBatchUpdateItems={(newItems) => setItems(newItems)}
          />
        )}

        {activeTab === 'stores' && (
          <ShoppingModeView
            profile={profile}
            items={items}
            onUpdateItem={handleUpdateItem}
            onOpenAddItem={() => setIsAddItemOpen(true)}
          />
        )}

        {activeTab === 'portions' && (
          <PortionRulesDrawer
            profile={profile}
            onUpdateGuests={handleUpdateGuests}
          />
        )}

        {activeTab === 'timeline' && (
          <PartyTimelineView
            plan={{ ...plan, items }}
            onOpenAddItem={() => setIsAddItemOpen(true)}
          />
        )}

      </main>

      {/* Persistent Floating Chatbot Launcher for Customers */}
      <div className="fixed bottom-5 right-5 z-40 no-print flex flex-col items-end space-y-2">
        {!isChatOpen && (
          <button
            id="floating-btn-cymbalmart-assistant"
            onClick={() => setIsChatOpen(true)}
            className="group relative flex items-center space-x-2.5 px-4 py-3 bg-blue-900 hover:bg-blue-950 text-white rounded-2xl shadow-xl hover:shadow-2xl border border-blue-700/60 transition-all hover:scale-105 active:scale-95"
            title="Chat with CymbalMart Assistant"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
              <Bot className="w-5 h-5" />
            </div>
            <div className="text-left pr-1">
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>CymbalMart Assistant</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <p className="text-[10px] text-blue-200">
                Ask about aisles, deals & recipes
              </p>
            </div>
            <span className="sr-only">Open CymbalMart Assistant Chat</span>
          </button>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-auto py-6 border-t border-stone-200 bg-white text-center text-xs text-stone-500 no-print">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-blue-950">CymbalMart</span>
            <span>•</span>
            <span>Shopping Agent</span>
          </div>
          <div>
            Powered by Gemini AI • Save with Cymbal Select & Curbside Pickup
          </div>
        </div>
      </footer>

      {/* Modals & Drawers */}
      
      {/* CUJ Step 1: Define Event */}
      <PartySetupModal
        isOpen={isSetupOpen}
        onClose={() => setIsSetupOpen(false)}
        currentProfile={profile}
        onSaveProfile={handleSaveProfile}
        isGenerating={isGeneratingPlan}
      />

      {/* Custom Add Item */}
      <AddItemModal
        isOpen={isAddItemOpen}
        onClose={() => setIsAddItemOpen(false)}
        onAddItem={handleAddItem}
        currency={profile.currency}
      />

      {/* AI Store-Brand & Dietary Swap */}
      <ItemSubstituteModal
        isOpen={Boolean(substituteItem)}
        item={substituteItem}
        profile={profile}
        onClose={() => setSubstituteItem(null)}
        onApplySwap={handleApplySwap}
      />

      {/* CUJ Step 3: Refine & Checkout Modal */}
      <RefineAndCheckoutModal
        isOpen={isRefineCheckoutOpen}
        onClose={() => setIsRefineCheckoutOpen(false)}
        profile={profile}
        items={items}
        onUpdateItems={(newItems) => setItems(newItems)}
        onOpenSubstituteModal={(item) => {
          setIsRefineCheckoutOpen(false);
          setSubstituteItem(item);
        }}
      />

      {/* Export & Sharing Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        plan={{ ...plan, items }}
      />

      {/* CymbalMart Assistant Drawer */}
      <AgentChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        plan={{ ...plan, items }}
        messages={chatMessages}
        onSendMessage={handleSendMessageToAgent}
        isLoading={isChatLoading}
        onApplyActionItems={handleApplyActionItems}
        onClearChat={handleClearChat}
      />

      {/* Floating Hands-Free Voice Assistant Controller HUD */}
      <VoiceAssistantHUD
        isListening={voiceAssistant.isListening}
        isProcessing={voiceAssistant.isProcessing}
        transcript={voiceAssistant.transcript}
        lastCommand={voiceAssistant.lastCommand}
        assistantSpokenReply={voiceAssistant.assistantSpokenReply}
        isVoiceMuted={voiceAssistant.isVoiceMuted}
        isHandsFreeContinuous={voiceAssistant.isHandsFreeContinuous}
        speechSupported={voiceAssistant.speechSupported}
        isSpeaking={voiceAssistant.isSpeaking}
        lastActionBadge={voiceAssistant.lastActionBadge}
        onToggleListening={voiceAssistant.toggleListening}
        onToggleMute={voiceAssistant.setIsVoiceMuted}
        onToggleContinuous={voiceAssistant.setIsHandsFreeContinuous}
        onManualCommand={voiceAssistant.manualSubmitCommand}
        onReplayAudio={voiceAssistant.replaySpokenReply}
      />

    </div>
  );
}
