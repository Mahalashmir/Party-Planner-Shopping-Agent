import React from 'react';
import { 
  Calculator, 
  Wine, 
  Snowflake, 
  Utensils, 
  Soup, 
  ShoppingBag, 
  Cake, 
  Sparkles, 
  HelpCircle,
  Clock,
  Users
} from 'lucide-react';
import { PartyProfile } from '../types';
import { calculatePortions, generatePortionRulesList } from '../utils/partyCalculations';

interface PortionRulesDrawerProps {
  profile: PartyProfile;
  onUpdateGuests: (adults: number, kids: number, hours: number) => void;
}

export const PortionRulesDrawer: React.FC<PortionRulesDrawerProps> = ({
  profile,
  onUpdateGuests,
}) => {
  const estimates = calculatePortions(profile);
  const rules = generatePortionRulesList(profile);

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-stone-900 to-stone-800 text-white rounded-2xl p-4 sm:p-6 shadow-md">
        <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
          <Calculator className="w-4 h-4" />
          <span>Catering Formulas & Portion Guide</span>
        </div>
        <h2 className="text-lg sm:text-xl font-bold font-display text-white">
          Smart Food & Drink Quantity Calculator
        </h2>
        <p className="text-xs sm:text-sm text-stone-300 max-w-xl mt-1">
          Standard culinary & catering benchmarks to eliminate party shortages and prevent costly over-buying.
        </p>

        {/* Live Controls Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-stone-700/80">
          
          {/* Adults */}
          <div className="bg-stone-800/80 p-3 rounded-xl border border-stone-700">
            <div className="flex items-center justify-between text-xs text-stone-400 mb-1">
              <span>Adult Guests</span>
              <span className="font-bold text-white font-mono">{profile.guestCount.adults}</span>
            </div>
            <input
              type="range"
              min="2"
              max="100"
              value={profile.guestCount.adults}
              onChange={(e) => onUpdateGuests(parseInt(e.target.value) || 2, profile.guestCount.kids, profile.durationHours)}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          {/* Kids */}
          <div className="bg-stone-800/80 p-3 rounded-xl border border-stone-700">
            <div className="flex items-center justify-between text-xs text-stone-400 mb-1">
              <span>Kids & Teens</span>
              <span className="font-bold text-white font-mono">{profile.guestCount.kids}</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              value={profile.guestCount.kids}
              onChange={(e) => onUpdateGuests(profile.guestCount.adults, parseInt(e.target.value) || 0, profile.durationHours)}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          {/* Party Duration */}
          <div className="bg-stone-800/80 p-3 rounded-xl border border-stone-700">
            <div className="flex items-center justify-between text-xs text-stone-400 mb-1">
              <span>Party Length</span>
              <span className="font-bold text-white font-mono">{profile.durationHours} hours</span>
            </div>
            <input
              type="range"
              min="1"
              max="8"
              step="0.5"
              value={profile.durationHours}
              onChange={(e) => onUpdateGuests(profile.guestCount.adults, profile.guestCount.kids, parseFloat(e.target.value) || 3)}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

        </div>
      </div>

      {/* Calculated Quantity Stat Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        
        {/* Total Drinks */}
        <div className="bg-white p-4 rounded-xl border border-stone-200 text-center shadow-2xs">
          <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center mx-auto mb-2">
            <Wine className="w-4 h-4" />
          </div>
          <div className="text-xl font-bold font-display text-stone-900 font-mono">
            {estimates.drinksTotal}
          </div>
          <div className="text-[11px] text-stone-500 font-semibold mt-0.5">
            Total Drinks ({estimates.alcoholicDrinks} Alc / {estimates.nonAlcoholicDrinks} Soft)
          </div>
        </div>

        {/* Ice Pounds */}
        <div className="bg-white p-4 rounded-xl border border-stone-200 text-center shadow-2xs">
          <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center mx-auto mb-2">
            <Snowflake className="w-4 h-4" />
          </div>
          <div className="text-xl font-bold font-display text-stone-900 font-mono">
            {estimates.icePounds} lbs
          </div>
          <div className="text-[11px] text-stone-500 font-semibold mt-0.5">
            Ice (~{Math.ceil(estimates.icePounds / 10)} 10lb bags)
          </div>
        </div>

        {/* Main Protein */}
        <div className="bg-white p-4 rounded-xl border border-stone-200 text-center shadow-2xs">
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center mx-auto mb-2">
            <Utensils className="w-4 h-4" />
          </div>
          <div className="text-xl font-bold font-display text-stone-900 font-mono">
            {estimates.proteinPounds} lbs
          </div>
          <div className="text-[11px] text-stone-500 font-semibold mt-0.5">
            Total Main Proteins
          </div>
        </div>

        {/* Appetizers */}
        <div className="bg-white p-4 rounded-xl border border-stone-200 text-center shadow-2xs">
          <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-700 flex items-center justify-center mx-auto mb-2">
            <Soup className="w-4 h-4" />
          </div>
          <div className="text-xl font-bold font-display text-stone-900 font-mono">
            {estimates.appetizerPieces}
          </div>
          <div className="text-[11px] text-stone-500 font-semibold mt-0.5">
            Appetizer Bites
          </div>
        </div>

        {/* Plates & Disposables */}
        <div className="bg-white p-4 rounded-xl border border-stone-200 text-center shadow-2xs">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center mx-auto mb-2">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <div className="text-xl font-bold font-display text-stone-900 font-mono">
            {estimates.platesCount}
          </div>
          <div className="text-[11px] text-stone-500 font-semibold mt-0.5">
            Plates ({estimates.cupsCount} Cups)
          </div>
        </div>

        {/* Cake / Desserts */}
        <div className="bg-white p-4 rounded-xl border border-stone-200 text-center shadow-2xs">
          <div className="w-8 h-8 rounded-lg bg-pink-50 text-pink-700 flex items-center justify-center mx-auto mb-2">
            <Cake className="w-4 h-4" />
          </div>
          <div className="text-xl font-bold font-display text-stone-900 font-mono">
            {estimates.dessertServings}
          </div>
          <div className="text-[11px] text-stone-500 font-semibold mt-0.5">
            Dessert Servings
          </div>
        </div>

      </div>

      {/* Detailed Formula Cards */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center space-x-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>Standard Catering Rulebook</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rules.map((rule, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-stone-200 p-4 shadow-xs space-y-2"
            >
              <div className="flex items-start justify-between">
                <h4 className="font-bold text-stone-900 text-sm">{rule.title}</h4>
              </div>

              <div className="text-xs text-stone-600 bg-stone-50 p-2.5 rounded-xl border border-stone-100 space-y-1">
                <div>
                  <span className="text-stone-400 font-semibold">Formula: </span>
                  <span className="font-mono text-stone-800 font-medium">{rule.formula}</span>
                </div>
                <div>
                  <span className="text-stone-400 font-semibold">Target: </span>
                  <strong className="text-amber-900">{rule.recommendedAmount}</strong>
                </div>
              </div>

              <p className="text-xs text-stone-500 italic">
                💡 <strong className="text-stone-700 not-italic">Pro Tip:</strong> {rule.tip}
              </p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
