import { PartyPreset, CymbalDepartment } from '../types';

export const PARTY_PRESETS: PartyPreset[] = [
  {
    id: 'taco-fiesta',
    title: 'CymbalMart Cantina: Taco & Marg Fiesta',
    eventType: 'dinner',
    theme: 'Vibrant Festive Mexican Street Cantina',
    badge: 'CymbalMart Top Pick',
    description: 'Build-your-own street taco bar with marinated meats, fresh guacamole, signature hibiscus palomas & bakery churro bites.',
    specialRequests: 'Include mild salsa for kids and gluten-free corn tortilla options',
    suggestedGuests: { adults: 18, kids: 4 },
    suggestedBudget: 350,
    durationHours: 4,
    venue: 'indoor_home',
    dietary: ['Vegetarian', 'Gluten-Free']
  },
  {
    id: 'bbq-cookout',
    title: 'Backyard Smoker & Craft Beer Cookout',
    eventType: 'bbq',
    theme: 'Rustic Southern BBQ & Lawn Games',
    badge: 'Butcher Block Special',
    description: 'Slow-smoked pulled pork & brisket sliders from Cymbal Butcher, mac & cheese, grilled sweet corn, craft beer bucket & lemonade.',
    specialRequests: 'Need aluminum trays for easy grill clean up and extra heavy ice bags',
    suggestedGuests: { adults: 22, kids: 6 },
    suggestedBudget: 420,
    durationHours: 5,
    venue: 'backyard',
    dietary: ['Vegetarian']
  },
  {
    id: 'milestone-birthday',
    title: 'Golden Milestone Cocktail Soirée',
    eventType: 'birthday',
    theme: 'Modern Black, Gold & Champagne Glamour',
    badge: 'VIP Soirée',
    description: 'Artisanal cheese & charcuterie board, champagne tower, passed canapés, custom Cymbal bakery cake & balloon arch.',
    specialRequests: 'Chilled prosecco, dairy-free dessert alternatives, and classy gold tableware',
    suggestedGuests: { adults: 25, kids: 0 },
    suggestedBudget: 550,
    durationHours: 4,
    venue: 'indoor_home',
    dietary: ['Gluten-Free', 'Dairy-Free']
  },
  {
    id: 'kids-superhero',
    title: 'Kids Superhero Power Adventure',
    eventType: 'kids',
    theme: 'Comic Book Cityscape & Action Fun',
    badge: 'Family & Kids Hit',
    description: 'Power punch juice station, hero badge bakery cookies, mini pretzel sliders, goodie bags, cape favors & photo booth props.',
    specialRequests: '100% nut-free snacks, leak-proof juice boxes, and biodegradable wipes',
    suggestedGuests: { adults: 12, kids: 15 },
    suggestedBudget: 300,
    durationHours: 3,
    venue: 'park',
    dietary: ['Nut-Free']
  },
  {
    id: 'wine-cheese-tapas',
    title: 'Intimate Sunset Wine & Tapas Evening',
    eventType: 'cocktail',
    theme: 'Mediterranean Warm Bistro',
    badge: 'Chic & Relaxed',
    description: 'Gourmet cheese pairing, cured prosciutto, crostini spreads, organic olives, and curated red/white wine pairings.',
    specialRequests: 'Non-alcoholic sparkling grape elixir for non-drinkers and crusty baguettes',
    suggestedGuests: { adults: 12, kids: 0 },
    suggestedBudget: 280,
    durationHours: 3.5,
    venue: 'indoor_home',
    dietary: ['Vegetarian']
  },
  {
    id: 'cozy-gamenight',
    title: 'Epic Board Game & Gourmet Pizza Night',
    eventType: 'gamenight',
    theme: 'Casual Cozy Tavern & Pixel Lounge',
    badge: 'Budget Friendly',
    description: 'Artisan sheet-pan pizza dough & gourmet toppings, spicy buffalo dips, craft sodas, popcorn bar & sweet treats.',
    specialRequests: 'Finger food only (no sticky sauces on game boards) and vegan cheese option',
    suggestedGuests: { adults: 10, kids: 2 },
    suggestedBudget: 180,
    durationHours: 4,
    venue: 'indoor_home',
    dietary: ['Vegetarian']
  }
];

export const CATEGORY_METADATA: Record<string, { label: string; iconName: string; color: string; bg: string }> = {
  food_mains: { label: 'Main Dishes & Proteins', iconName: 'Utensils', color: 'text-amber-700', bg: 'bg-amber-50' },
  food_sides: { label: 'Sides & Fresh Salads', iconName: 'Salad', color: 'text-emerald-700', bg: 'bg-emerald-50' },
  food_appetizers: { label: 'Appetizers & Finger Food', iconName: 'Soup', color: 'text-orange-700', bg: 'bg-orange-50' },
  food_dessert: { label: 'Bakery Desserts & Sweets', iconName: 'Cake', color: 'text-pink-700', bg: 'bg-pink-50' },
  beverages_alcoholic: { label: 'Beer, Wine & Spirits', iconName: 'Wine', color: 'text-purple-700', bg: 'bg-purple-50' },
  beverages_nonalcoholic: { label: 'Sodas, Juices & Mixers', iconName: 'CupSoda', color: 'text-cyan-700', bg: 'bg-cyan-50' },
  tableware_disposables: { label: 'Plates, Cups & Cutlery', iconName: 'ShoppingBag', color: 'text-blue-700', bg: 'bg-blue-50' },
  decorations: { label: 'Decorations & Atmosphere', iconName: 'Sparkles', color: 'text-yellow-700', bg: 'bg-yellow-50' },
  entertainment_favors: { label: 'Games, Favors & Props', iconName: 'PartyPopper', color: 'text-indigo-700', bg: 'bg-indigo-50' },
  ice_essentials: { label: 'Ice Bay & Coolers', iconName: 'Snowflake', color: 'text-sky-700', bg: 'bg-sky-50' },
  cleanup_hardware: { label: 'Cleanup & Trash Bags', iconName: 'Trash2', color: 'text-stone-700', bg: 'bg-stone-100' }
};

export const DEPARTMENT_METADATA: Record<CymbalDepartment, { aisle: string; color: string; bg: string }> = {
  'Produce & Fresh Market': { aisle: 'Aisle 1-3 • Fresh Market', color: 'text-emerald-800', bg: 'bg-emerald-50 border-emerald-200' },
  'Deli & Butcher Block': { aisle: 'Back Counter • Meat & Deli', color: 'text-amber-800', bg: 'bg-amber-50 border-amber-200' },
  'Bakery & Pastries': { aisle: 'Aisle 4 • Fresh Bakery', color: 'text-pink-800', bg: 'bg-pink-50 border-pink-200' },
  'Beverages & Spirits': { aisle: 'Aisle 12-14 • Beverage Station', color: 'text-purple-800', bg: 'bg-purple-50 border-purple-200' },
  'Party Supplies & Tableware': { aisle: 'Aisle 18 • Party & Seasonal', color: 'text-indigo-800', bg: 'bg-indigo-50 border-indigo-200' },
  'Snacks & Pantry': { aisle: 'Aisle 7-9 • Grocery & Dips', color: 'text-orange-800', bg: 'bg-orange-50 border-orange-200' },
  'Frozen & Ice Bay': { aisle: 'Aisle 16 • Frozen / Front Ice', color: 'text-sky-800', bg: 'bg-sky-50 border-sky-200' },
  'Cymbal Wholesale Bulk': { aisle: 'Bulk Depot • Back Pallets', color: 'text-rose-800', bg: 'bg-rose-50 border-rose-200' },
  'Household & Cleanup': { aisle: 'Aisle 20 • Home Essentials', color: 'text-stone-800', bg: 'bg-stone-50 border-stone-200' }
};

export const STORE_BADGES: Record<string, { label: string; color: string }> = {
  'CymbalMart Supercenter': { label: 'CymbalMart Supercenter', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  'Cymbal Wholesale Club': { label: 'Cymbal Wholesale (Bulk Value)', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  'Cymbal Spirits & Wine': { label: 'Cymbal Spirits & Beverage Bay', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  'Cymbal Bakery Express': { label: 'Cymbal Artisan Bakery', color: 'bg-pink-50 text-pink-700 border-pink-200' },
  'Party Store / Specialty': { label: 'Cymbal Seasonal & Party Aisle', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  'Costco / Wholesale': { label: 'Bulk Wholesale (Best Value)', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  'Supermarket / Grocery': { label: 'CymbalMart Grocery', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  'Liquor Store': { label: 'Cymbal Spirits', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  'Party Store / Amazon': { label: 'Party & Decor Aisle', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  'Bakery / Specialty': { label: 'Bakery & Deli Counter', color: 'bg-pink-50 text-pink-700 border-pink-200' },
  'Target / Dollar Store': { label: 'General & Tableware', color: 'bg-stone-50 text-stone-700 border-stone-200' },
  'Hardware / Rental': { label: 'Equipment & Hardware', color: 'bg-stone-50 text-stone-700 border-stone-200' }
};

export const BRAND_TIERS = {
  cymbal_select: {
    label: 'Cymbal Select',
    tag: 'Store Brand (-25%)',
    bg: 'bg-blue-100 text-blue-800 border-blue-300',
    description: 'High-quality CymbalMart value brand'
  },
  cymbal_organics: {
    label: 'Cymbal Organics',
    tag: '100% Organic',
    bg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    description: 'Certified organic, sustainably sourced'
  },
  brand_name: {
    label: 'National Brand',
    tag: 'Premium Brand',
    bg: 'bg-stone-100 text-stone-700 border-stone-300',
    description: 'Standard brand name product'
  }
};
