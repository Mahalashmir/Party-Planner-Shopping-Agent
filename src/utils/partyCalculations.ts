import { PartyProfile, PortionRule } from '../types';

export interface CalculatedEstimates {
  totalGuests: number;
  drinksTotal: number;
  alcoholicDrinks: number;
  nonAlcoholicDrinks: number;
  icePounds: number;
  proteinPounds: number;
  appetizerPieces: number;
  sideServings: number;
  dessertServings: number;
  platesCount: number;
  cupsCount: number;
  napkinsCount: number;
}

/**
 * Standard catering formulas:
 * - Drinks: 2 drinks first hour + 1 drink each subsequent hour per drinking adult.
 * - Non-alcoholic: 1 drink every 1.5 hours per person + extra for kids.
 * - Ice: ~1.5 lbs per guest (1 lb for drinks + 0.5 lb for cooler chilling).
 * - Meat/Protein: ~0.5 lb (8 oz) raw meat/protein per adult (6 oz for kids).
 * - Appetizers: 4-6 pieces per person if dinner follows; 8-12 if heavy finger food reception.
 * - Tableware: 1.5 plates, 2.5 cups, 3 napkins per guest.
 */
export function calculatePortions(profile: PartyProfile): CalculatedEstimates {
  const adults = profile.guestCount.adults || 0;
  const kids = profile.guestCount.kids || 0;
  const total = adults + kids;
  const hours = profile.durationHours || 3;

  const isCocktailOnly = profile.eventType === 'cocktail';
  const isBbq = profile.eventType === 'bbq';

  // Drink calculations
  const drinksPerAdult = Math.max(1, 2 + (hours - 1) * 1);
  const alcoholicDrinks = profile.eventType === 'kids' ? 0 : Math.round(adults * drinksPerAdult * 0.7);
  const nonAlcoholicDrinks = Math.round((adults * drinksPerAdult * 0.3) + (kids * hours * 1.2));
  const drinksTotal = alcoholicDrinks + nonAlcoholicDrinks;

  // Ice calculations: 1.25 lbs per guest + warm weather/cooler bonus
  const icePounds = Math.ceil(total * (profile.venue === 'backyard' || profile.venue === 'park' ? 2.0 : 1.5));

  // Protein / Meat calculations (lbs)
  const proteinMultiplier = isBbq ? 0.65 : 0.5;
  const proteinPounds = Math.round((adults * proteinMultiplier + kids * 0.3) * 10) / 10;

  // Appetizers
  const appPiecesPerPerson = isCocktailOnly ? 10 : 5;
  const appetizerPieces = Math.round(total * appPiecesPerPerson);

  // Sides & salads servings
  const sideServings = Math.round(total * (isBbq ? 2.5 : 1.8));

  // Desserts
  const dessertServings = Math.round(total * 1.2);

  // Tableware buffer
  const platesCount = Math.ceil(total * (isCocktailOnly ? 2.5 : 1.75));
  const cupsCount = Math.ceil(total * 2.5);
  const napkinsCount = Math.ceil(total * 3.5);

  return {
    totalGuests: total,
    drinksTotal,
    alcoholicDrinks,
    nonAlcoholicDrinks,
    icePounds,
    proteinPounds,
    appetizerPieces,
    sideServings,
    dessertServings,
    platesCount,
    cupsCount,
    napkinsCount,
  };
}

export function generatePortionRulesList(profile: PartyProfile): PortionRule[] {
  const estimates = calculatePortions(profile);
  const hours = profile.durationHours || 3;

  return [
    {
      title: 'Beverages & Bar Supply',
      formula: `2 drinks in Hr 1 + 1 drink/hr after × ${profile.guestCount.adults} adults over ${hours} hrs`,
      recommendedAmount: `${estimates.drinksTotal} drinks total (~${Math.ceil(estimates.alcoholicDrinks / 5)} wine bottles or ${estimates.alcoholicDrinks} beers/seltzers + ${estimates.nonAlcoholicDrinks} non-alcoholic beverages)`,
      tip: 'Provide 1 bottle of wine per 2.5 wine drinkers (yields 5 glasses/bottle) and 1 case of craft beer/seltzers per 6-8 guests.'
    },
    {
      title: 'Ice & Beverage Chilling',
      formula: `1.5 - 2.0 lbs per guest (includes drink ice + cooler bucket chill)`,
      recommendedAmount: `${estimates.icePounds} lbs of ice (~${Math.ceil(estimates.icePounds / 10)} standard 10 lb bags)`,
      tip: 'Keep 1 dedicated clean bag in a sealed ice bucket with tongs purely for drinking glasses, and the rest in coolers.'
    },
    {
      title: 'Proteins & Main Course',
      formula: `8 oz raw protein per adult (6 oz for kids) + side buffers`,
      recommendedAmount: `${estimates.proteinPounds} lbs total main protein (beef/poultry/fish/tofu)`,
      tip: 'When cooking sliders or burgers, calculate 2 sliders per person or 1.25 full quarter-pound burgers per guest.'
    },
    {
      title: 'Appetizers & Finger Bites',
      formula: profile.eventType === 'cocktail' ? '10-12 pieces/guest (cocktail reception)' : '4-6 pieces/guest before main course',
      recommendedAmount: `${estimates.appetizerPieces} total pieces / servings`,
      tip: 'Select 3 to 4 distinct appetizer varieties (e.g. 1 warm pastry/crostini, 1 fresh dip/veg board, 1 skewered protein).'
    },
    {
      title: 'Disposables & Tableware Buffer',
      formula: `1.75 plates, 2.5 cups, 3.5 napkins per guest`,
      recommendedAmount: `${estimates.platesCount} plates, ${estimates.cupsCount} cups, ${estimates.napkinsCount} napkins`,
      tip: 'Always keep 1 extra box of 50 multi-purpose cocktail napkins and 3 heavy-duty contractor trash bags ready.'
    }
  ];
}
