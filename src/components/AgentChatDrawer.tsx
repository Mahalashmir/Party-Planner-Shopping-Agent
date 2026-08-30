import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  X, 
  Sparkles, 
  Check, 
  Plus, 
  Trash2, 
  HelpCircle, 
  RefreshCw, 
  ArrowRight,
  Store,
  BadgePercent,
  Copy,
  ShoppingBag,
  MessageSquare
} from 'lucide-react';
import { ChatMessage, PartyPlan, ShoppingItem } from '../types';

interface AgentChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  plan: PartyPlan;
  messages: ChatMessage[];
  onSendMessage: (msg: string) => Promise<void>;
  isLoading: boolean;
  onApplyActionItems: (newItems: ShoppingItem[]) => void;
  onClearChat?: () => void;
}

const CUSTOMER_STARTER_PROMPTS = [
  'How much money can I save with Cymbal Select store brand?',
  'Where can I find ice, cups, and napkins in the store?',
  'Portion check: Do I have enough drinks and food for my guests?',
  'Recommend kid-friendly and gluten-free snack options',
  'What items need to be pre-ordered from the bakery or butcher?',
  'Suggest a signature drink recipe and add the ingredients to my cart',
];

export const AgentChatDrawer: React.FC<AgentChatDrawerProps> = ({
  isOpen,
  onClose,
  plan,
  messages,
  onSendMessage,
  isLoading,
  onApplyActionItems,
  onClearChat,
}) => {
  const [inputMessage, setInputMessage] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;
    const msg = inputMessage.trim();
    setInputMessage('');
    await onSendMessage(msg);
  };

  const handleStarterClick = (promptText: string) => {
    setInputMessage(promptText);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div 
      id="cymbalmart-assistant-drawer"
      className="fixed inset-y-0 right-0 z-50 w-full sm:w-[500px] bg-white shadow-2xl border-l border-stone-200 flex flex-col no-print transition-all duration-300"
    >
      
      {/* Header: CymbalMart Assistant */}
      <div className="px-5 py-4 bg-blue-950 text-white flex items-center justify-between shadow-xs border-b border-blue-900">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-xs">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-display text-base font-bold text-white tracking-tight">
                CymbalMart Assistant
              </h3>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse" />
                Live Chat
              </span>
            </div>
            <p className="text-xs text-blue-200">
              Your 24/7 AI shopping, product finder & catering guide
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          {onClearChat && messages.length > 0 && (
            <button
              onClick={onClearChat}
              title="Clear conversation"
              className="p-1.5 text-blue-300 hover:text-white rounded-lg hover:bg-blue-900 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button
            id="btn-close-assistant"
            onClick={onClose}
            className="p-1.5 text-blue-200 hover:text-white rounded-lg hover:bg-blue-800 transition-colors"
            title="Close Assistant"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-50/70">
        
        {/* Welcome customer message if empty */}
        {messages.length === 0 && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50/60 border border-blue-200/80 text-stone-800 space-y-2.5 shadow-2xs">
              <div className="flex items-center space-x-2 text-blue-900 font-bold text-sm">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Hello! How can CymbalMart Assistant help you today?</span>
              </div>
              <p className="text-xs text-stone-700 leading-relaxed">
                I'm here to assist you with everything at CymbalMart: finding items in our store aisles, switching to <strong>Cymbal Select</strong> to save 25–30%, adjusting party portions for your <strong>{plan.profile?.guestCount?.total || 10} guests</strong>, or adding recipes directly to your cart!
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="text-[11px] font-semibold bg-white px-2 py-0.5 rounded-md text-stone-600 border border-stone-200 flex items-center gap-1">
                  <Store className="w-3 h-3 text-blue-600" /> Aisle Navigation
                </span>
                <span className="text-[11px] font-semibold bg-white px-2 py-0.5 rounded-md text-stone-600 border border-stone-200 flex items-center gap-1">
                  <BadgePercent className="w-3 h-3 text-emerald-600" /> Store Brand Savings
                </span>
                <span className="text-[11px] font-semibold bg-white px-2 py-0.5 rounded-md text-stone-600 border border-stone-200 flex items-center gap-1">
                  <ShoppingBag className="w-3 h-3 text-amber-600" /> 1-Click Cart Addition
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-[11px] uppercase font-bold text-stone-500 tracking-wider flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-stone-400" />
                <span>Popular Customer Inquiries</span>
              </div>
              <div className="space-y-1.5">
                {CUSTOMER_STARTER_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleStarterClick(prompt)}
                    className="w-full text-left text-xs p-2.5 rounded-xl border border-stone-200 bg-white hover:bg-blue-50/60 hover:border-blue-300 text-stone-700 hover:text-blue-950 transition-all font-medium flex items-center justify-between group shadow-2xs"
                  >
                    <span className="pr-2">{prompt}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-blue-600 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Message Feed */}
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center space-x-1.5 mb-1 px-1 text-[10px] text-stone-400 font-semibold">
                <span>{isUser ? 'You (Customer)' : 'CymbalMart Assistant'}</span>
                <span>•</span>
                <span>{msg.timestamp}</span>
              </div>

              <div
                className={`p-3.5 rounded-2xl text-xs max-w-[88%] leading-relaxed ${
                  isUser
                    ? 'bg-blue-600 text-white rounded-tr-xs shadow-xs font-medium'
                    : 'bg-white text-stone-800 border border-stone-200/90 rounded-tl-xs shadow-xs space-y-3'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>

                {/* Assistant message action buttons */}
                {!isUser && (
                  <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-[10px] text-stone-400">
                    <button
                      onClick={() => handleCopy(msg.content, msg.id)}
                      className="flex items-center space-x-1 hover:text-blue-600 transition-colors font-medium"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-600">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Suggested Action Item Block */}
                {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                  <div className="pt-2 border-t border-stone-100 space-y-2">
                    {msg.suggestedActions.map((act, aIdx) => (
                      <button
                        key={aIdx}
                        onClick={() => {
                          if (act.actionType === 'add_item' && act.payload?.addItems) {
                            onApplyActionItems(act.payload.addItems);
                          }
                        }}
                        className="w-full py-2.5 px-3.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-xs active:scale-95"
                      >
                        <Plus className="w-4 h-4 text-amber-300" />
                        <span>{act.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center space-x-2 text-stone-600 text-xs p-3.5 bg-white rounded-2xl border border-stone-200 max-w-[85%] shadow-2xs">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin shrink-0" />
            <span className="font-medium">CymbalMart Assistant is preparing recommendations...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <form onSubmit={handleSend} className="p-3.5 bg-white border-t border-stone-200 flex items-center space-x-2 shadow-xs">
        <input
          id="input-chat-message"
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Ask CymbalMart Assistant anything..."
          className="flex-1 px-4 py-2.5 rounded-xl border border-stone-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 text-xs text-stone-900 font-medium placeholder:text-stone-400 transition-all bg-stone-50/50"
        />
        <button
          type="submit"
          id="btn-send-chat"
          disabled={!inputMessage.trim() || isLoading}
          className="p-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl shadow-xs transition-all active:scale-95 shrink-0 flex items-center justify-center"
          title="Send message to CymbalMart Assistant"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

    </div>
  );
};
