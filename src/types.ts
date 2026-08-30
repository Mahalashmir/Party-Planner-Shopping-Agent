export type EventType =
  | 'birthday'
  | 'dinner'
  | 'bbq'
  | 'cocktail'
  | 'shower'
  | 'gamenight'
  | 'holiday'
  | 'graduation'
  | 'kids'
  | 'custom';

export type VenueType =
  | 'indoor_home'
  | 'backyard'
  | 'park'
  | 'rented_venue'
  | 'beach'
  | 'office';

export type ItemCategory =
  | 'food_mains'
  | 'food_sides'
  | 'food_appetizers'
  | 'food_dessert'
  | 'beverages_alcoholic'
  | 'beverages_nonalcoholic'
  | 'tableware_disposables'
  | 'decorations'
  | 'entertainment_favors'
  | 'ice_essentials'
  | 'cleanup_hardware';

export type CymbalDepartment =
  | 'Produce & Fresh Market'
  | 'Deli & Butcher Block'
  | 'Bakery & Pastries'
  | 'Beverages & Spirits'
  | 'Party Supplies & Tableware'
  | 'Snacks & Pantry'
  | 'Frozen & Ice Bay'
  | 'Cymbal Wholesale Bulk'
  | 'Household & Cleanup';

export type StoreType =
  | 'CymbalMart Supercenter'
  | 'Cymbal Wholesale Club'
  | 'Cymbal Spirits & Wine'
  | 'Cymbal Bakery Express'
  | 'Party Store / Specialty';

export type BrandTier = 'cymbal_select' | 'cymbal_organics' | 'brand_name';
export type ItemStatus = 'to_buy' | 'in_cart' | 'purchased' | 'already_have';
export type ItemPriority = 'must_have' | 'recommended' | 'optional';

export interface ShoppingItem {
  id: string;
  name: string;
  category: ItemCategory;
  department: CymbalDepartment;
  aisleNumber?: string;
  brandTier?: BrandTier;
  quantity: number;
  unit: string;
  estimatedPrice: number;
  originalPrice?: number;
  savings?: number;
  targetStore: StoreType;
  priority: ItemPriority;
  status: ItemStatus;
  notes?: string;
  dietaryTag?: string;
  isCustom?: boolean;
}

export interface PartyProfile {
  id: string;
  title: string;
  eventType: EventType;
  theme: string;
  guestCount: {
    adults: number;
    kids: number;
    total: number;
  };
  dietary: string[];
  durationHours: number;
  budget: number;
  currency: string;
  venue: VenueType;
  vibeDescription: string;
  specialRequests?: string;
  date?: string;
  time?: string;
}

export interface PortionRule {
  title: string;
  formula: string;
  recommendedAmount: string;
  tip: string;
}

export interface ShoppingTimelineStep {
  timeFrame: string;
  label: string;
  action: string;
  recommendedStores: string[];
  keyItems: string[];
}

export interface PartyRecipe {
  name: string;
  type: 'drink' | 'food';
  servesCount: number;
  prepTime: string;
  ingredients: string[];
  instructions: string;
  pairings?: string;
}

export interface PartyPlan {
  profile: PartyProfile;
  items: ShoppingItem[];
  portionRules: PortionRule[];
  timeline: ShoppingTimelineStep[];
  recipesAndDrinks: PartyRecipe[];
  budgetTips: string[];
  agentAdvice: string;
  estimatedSavings?: number;
}

export type FulfillmentType = 'curbside_pickup' | 'express_delivery' | 'instore_run';

export interface OrderCheckoutDetails {
  orderId: string;
  fulfillmentType: FulfillmentType;
  slotTime: string;
  storeLocation: string;
  deliveryAddress?: string;
  specialInstructions?: string;
  subtotal: number;
  cymbalSavings: number;
  finalTotal: number;
  itemCount: number;
  status: 'draft' | 'confirmed';
  placedAt?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  suggestedActions?: {
    label: string;
    actionType: 'add_item' | 'apply_diet' | 'cut_budget' | 'recalculate' | 'switch_store_brand' | 'custom';
    payload?: any;
  }[];
}

export interface PartyPreset {
  id: string;
  title: string;
  eventType: EventType;
  theme: string;
  badge: string;
  description: string;
  specialRequests?: string;
  suggestedGuests: { adults: number; kids: number };
  suggestedBudget: number;
  durationHours: number;
  venue: VenueType;
  dietary: string[];
}
