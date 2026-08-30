import React from 'react';
import { 
  Clock, 
  Calendar, 
  Sparkles, 
  Utensils, 
  Wine, 
  Lightbulb, 
  Store, 
  CheckCircle,
  ChefHat
} from 'lucide-react';
import { PartyPlan, ShoppingTimelineStep, PartyRecipe } from '../types';

interface PartyTimelineViewProps {
  plan: PartyPlan;
  onOpenAddItem: () => void;
}

export const PartyTimelineView: React.FC<PartyTimelineViewProps> = ({
  plan,
  onOpenAddItem,
}) => {
  const timeline = plan.timeline || [];
  const recipes = plan.recipesAndDrinks || [];
  const budgetTips = plan.budgetTips || [];

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-stone-900 to-stone-800 text-white rounded-2xl p-4 sm:p-6 shadow-md">
        <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
          <Clock className="w-4 h-4" />
          <span>Shopping Execution & Hosting Plan</span>
        </div>
        <h2 className="text-lg sm:text-xl font-bold font-display text-white">
          Event Countdown & Recipe Guide
        </h2>
        <p className="text-xs sm:text-sm text-stone-300 max-w-xl mt-1">
          A timed schedule for store runs so nothing spoils before the party, plus signature recipes and money-saving hacks.
        </p>
      </div>

      {/* 1. Countdown Shopping Timeline */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-amber-600" />
          <h3 className="font-display font-bold text-stone-900 text-base">
            Shopping Run Timeline
          </h3>
        </div>

        <div className="space-y-4 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-stone-200">
          {timeline.map((step, idx) => (
            <div key={idx} className="relative flex items-start space-x-4">
              
              {/* Timeline Marker Dot */}
              <div className="w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs z-10">
                {idx + 1}
              </div>

              {/* Step Card */}
              <div className="flex-1 bg-stone-50 p-4 rounded-xl border border-stone-200/80 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-700 font-mono">
                    {step.timeFrame}
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {step.recommendedStores.map((st, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white border border-stone-200 text-stone-700"
                      >
                        {st}
                      </span>
                    ))}
                  </div>
                </div>

                <h4 className="font-bold text-stone-900 text-sm">{step.label}</h4>
                <p className="text-xs text-stone-600">{step.action}</p>

                {step.keyItems && step.keyItems.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
                    <span className="text-stone-400 font-semibold text-[11px]">Key Focus:</span>
                    {step.keyItems.map((ki, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md bg-amber-100/70 text-amber-900 text-[11px] font-medium">
                        {ki}
                      </span>
                    ))}
                  </div>
                )}
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* 2. Signature Recipes & Cocktails */}
      {recipes.length > 0 && (
        <div className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center space-x-2">
            <ChefHat className="w-4 h-4 text-amber-600" />
            <h3 className="font-display font-bold text-stone-900 text-base">
              Signature Party Recipes & Batching Guide
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recipes.map((rec, idx) => (
              <div
                key={idx}
                className="bg-stone-50 rounded-xl border border-stone-200 p-4 space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-2 py-0.5 rounded-sm">
                      {rec.type === 'drink' ? '🍹 Signature Beverage' : '🍴 Featured Dish'}
                    </span>
                    <span className="text-xs text-stone-500 font-medium font-mono">
                      Prep: {rec.prepTime} • Serves {rec.servesCount}
                    </span>
                  </div>

                  <h4 className="font-bold text-stone-900 text-sm sm:text-base mt-2">
                    {rec.name}
                  </h4>

                  <div className="mt-2 text-xs space-y-2">
                    <div>
                      <strong className="text-stone-700 block mb-1">Key Ingredients:</strong>
                      <ul className="list-disc list-inside text-stone-600 space-y-0.5">
                        {rec.ingredients.map((ing, i) => (
                          <li key={i}>{ing}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-1">
                      <strong className="text-stone-700 block mb-1">Prep & Batching:</strong>
                      <p className="text-stone-600 leading-relaxed bg-white p-2.5 rounded-lg border border-stone-200/80">
                        {rec.instructions}
                      </p>
                    </div>
                  </div>
                </div>

                {rec.pairings && (
                  <div className="text-[11px] text-stone-500 italic pt-2 border-t border-stone-200/70">
                    🥂 <strong className="not-italic text-stone-700">Pairing:</strong> {rec.pairings}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Budget Hacks & Tips */}
      {budgetTips.length > 0 && (
        <div className="bg-amber-50/70 border border-amber-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-3">
          <div className="flex items-center space-x-2 text-amber-900">
            <Lightbulb className="w-5 h-5 text-amber-600" />
            <h3 className="font-display font-bold text-base">
              Party Host Money-Saving Hacks & Tips
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {budgetTips.map((tip, idx) => (
              <div
                key={idx}
                className="bg-white/90 p-3.5 rounded-xl border border-amber-200/80 text-xs text-amber-950 font-medium leading-relaxed shadow-2xs"
              >
                <span className="font-bold block text-amber-800 mb-1">💡 Tip #{idx + 1}</span>
                {tip}
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
