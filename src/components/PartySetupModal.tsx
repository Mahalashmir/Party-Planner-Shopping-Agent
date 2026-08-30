import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Users, 
  DollarSign, 
  Clock, 
  MapPin, 
  Flame, 
  Cake, 
  GlassWater, 
  Gamepad2, 
  Compass, 
  PartyPopper,
  FileText,
  Check,
  Store
} from 'lucide-react';
import { PartyProfile, EventType, VenueType } from '../types';
import { PARTY_PRESETS } from '../data/presets';

interface PartySetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: PartyProfile;
  onSaveProfile: (profile: PartyProfile, shouldRegenerateAI: boolean) => void;
  isGenerating: boolean;
}

const EVENT_TYPE_OPTIONS: { type: EventType; label: string; icon: any }[] = [
  { type: 'dinner', label: 'Dinner Party / Fiesta', icon: Sparkles },
  { type: 'bbq', label: 'Backyard BBQ / Cookout', icon: Flame },
  { type: 'birthday', label: 'Birthday Celebration', icon: Cake },
  { type: 'cocktail', label: 'Cocktail & Tapas Soirée', icon: GlassWater },
  { type: 'kids', label: 'Kids Themed Party', icon: PartyPopper },
  { type: 'gamenight', label: 'Game / Pizza Night', icon: Gamepad2 },
  { type: 'shower', label: 'Baby / Bridal Shower', icon: Cake },
  { type: 'custom', label: 'Custom Event', icon: Compass },
];

const VENUE_OPTIONS: { venue: VenueType; label: string }[] = [
  { venue: 'indoor_home', label: 'Home / Living Room' },
  { venue: 'backyard', label: 'Backyard / Patio' },
  { venue: 'park', label: 'Public Park / Pavilion' },
  { venue: 'rented_venue', label: 'Rented Venue / Hall' },
  { venue: 'beach', label: 'Beach / Lake' },
  { venue: 'office', label: 'Office / Clubhouse' },
];

const DIETARY_OPTIONS = [
  'Vegetarian',
  'Vegan',
  'Gluten-Free',
  'Nut-Free',
  'Dairy-Free',
  'Halal',
  'Kosher',
];

export const PartySetupModal: React.FC<PartySetupModalProps> = ({
  isOpen,
  onClose,
  currentProfile,
  onSaveProfile,
  isGenerating,
}) => {
  const [formData, setFormData] = useState<PartyProfile>({ ...currentProfile });
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePresetSelect = (presetId: string) => {
    const preset = PARTY_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setSelectedPresetId(presetId);
    setFormData({
      ...formData,
      title: preset.title,
      eventType: preset.eventType,
      theme: preset.theme,
      guestCount: {
        adults: preset.suggestedGuests.adults,
        kids: preset.suggestedGuests.kids,
        total: preset.suggestedGuests.adults + preset.suggestedGuests.kids,
      },
      budget: preset.suggestedBudget,
      durationHours: preset.durationHours,
      venue: preset.venue,
      dietary: preset.dietary,
      vibeDescription: preset.description,
      specialRequests: preset.specialRequests || '',
    });
  };

  const toggleDietary = (diet: string) => {
    setFormData((prev) => {
      const exists = prev.dietary.includes(diet);
      return {
        ...prev,
        dietary: exists ? prev.dietary.filter((d) => d !== diet) : [...prev.dietary, diet],
      };
    });
  };

  const handleAdultChange = (val: number) => {
    const adults = Math.max(1, val);
    setFormData((prev) => ({
      ...prev,
      guestCount: {
        adults,
        kids: prev.guestCount.kids,
        total: adults + prev.guestCount.kids,
      },
    }));
  };

  const handleKidsChange = (val: number) => {
    const kids = Math.max(0, val);
    setFormData((prev) => ({
      ...prev,
      guestCount: {
        adults: prev.guestCount.adults,
        kids,
        total: prev.guestCount.adults + kids,
      },
    }));
  };

  const handleSubmit = (shouldRegenerate: boolean) => {
    onSaveProfile(formData, shouldRegenerate);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 no-print">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4.5 bg-stone-900 text-white flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm font-bold">
              <Store className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs uppercase font-bold tracking-widest text-amber-400">Step 1: Define Event</span>
                <span className="text-stone-400">•</span>
                <span className="text-xs text-stone-300">CymbalMart AI Agent</span>
              </div>
              <h2 className="font-display text-lg font-bold text-white">
                Party Specifications & Budget Goals
              </h2>
            </div>
          </div>
          <button
            id="btn-close-setup-modal"
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Quick Presets Carousel */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Or Select a CymbalMart Curated Preset</span>
              </label>
              <span className="text-xs text-stone-500">1-Click Auto-Fill</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {PARTY_PRESETS.map((preset) => {
                const isSelected = selectedPresetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handlePresetSelect(preset.id)}
                    className={`p-3 rounded-xl text-left border transition-all relative ${
                      isSelected
                        ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20 text-blue-900'
                        : 'bg-stone-50 hover:bg-stone-100/80 border-stone-200 text-stone-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                        {preset.badge}
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 font-bold" />}
                    </div>
                    <div className="font-bold text-xs line-clamp-1">{preset.title}</div>
                    <div className="text-[11px] text-stone-500 mt-1 flex items-center justify-between">
                      <span>{preset.suggestedGuests.adults + preset.suggestedGuests.kids} guests</span>
                      <span className="font-semibold text-stone-700">${preset.suggestedBudget}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Event Title & Theme */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                Event Title *
              </label>
              <input
                id="input-party-title"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Summer Kickoff BBQ Bash"
                className="w-full px-3.5 py-2 rounded-xl border border-stone-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm text-stone-900 font-medium placeholder:text-stone-400 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                Theme / Atmosphere
              </label>
              <input
                id="input-party-theme"
                type="text"
                value={formData.theme}
                onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                placeholder="e.g. Neon Tropical Cantina, Rustic BBQ"
                className="w-full px-3.5 py-2 rounded-xl border border-stone-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm text-stone-900 font-medium placeholder:text-stone-400 transition-all"
              />
            </div>
          </div>

          {/* Event Type Grid */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
              Party Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {EVENT_TYPE_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const isSelected = formData.eventType === opt.type;
                return (
                  <button
                    key={opt.type}
                    type="button"
                    onClick={() => setFormData({ ...formData, eventType: opt.type })}
                    className={`flex items-center space-x-2 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Budget, Guests & Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-stone-50 border border-stone-200">
            
            {/* Total Budget */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1 flex items-center justify-between">
                <span>Target Budget</span>
                <span className="text-[11px] text-blue-700 font-bold">CymbalMart Prices</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 font-bold text-sm">
                  {formData.currency || '$'}
                </span>
                <input
                  id="input-party-budget"
                  type="number"
                  min="20"
                  max="10000"
                  step="10"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) || 100 })}
                  className="w-full pl-7 pr-3 py-2 rounded-xl border border-stone-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm text-stone-900 font-bold bg-white"
                />
              </div>
              <p className="text-[10px] text-stone-500 mt-1">
                ~${(formData.budget / Math.max(1, formData.guestCount.total)).toFixed(0)} per attendee
              </p>
            </div>

            {/* Guest Count (Adults & Kids) */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                Guest Count ({formData.guestCount.total} Total)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="text-[10px] text-stone-500 mb-0.5">Adults (18+)</div>
                  <input
                    id="input-party-adults"
                    type="number"
                    min="1"
                    value={formData.guestCount.adults}
                    onChange={(e) => handleAdultChange(parseInt(e.target.value) || 1)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 text-xs font-bold text-stone-900 bg-white"
                  />
                </div>
                <div>
                  <div className="text-[10px] text-stone-500 mb-0.5">Kids (0-17)</div>
                  <input
                    id="input-party-kids"
                    type="number"
                    min="0"
                    value={formData.guestCount.kids}
                    onChange={(e) => handleKidsChange(parseInt(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 text-xs font-bold text-stone-900 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                Duration & Venue
              </label>
              <div className="space-y-1.5">
                <select
                  value={formData.durationHours}
                  onChange={(e) => setFormData({ ...formData, durationHours: Number(e.target.value) })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 text-xs font-medium text-stone-900 bg-white"
                >
                  <option value={2}>2 Hours (Light Gathering)</option>
                  <option value={3}>3 Hours (Standard Party)</option>
                  <option value={4}>4 Hours (Full Celebration)</option>
                  <option value={5}>5 Hours (Extended Cookout)</option>
                  <option value={6}>6+ Hours (All-Day Event)</option>
                </select>

                <select
                  value={formData.venue}
                  onChange={(e) => setFormData({ ...formData, venue: e.target.value as VenueType })}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 text-xs font-medium text-stone-900 bg-white"
                >
                  {VENUE_OPTIONS.map((v) => (
                    <option key={v.venue} value={v.venue}>{v.label}</option>
                  ))}
                </select>
              </div>
            </div>

          </div>

          {/* Special Requests & Host Constraints */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1 flex items-center justify-between">
              <span className="flex items-center space-x-1.5">
                <FileText className="w-3.5 h-3.5 text-amber-600" />
                <span>Special Requests & Host Constraints</span>
              </span>
              <span className="text-[11px] text-stone-500 font-normal">Custom instructions for agent</span>
            </label>
            <textarea
              id="input-special-requests"
              rows={2}
              value={formData.specialRequests || ''}
              onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
              placeholder="e.g. Include non-alcoholic mocktail options, outdoor grill only (no oven), low-mess finger foods for kids, or emphasize Cymbal Select store brand savings."
              className="w-full px-3.5 py-2 rounded-xl border border-stone-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-xs text-stone-900 font-medium placeholder:text-stone-400 transition-all resize-none"
            />
          </div>

          {/* Dietary Restrictions */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
              Dietary & Allergen Accommodations
            </label>
            <div className="flex flex-wrap gap-2">
              {DIETARY_OPTIONS.map((diet) => {
                const isSelected = formData.dietary.includes(diet);
                return (
                  <button
                    key={diet}
                    type="button"
                    onClick={() => toggleDietary(diet)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {diet}
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-stone-50 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-100 font-semibold text-xs transition-colors"
          >
            Cancel
          </button>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <button
              type="button"
              id="btn-save-profile-only"
              onClick={() => handleSubmit(false)}
              className="flex-1 sm:flex-initial px-4 py-2 rounded-xl border border-stone-300 bg-white hover:bg-stone-100 text-stone-800 font-semibold text-xs transition-all"
            >
              Update Settings Only
            </button>

            <button
              type="button"
              id="btn-generate-ai-plan"
              disabled={isGenerating}
              onClick={() => handleSubmit(true)}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center space-x-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50 active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-amber-300 animate-spin-slow" />
              <span>{isGenerating ? 'Curating CymbalMart List...' : 'Curate CymbalMart Plan'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
