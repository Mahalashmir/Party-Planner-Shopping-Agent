import React, { useState } from 'react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  ChevronUp, 
  ChevronDown, 
  Radio, 
  Zap, 
  ShoppingBag, 
  Store, 
  Tag, 
  Sliders, 
  Send, 
  RefreshCw,
  HelpCircle,
  X,
  Bot
} from 'lucide-react';

interface VoiceAssistantHUDProps {
  isListening: boolean;
  isProcessing: boolean;
  transcript: string;
  lastCommand: string;
  assistantSpokenReply: string;
  isVoiceMuted: boolean;
  isHandsFreeContinuous: boolean;
  speechSupported: boolean;
  isSpeaking: boolean;
  lastActionBadge: string | null;
  onToggleListening: () => void;
  onToggleMute: (muted: boolean) => void;
  onToggleContinuous: (cont: boolean) => void;
  onManualCommand: (cmd: string) => void;
  onReplayAudio: () => void;
}

const VOICE_CHEATSHEET = [
  { label: 'Add 3 bags of ice', category: 'Cart' },
  { label: 'Switch to in-store shopping mode', category: 'Navigation' },
  { label: 'Go to checkout', category: 'Checkout' },
  { label: 'Convert all items to Cymbal Select', category: 'Savings' },
  { label: 'What is my budget total?', category: 'Budget' },
  { label: 'Open party timeline schedule', category: 'Prep' },
  { label: 'Add 2 packs of hamburger buns', category: 'Cart' },
  { label: 'Auto-align list to budget', category: 'Budget' },
  { label: 'Open CymbalMart Assistant chat', category: 'Chat' },
];

export const VoiceAssistantHUD: React.FC<VoiceAssistantHUDProps> = ({
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
  onToggleListening,
  onToggleMute,
  onToggleContinuous,
  onManualCommand,
  onReplayAudio,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [showCheatsheet, setShowCheatsheet] = useState(false);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    onManualCommand(manualInput.trim());
    setManualInput('');
  };

  return (
    <div 
      id="cymbalmart-voice-hud"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-2xl no-print transition-all duration-300"
    >
      <div className="bg-blue-950/95 backdrop-blur-md text-white rounded-2xl shadow-2xl border border-blue-800/80 p-3 sm:p-4 overflow-hidden">
        
        {/* Main Voice Bar */}
        <div className="flex items-center justify-between gap-2 sm:gap-3">
          
          {/* Left: Active Mic Pulse Button */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              id="btn-voice-mic-toggle"
              onClick={onToggleListening}
              className={`relative p-3 rounded-2xl transition-all duration-200 shadow-md flex items-center justify-center ${
                isListening
                  ? 'bg-rose-600 hover:bg-rose-700 text-white ring-4 ring-rose-400/40 animate-pulse'
                  : 'bg-blue-800 hover:bg-blue-700 text-blue-100'
              }`}
              title={isListening ? 'Click to pause voice control' : 'Click to start voice control'}
            >
              {isListening ? (
                <Mic className="w-5 h-5 animate-bounce" />
              ) : (
                <MicOff className="w-5 h-5 text-stone-300" />
              )}
            </button>

            <div>
              <div className="flex items-center space-x-2">
                <span className="font-display text-xs sm:text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                  <span>Voice Control</span>
                  {isListening && (
                    <span className="inline-flex items-center px-1.5 py-0.2 rounded-md text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mr-1 animate-ping" />
                      Live Hands-Free
                    </span>
                  )}
                </span>
                
                {lastActionBadge && (
                  <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    <Zap className="w-2.5 h-2.5 mr-1" />
                    {lastActionBadge}
                  </span>
                )}
              </div>

              {/* Status / Transcript Subtitle */}
              <div className="text-[11px] sm:text-xs text-blue-200 truncate max-w-[200px] sm:max-w-sm mt-0.5">
                {isProcessing ? (
                  <span className="flex items-center gap-1 text-amber-300 animate-pulse">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    Processing voice command...
                  </span>
                ) : isListening ? (
                  transcript ? (
                    <span className="text-white italic">"{transcript}"</span>
                  ) : (
                    <span className="text-blue-300">Listening... Speak any shopping or checkout action</span>
                  )
                ) : (
                  <span>Click mic or say commands hands-free to control entire app</span>
                )}
              </div>
            </div>
          </div>

          {/* Right Controls: Audio Toggle, Cheatsheet & Expand */}
          <div className="flex items-center space-x-1.5 sm:space-x-2">
            
            {/* Audio Response Mute Toggle */}
            <button
              id="btn-voice-mute-toggle"
              onClick={() => onToggleMute(!isVoiceMuted)}
              className={`p-2 rounded-xl text-xs font-semibold border transition-colors ${
                isVoiceMuted
                  ? 'bg-blue-900/60 text-stone-400 border-blue-800'
                  : 'bg-blue-800 text-blue-200 border-blue-700 hover:text-white'
              }`}
              title={isVoiceMuted ? 'Unmute voice audio feedback' : 'Mute voice audio feedback'}
            >
              {isVoiceMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>

            {/* Quick Cheatsheet Toggle */}
            <button
              id="btn-voice-cheatsheet-toggle"
              onClick={() => setShowCheatsheet(!showCheatsheet)}
              className={`p-2 rounded-xl text-xs font-semibold border transition-colors ${
                showCheatsheet
                  ? 'bg-amber-400 text-blue-950 border-amber-300'
                  : 'bg-blue-800 text-blue-200 border-blue-700 hover:text-white'
              }`}
              title="View voice commands cheat-sheet"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            {/* Expand / Minimize Drawer */}
            <button
              id="btn-voice-expand-toggle"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 rounded-xl bg-blue-800 hover:bg-blue-700 text-blue-200 hover:text-white border border-blue-700 transition-colors"
              title={isExpanded ? 'Collapse voice control details' : 'Expand voice control details'}
            >
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>

          </div>

        </div>

        {/* Assistant Spoken Response Bubble (if available) */}
        {assistantSpokenReply && (
          <div className="mt-2.5 pt-2.5 border-t border-blue-900 flex items-start justify-between gap-2 bg-blue-900/40 p-2.5 rounded-xl">
            <div className="flex items-start space-x-2 text-xs text-blue-100">
              <Bot className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-amber-300 mr-1.5">Assistant:</span>
                <span>{assistantSpokenReply}</span>
              </div>
            </div>
            {!isVoiceMuted && (
              <button
                onClick={onReplayAudio}
                className="text-[10px] text-blue-300 hover:text-white px-1.5 py-0.5 rounded-md bg-blue-800/60 hover:bg-blue-800 shrink-0"
                title="Replay spoken response"
              >
                Replay 🔊
              </button>
            )}
          </div>
        )}

        {/* Quick Voice Cheatsheet Modal/Drawer */}
        {showCheatsheet && (
          <div className="mt-3 pt-3 border-t border-blue-900 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-amber-300">
              <span>Try Saying Any of These Hands-Free Commands:</span>
              <button
                onClick={() => setShowCheatsheet(false)}
                className="text-stone-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1">
              {VOICE_CHEATSHEET.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    onManualCommand(item.label);
                    setShowCheatsheet(false);
                  }}
                  className="text-left text-[11px] p-2 rounded-lg bg-blue-900/80 hover:bg-blue-800 border border-blue-700/60 text-blue-100 hover:text-white transition-colors flex items-center justify-between group"
                >
                  <span className="truncate">🗣️ "{item.label}"</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded-xs bg-blue-950 text-blue-300 border border-blue-800 shrink-0 ml-1">
                    {item.category}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Expanded View: Hands-Free Toggles & Text Command Fallback */}
        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-blue-900 space-y-3">
            
            {/* Hands-Free Settings */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-blue-200">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isHandsFreeContinuous}
                  onChange={(e) => onToggleContinuous(e.target.checked)}
                  className="rounded-xs border-blue-700 text-blue-600 focus:ring-blue-500"
                />
                <span>Continuous Hands-Free Listening (Auto-restarts)</span>
              </label>

              <div className="flex items-center space-x-2 text-[11px]">
                <span className="text-stone-400">Speech Engine:</span>
                <span className="text-emerald-400 font-semibold">Web Speech API + Gemini AI</span>
              </div>
            </div>

            {/* Text/Keyboard Command Fallback */}
            <form onSubmit={handleManualSubmit} className="flex items-center space-x-2">
              <input
                type="text"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder="Type a voice command (e.g. 'Add 5 bags of ice', 'Go to checkout')..."
                className="flex-1 px-3 py-2 rounded-xl bg-blue-900/80 border border-blue-700 text-xs text-white placeholder:text-blue-300/70 focus:outline-hidden focus:border-amber-400"
              />
              <button
                type="submit"
                disabled={!manualInput.trim() || isProcessing}
                className="px-3.5 py-2 bg-amber-400 hover:bg-amber-300 disabled:opacity-40 text-blue-950 rounded-xl text-xs font-bold shadow-xs transition-all active:scale-95 flex items-center space-x-1"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Run</span>
              </button>
            </form>

          </div>
        )}

      </div>
    </div>
  );
};
