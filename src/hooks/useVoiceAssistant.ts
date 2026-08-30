import { useState, useEffect, useRef, useCallback } from 'react';
import { PartyProfile, ShoppingItem, PartyPlan, BrandTier, ItemStatus, ItemPriority, CymbalDepartment } from '../types';

interface VoiceIntentResponse {
  intent: string;
  spokenResponse: string;
  actionPayload?: any;
}

interface UseVoiceAssistantProps {
  profile: PartyProfile;
  items: ShoppingItem[];
  plan: PartyPlan;
  activeTab: 'list' | 'stores' | 'timeline' | 'portions';
  onUpdateProfile: (updates: Partial<PartyProfile>) => void;
  onUpdateItems: (newItems: ShoppingItem[]) => void;
  onAddItem: (item: ShoppingItem) => void;
  onRemoveItem: (id: string) => void;
  onUpdateItem: (id: string, updates: Partial<ShoppingItem>) => void;
  onChangeTab: (tab: 'list' | 'stores' | 'timeline' | 'portions') => void;
  onOpenCheckout: () => void;
  onOpenSetup: () => void;
  onOpenChat: () => void;
  onOpenAddItem: () => void;
}

export function useVoiceAssistant({
  profile,
  items,
  plan,
  activeTab,
  onUpdateProfile,
  onUpdateItems,
  onAddItem,
  onRemoveItem,
  onUpdateItem,
  onChangeTab,
  onOpenCheckout,
  onOpenSetup,
  onOpenChat,
  onOpenAddItem,
}: UseVoiceAssistantProps) {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [lastCommand, setLastCommand] = useState('');
  const [assistantSpokenReply, setAssistantSpokenReply] = useState('');
  const [isVoiceMuted, setIsVoiceMuted] = useState(false);
  const [isHandsFreeContinuous, setIsHandsFreeContinuous] = useState(true);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastActionBadge, setLastActionBadge] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const shouldListenRef = useRef(false);

  // Text-To-Speech function
  const speakText = useCallback((text: string) => {
    if (isVoiceMuted || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;

      // Select natural English voice if available
      const voices = window.speechSynthesis.getVoices();
      const naturalVoice = voices.find(
        (v) => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Alex'))
      ) || voices.find((v) => v.lang.startsWith('en'));
      
      if (naturalVoice) {
        utterance.voice = naturalVoice;
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error('Speech synthesis error:', e);
      setIsSpeaking(false);
    }
  }, [isVoiceMuted]);

  // Execute Intent Actions Locally & Reactively
  const executeIntent = useCallback(async (speechText: string) => {
    const text = speechText.trim();
    if (!text) return;
    setIsProcessing(true);
    setLastCommand(text);

    const lower = text.toLowerCase();

    // 1. Direct Instant Local Rules for Zero Latency
    // Tab & Mode Navigation
    if (lower.includes('shopping mode') || lower.includes('in-store') || lower.includes('aisle checklist') || lower.includes('store route')) {
      onChangeTab('stores');
      const reply = 'Switched to in-store shopping mode sorted by store aisles.';
      setAssistantSpokenReply(reply);
      setLastActionBadge('Navigated: In-Store Mode');
      speakText(reply);
      setIsProcessing(false);
      return;
    }

    if (lower.includes('shopping list') || lower.includes('dashboard') || lower.includes('main list') || lower.includes('back to list')) {
      onChangeTab('list');
      const reply = 'Back to your shopping list dashboard.';
      setAssistantSpokenReply(reply);
      setLastActionBadge('Navigated: Shopping List');
      speakText(reply);
      setIsProcessing(false);
      return;
    }

    if (lower.includes('timeline') || lower.includes('schedule') || lower.includes('party timeline') || lower.includes('prep countdown')) {
      onChangeTab('timeline');
      const reply = 'Opening party prep timeline and countdown schedule.';
      setAssistantSpokenReply(reply);
      setLastActionBadge('Navigated: Timeline');
      speakText(reply);
      setIsProcessing(false);
      return;
    }

    if (lower.includes('portion') || lower.includes('portion rules') || lower.includes('catering formulas')) {
      onChangeTab('portions');
      const reply = 'Opening CymbalMart catering portion calculator.';
      setAssistantSpokenReply(reply);
      setLastActionBadge('Navigated: Portions');
      speakText(reply);
      setIsProcessing(false);
      return;
    }

    if (lower.includes('go to checkout') || lower.includes('open checkout') || lower.includes('ready to checkout') || lower.includes('refine and checkout') || lower.includes('buy groceries')) {
      onOpenCheckout();
      const reply = 'Opening CymbalMart checkout. You can select curbside pickup or same-day delivery.';
      setAssistantSpokenReply(reply);
      setLastActionBadge('Opened: Checkout');
      speakText(reply);
      setIsProcessing(false);
      return;
    }

    if (lower.includes('open setup') || lower.includes('edit event') || lower.includes('change party profile') || lower.includes('party setup')) {
      onOpenSetup();
      const reply = 'Opening party setup to adjust theme, guest count, or budget.';
      setAssistantSpokenReply(reply);
      setLastActionBadge('Opened: Party Setup');
      speakText(reply);
      setIsProcessing(false);
      return;
    }

    if (lower.includes('chat with assistant') || lower.includes('open assistant') || lower.includes('open chat') || lower.includes('open concierge')) {
      onOpenChat();
      const reply = 'Opening CymbalMart Assistant chat drawer.';
      setAssistantSpokenReply(reply);
      setLastActionBadge('Opened: Chat Assistant');
      speakText(reply);
      setIsProcessing(false);
      return;
    }

    if (lower.includes('mute voice') || lower.includes('mute audio') || lower.includes('be quiet') || lower.includes('stop speaking')) {
      setIsVoiceMuted(true);
      window.speechSynthesis?.cancel();
      setAssistantSpokenReply('Voice audio responses muted.');
      setLastActionBadge('Voice Muted');
      setIsProcessing(false);
      return;
    }

    if (lower.includes('unmute voice') || lower.includes('unmute audio') || lower.includes('turn sound on')) {
      setIsVoiceMuted(false);
      const reply = 'Audio feedback is now enabled.';
      setAssistantSpokenReply(reply);
      setLastActionBadge('Voice Unmuted');
      speakText(reply);
      setIsProcessing(false);
      return;
    }

    if (lower.includes('save money') || lower.includes('cymbal select') || lower.includes('switch all to store brand') || lower.includes('store brand swap')) {
      const updated = items.map((it) => {
        if (it.brandTier !== 'cymbal_select') {
          const discount = Math.max(1, Math.round(it.estimatedPrice * 0.75));
          return {
            ...it,
            name: it.name.includes('Cymbal Select') ? it.name : `Cymbal Select ${it.name}`,
            brandTier: 'cymbal_select' as BrandTier,
            estimatedPrice: discount,
            originalPrice: it.estimatedPrice,
            savings: (it.savings || 0) + (it.estimatedPrice - discount),
          };
        }
        return it;
      });
      onUpdateItems(updated);
      const reply = 'Converted eligible items to Cymbal Select to save 25% on your total budget.';
      setAssistantSpokenReply(reply);
      setLastActionBadge('Swapped: Cymbal Select');
      speakText(reply);
      setIsProcessing(false);
      return;
    }

    // 2. Call Server AI Voice Intent Endpoint for comprehensive NLP parsing
    try {
      const res = await fetch('/api/voice/intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          speech: text,
          currentPlan: { profile, items, ...plan },
          currentView: activeTab,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to parse voice command');
      }

      const data: VoiceIntentResponse = await res.json();
      const { intent, spokenResponse, actionPayload } = data;

      // Handle intents returned from AI
      switch (intent) {
        case 'ADD_ITEMS':
        case 'ADD_ITEM': {
          const itemsToAdd = actionPayload?.itemsToAdd || (actionPayload?.item ? [actionPayload.item] : []);
          if (itemsToAdd.length > 0) {
            itemsToAdd.forEach((rawItem: any) => {
              const newItem: ShoppingItem = {
                id: `voice-item-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                name: rawItem.name || 'Cymbal Grocery Item',
                category: rawItem.category || 'food_mains',
                department: rawItem.department || 'Produce & Fresh Market',
                aisleNumber: rawItem.aisleNumber || 'Aisle 1',
                brandTier: rawItem.brandTier || 'cymbal_select',
                quantity: rawItem.quantity || 1,
                unit: rawItem.unit || 'items',
                estimatedPrice: rawItem.estimatedPrice || 10,
                originalPrice: rawItem.originalPrice || Math.round((rawItem.estimatedPrice || 10) * 1.3),
                savings: rawItem.savings || Math.round((rawItem.estimatedPrice || 10) * 0.3),
                targetStore: 'CymbalMart Supercenter',
                priority: rawItem.priority || 'must_have',
                status: 'to_buy',
                notes: rawItem.notes || 'Added via Voice Assistant',
              };
              onAddItem(newItem);
            });
            setLastActionBadge(`Added ${itemsToAdd.length} item(s)`);
          }
          break;
        }

        case 'REMOVE_ITEM': {
          const targetName = actionPayload?.targetItemName?.toLowerCase();
          const targetId = actionPayload?.targetItemId;
          const match = items.find((i) => (targetId && i.id === targetId) || (targetName && i.name.toLowerCase().includes(targetName)));
          if (match) {
            onRemoveItem(match.id);
            setLastActionBadge(`Removed ${match.name}`);
          }
          break;
        }

        case 'UPDATE_QUANTITY': {
          const targetName = actionPayload?.targetItemName?.toLowerCase();
          const targetId = actionPayload?.targetItemId;
          const newQty = actionPayload?.newQuantity;
          if (typeof newQty === 'number' && newQty > 0) {
            const match = items.find((i) => (targetId && i.id === targetId) || (targetName && i.name.toLowerCase().includes(targetName)));
            if (match) {
              const unitPrice = match.quantity > 0 ? (match.estimatedPrice / match.quantity) : match.estimatedPrice;
              onUpdateItem(match.id, {
                quantity: newQty,
                estimatedPrice: Math.round(unitPrice * newQty),
              });
              setLastActionBadge(`Updated ${match.name} to ${newQty}`);
            }
          }
          break;
        }

        case 'CHECK_OFF_ITEM': {
          const targetName = actionPayload?.targetItemName?.toLowerCase();
          const targetId = actionPayload?.targetItemId;
          const newStatus = actionPayload?.newStatus || 'purchased';
          const match = items.find((i) => (targetId && i.id === targetId) || (targetName && i.name.toLowerCase().includes(targetName)));
          if (match) {
            onUpdateItem(match.id, { status: newStatus as ItemStatus });
            setLastActionBadge(`Marked ${match.name} as ${newStatus}`);
          }
          break;
        }

        case 'UPDATE_PLAN_PROFILE': {
          const updates = actionPayload?.profileUpdates;
          if (updates) {
            const profileChanges: Partial<PartyProfile> = {};
            if (updates.title) profileChanges.title = updates.title;
            if (updates.theme) profileChanges.theme = updates.theme;
            if (updates.budget) profileChanges.budget = updates.budget;
            if (updates.guestAdults || updates.guestKids) {
              const currentAdults = profile.guestCount.adults;
              const currentKids = profile.guestCount.kids;
              const adults = updates.guestAdults ?? currentAdults;
              const kids = updates.guestKids ?? currentKids;
              profileChanges.guestCount = {
                adults,
                kids,
                total: adults + kids,
              };
            }
            onUpdateProfile(profileChanges);
            setLastActionBadge('Updated Event Profile');
          }
          break;
        }

        case 'SWITCH_VIEW': {
          const target = actionPayload?.targetView;
          if (target === 'dashboard' || target === 'list') onChangeTab('list');
          else if (target === 'shopping_mode' || target === 'stores') onChangeTab('stores');
          else if (target === 'timeline') onChangeTab('timeline');
          else if (target === 'portions') onChangeTab('portions');
          setLastActionBadge(`Navigated: ${target}`);
          break;
        }

        case 'OPEN_MODAL': {
          const modal = actionPayload?.targetModal;
          if (modal === 'checkout') onOpenCheckout();
          else if (modal === 'setup') onOpenSetup();
          else if (modal === 'add_item') onOpenAddItem();
          else if (modal === 'chat') onOpenChat();
          setLastActionBadge(`Opened: ${modal}`);
          break;
        }

        case 'PROCEED_CHECKOUT': {
          onOpenCheckout();
          setLastActionBadge('Opened Checkout');
          break;
        }

        case 'SWAP_STORE_BRAND': {
          const updated = items.map((it) => {
            if (it.brandTier !== 'cymbal_select') {
              const discount = Math.max(1, Math.round(it.estimatedPrice * 0.75));
              return {
                ...it,
                name: it.name.includes('Cymbal Select') ? it.name : `Cymbal Select ${it.name}`,
                brandTier: 'cymbal_select' as BrandTier,
                estimatedPrice: discount,
                originalPrice: it.estimatedPrice,
                savings: (it.savings || 0) + (it.estimatedPrice - discount),
              };
            }
            return it;
          });
          onUpdateItems(updated);
          setLastActionBadge('Swapped: Cymbal Select');
          break;
        }

        case 'AUTO_ALIGN_BUDGET': {
          const currentTotal = items.reduce((acc, it) => acc + (it.estimatedPrice || 0), 0);
          const targetBudget = profile.budget || 200;
          if (currentTotal > targetBudget) {
            const ratio = targetBudget / currentTotal;
            const updated = items.map((it) => {
              if (it.priority === 'optional' && it.quantity > 1) {
                const newQty = Math.max(1, Math.floor(it.quantity * ratio));
                const unitPrice = it.estimatedPrice / it.quantity;
                return {
                  ...it,
                  quantity: newQty,
                  estimatedPrice: Math.max(1, Math.round(unitPrice * newQty)),
                };
              }
              return it;
            });
            onUpdateItems(updated);
            setLastActionBadge('Auto-Aligned Budget');
          }
          break;
        }

        default:
          setLastActionBadge('Processed Command');
          break;
      }

      setAssistantSpokenReply(spokenResponse || 'Understood and applied.');
      speakText(spokenResponse || 'Understood and applied.');
    } catch (err) {
      console.error('Error executing voice command via AI:', err);
      const fallbackReply = `I heard "${text}". You can ask me to add groceries, switch views, or proceed to checkout.`;
      setAssistantSpokenReply(fallbackReply);
      speakText(fallbackReply);
    } finally {
      setIsProcessing(false);
    }
  }, [
    items,
    profile,
    plan,
    activeTab,
    onChangeTab,
    onOpenCheckout,
    onOpenSetup,
    onOpenChat,
    onOpenAddItem,
    onAddItem,
    onRemoveItem,
    onUpdateItem,
    onUpdateItems,
    onUpdateProfile,
    speakText,
  ]);

  // Setup Web Speech Recognition API
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      if (interimTranscript) {
        setTranscript(interimTranscript);
      }

      if (finalTranscript) {
        setTranscript(finalTranscript);
        executeIntent(finalTranscript);
      }
    };

    recognition.onerror = (event: any) => {
      console.warn('Speech recognition error:', event.error);
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setIsListening(false);
        shouldListenRef.current = false;
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      // If continuous listening is enabled and user hasn't toggled off, restart
      if (shouldListenRef.current && isHandsFreeContinuous) {
        try {
          recognition.start();
        } catch (e) {
          // ignore already started error
        }
      }
    };

    recognitionRef.current = recognition;

    return () => {
      shouldListenRef.current = false;
      try {
        recognition.stop();
      } catch (e) {}
    };
  }, [executeIntent, isHandsFreeContinuous]);

  // Toggle Voice Listening
  const toggleListening = () => {
    if (!speechSupported) {
      alert('Speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.');
      return;
    }

    if (isListening) {
      shouldListenRef.current = false;
      try {
        recognitionRef.current?.stop();
      } catch (e) {}
      setIsListening(false);
      setAssistantSpokenReply('Voice listening paused.');
    } else {
      shouldListenRef.current = true;
      try {
        recognitionRef.current?.start();
        setIsListening(true);
        const welcome = 'Voice Control active. I am listening to your grocery and checkout commands.';
        setAssistantSpokenReply(welcome);
        speakText(welcome);
      } catch (e) {
        console.error('Failed to start speech recognition:', e);
      }
    }
  };

  const manualSubmitCommand = (customCommand: string) => {
    setTranscript(customCommand);
    executeIntent(customCommand);
  };

  return {
    isListening,
    isProcessing,
    transcript,
    lastCommand,
    assistantSpokenReply,
    isVoiceMuted,
    isHandsFreeContinuous,
    speechSupported,
    isSpeaking,
    lastActionBadge,
    toggleListening,
    setIsVoiceMuted: (muted: boolean) => {
      setIsVoiceMuted(muted);
      if (muted) window.speechSynthesis?.cancel();
    },
    setIsHandsFreeContinuous,
    manualSubmitCommand,
    replaySpokenReply: () => speakText(assistantSpokenReply),
  };
}
