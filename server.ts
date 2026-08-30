import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy Google Gen AI helper
let genAiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!genAiClient && process.env.GEMINI_API_KEY) {
    genAiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return genAiClient;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// Endpoint: Generate Full Party Plan & Shopping List for CymbalMart
app.post('/api/party/generate-plan', async (req, res) => {
  try {
    const { profile } = req.body;
    if (!profile) {
      return res.status(400).json({ error: 'Party profile is required' });
    }

    const ai = getGenAI();
    const prompt = `You are the CymbalMart AI Party Planning & Catering Shopping Agent.
Your job is to convert a busy host's party intent into a meticulously curated, budget-conscious CymbalMart shopping list mapped to store departments and aisles.

Event Title: "${profile.title}"
Type: ${profile.eventType}
Theme & Vibe: ${profile.theme} - ${profile.vibeDescription || 'Festive celebration'}
Special Requests / Constraints: ${profile.specialRequests || 'None specified'}
Guests: ${profile.guestCount.adults} Adults, ${profile.guestCount.kids} Kids (Total: ${profile.guestCount.total})
Dietary Restrictions: ${profile.dietary && profile.dietary.length > 0 ? profile.dietary.join(', ') : 'None specified'}
Duration: ${profile.durationHours} hours
Venue: ${profile.venue}
Target Budget: ${profile.currency || '$'}${profile.budget}

Return a valid JSON object matching this structure:
{
  "items": [
    {
      "name": "Specific item name (e.g., 'Cymbal Select Marinated Carne Asada Chuck', 'Cymbal Fresh Guacamole & Pico Kit', 'Cymbal Select Brioche Slider Buns', 'Cymbal Party 9-inch Heavyweight Compostable Plates')",
      "category": "food_mains" | "food_sides" | "food_appetizers" | "food_dessert" | "beverages_alcoholic" | "beverages_nonalcoholic" | "tableware_disposables" | "decorations" | "entertainment_favors" | "ice_essentials" | "cleanup_hardware",
      "department": "Produce & Fresh Market" | "Deli & Butcher Block" | "Bakery & Pastries" | "Beverages & Spirits" | "Party Supplies & Tableware" | "Snacks & Pantry" | "Frozen & Ice Bay" | "Cymbal Wholesale Bulk" | "Household & Cleanup",
      "aisleNumber": "e.g. Aisle 1-3, Aisle 4, Aisle 12, Meat Counter, Front Bay",
      "brandTier": "cymbal_select" | "cymbal_organics" | "brand_name",
      "quantity": number,
      "unit": "lbs" | "packs" | "bottles" | "cans" | "bags" | "boxes" | "items" | "trays",
      "estimatedPrice": number (in dollars, realistic total for this quantity),
      "originalPrice": number (if Cymbal Select/Organics, list the national brand equivalent price ~25-30% higher),
      "savings": number (originalPrice - estimatedPrice),
      "targetStore": "CymbalMart Supercenter" | "Cymbal Wholesale Club" | "Cymbal Spirits & Wine" | "Cymbal Bakery Express" | "Party Store / Specialty",
      "priority": "must_have" | "recommended" | "optional",
      "notes": "Exact portion rationale or host prep tip (e.g. '1.5 sliders per attendee', 'Buy chilled morning-of')",
      "dietaryTag": "Vegetarian" | "Gluten-Free" | "Vegan" | "Nut-Free" | "Dairy-Free" | "All" | ""
    }
  ],
  "timeline": [
    {
      "timeFrame": "T-5 Days (Order & Non-Perishables)",
      "label": "Party Tableware & Non-Perishables",
      "action": "Place CymbalMart pickup or delivery order for tableware, games, favors, and canned beverages.",
      "recommendedStores": ["CymbalMart Supercenter"],
      "keyItems": ["Plates", "Cups", "Napkins", "Decorations"]
    },
    {
      "timeFrame": "T-2 Days (Butcher & Bulk Pantry)",
      "label": "Meats, Pantry & Beverage Run",
      "action": "Stock up on marinated meats, bulk sodas, wine/beer, dry snacks, and chips from Cymbal Butcher & Pantry.",
      "recommendedStores": ["Cymbal Wholesale Club", "Cymbal Spirits & Wine"],
      "keyItems": ["Proteins", "Craft Sodas", "Wines", "Tortilla Chips"]
    },
    {
      "timeFrame": "Day Of (Fresh Bakery, Produce & Ice)",
      "label": "Bakery Pick-up & Ice Loading",
      "action": "Grab pre-ordered custom cake, fresh cilantro/limes, and 20lbs of party ice from Cymbal Ice Bay 2 hours before kickoff.",
      "recommendedStores": ["Cymbal Bakery Express", "CymbalMart Supercenter"],
      "keyItems": ["Ice Bags", "Fresh Cake", "Fresh Guacamole", "Herbs"]
    }
  ],
  "recipesAndDrinks": [
    {
      "name": "Signature Drink or Dish Name",
      "type": "drink" | "food",
      "servesCount": number,
      "prepTime": "15 mins",
      "ingredients": ["List of key CymbalMart items"],
      "instructions": "Step-by-step batching instructions for the host",
      "pairings": "What this pairs well with"
    }
  ],
  "budgetTips": [
    "Cymbal Select store-brand swap saving tip",
    "Smart bulk portioning benchmark tip",
    "Zero-waste host planning tip"
  ],
  "agentAdvice": "A 2-3 sentence strategic briefing from the CymbalMart Shopping Agent on orchestrating this event smoothly within budget.",
  "estimatedSavings": number (sum of savings from choosing Cymbal Select/Organics vs national brands)
}

Generate 20 to 30 well-balanced items across all required departments, specifically prioritizing Cymbal Select and Cymbal Organics private-label items to keep the total close to the host's target budget of $${profile.budget}. Honor any special requests (${profile.specialRequests || 'none'}).`;

    if (ai) {
      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.6,
        },
      });

      const text = response.text || '{}';
      try {
        const parsed = JSON.parse(text);
        return res.json(parsed);
      } catch (parseErr) {
        console.error('Error parsing Gemini JSON response, extracting block:', parseErr);
        const match = text.match(/\{[\s\S]*\}/);
        if (match) {
          const fallbackParsed = JSON.parse(match[0]);
          return res.json(fallbackParsed);
        }
      }
    }

    // Fallback if no AI response or API key missing
    return res.json(generateSmartFallbackPlan(profile));
  } catch (err: any) {
    console.error('Error in /api/party/generate-plan:', err);
    res.status(500).json({
      error: err.message || 'Failed to generate party plan',
      fallback: generateSmartFallbackPlan(req.body.profile),
    });
  }
});

// Endpoint: Conversational CymbalMart Assistant for Customer Interaction
const handleChatRequest = async (req: express.Request, res: express.Response) => {
  try {
    const { messages, userMessage, currentPlan } = req.body;
    const ai = getGenAI();

    if (!ai) {
      return res.json({
        reply: `Hi! I'm CymbalMart Assistant. For your ${currentPlan?.profile?.title || 'shopping list'}, I can help you find products across our aisles, suggest budget-friendly Cymbal Select items, calculate party portions, or check dietary needs. How can I help you today?`,
        actions: null,
      });
    }

    const conversationHistory = (messages || []).map((m: any) => `${m.role === 'user' ? 'Customer' : 'CymbalMart Assistant'}: ${m.content}`).join('\n');

    const prompt = `You are the CymbalMart Assistant, a friendly, ultra-helpful AI grocery and party shopping assistant interacting with CymbalMart customers.

Store Knowledge:
- Departments: Produce & Fresh Market (Aisles 1-3), Deli & Butcher Block (Meat Counter / Aisle 5), Bakery & Pastries (Aisle 4), Beverages & Spirits (Aisles 12-14), Party Supplies & Tableware (Aisles 18-19), Snacks & Pantry (Aisles 8-11), Frozen & Ice Bay (Front Ice Bay / Aisle 16), Cymbal Wholesale Bulk, Household & Cleanup (Aisle 20).
- Private-Label Brands:
  * Cymbal Select: 20-30% cheaper than national brands with premium quality.
  * Cymbal Organics: certified organic produce, dairy, and pantry goods.
- Services: Same-day delivery, 1-hour express curbside pickup, party platters pre-ordering, ice bag loading at pickup.

Customer & Event Context:
Event/Theme: ${currentPlan?.profile?.title || 'Party Shopping'} (${currentPlan?.profile?.theme || 'General'})
Guests: ${currentPlan?.profile?.guestCount?.adults || 10} Adults, ${currentPlan?.profile?.guestCount?.kids || 0} Kids (Total: ${currentPlan?.profile?.guestCount?.total || 10})
Target Budget: $${currentPlan?.profile?.budget || 200}
Dietary Restrictions: ${currentPlan?.profile?.dietary && currentPlan?.profile?.dietary.length > 0 ? currentPlan?.profile?.dietary.join(', ') : 'None'}
Special Requests: ${currentPlan?.profile?.specialRequests || 'None'}
Current Cart Item Count: ${currentPlan?.items?.length || 0} items

Conversation History:
${conversationHistory}

Customer Message: "${userMessage}"

Guidelines:
1. Warmly greet and answer the customer clearly, concisely, and knowledgeably as "CymbalMart Assistant".
2. Offer helpful department locations, private-label savings tips, exact portion guidelines (e.g. 1.5 lbs ice/person, 3-4 tacos/person, 2 drinks/person/hour), or recipes.
3. If the customer asks to add, recommend, or adjust items for their cart/list, provide a structured actionable JSON block in \`\`\`json-actions ... \`\`\` so the customer can add them with 1 click:
\`\`\`json-actions
{
  "addItems": [
    {
      "name": "Cymbal Select Sparkling Lime Seltzer (24-pack)",
      "category": "beverages_nonalcoholic",
      "department": "Beverages & Spirits",
      "aisleNumber": "Aisle 12",
      "brandTier": "cymbal_select",
      "quantity": 1,
      "unit": "packs",
      "estimatedPrice": 8,
      "originalPrice": 11,
      "savings": 3,
      "targetStore": "CymbalMart Supercenter",
      "priority": "recommended",
      "notes": "Crisp zero-sugar mixer & refreshment"
    }
  ]
}
\`\`\``;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        temperature: 0.7,
      },
    });

    const replyText = response.text || "I'm here to help you find the best groceries and party essentials at CymbalMart!";
    
    let actions = null;
    const actionMatch = replyText.match(/```json-actions\s*([\s\S]*?)\s*```/);
    if (actionMatch) {
      try {
        actions = JSON.parse(actionMatch[1]);
      } catch (e) {
        console.error('Failed to parse json-actions:', e);
      }
    }

    const cleanReply = replyText.replace(/```json-actions[\s\S]*?```/g, '').trim();

    return res.json({
      reply: cleanReply,
      actions,
    });
  } catch (err: any) {
    console.error('Error in chat endpoint:', err);
    res.status(500).json({
      reply: "Hi! I'm CymbalMart Assistant. I'm ready to help you navigate aisles, find budget-saving Cymbal Select products, and organize your shopping cart!",
      error: err.message,
    });
  }
};

app.post('/api/party/chat', handleChatRequest);
app.post('/api/chat', handleChatRequest);

// Endpoint: AI Voice Control & Hands-Free Intent Parser
app.post('/api/voice/intent', async (req, res) => {
  try {
    const { speech, currentPlan, currentView } = req.body;
    if (!speech || typeof speech !== 'string') {
      return res.status(400).json({ error: 'Speech text is required' });
    }

    const ai = getGenAI();
    if (!ai) {
      // Fallback intent parser when Gemini API key is not present
      const lower = speech.toLowerCase();
      if (lower.includes('checkout') || lower.includes('buy now') || lower.includes('pay')) {
        return res.json({
          intent: 'PROCEED_CHECKOUT',
          spokenResponse: 'Opening CymbalMart checkout now. You can choose curbside pickup or same-day delivery.',
          actionPayload: { openCheckout: true },
        });
      }
      if (lower.includes('shopping mode') || lower.includes('in-store') || lower.includes('aisle')) {
        return res.json({
          intent: 'SWITCH_VIEW',
          spokenResponse: 'Switched to in-store shopping checklist sorted by aisles.',
          actionPayload: { targetView: 'shopping_mode' },
        });
      }
      if (lower.includes('list') || lower.includes('dashboard') || lower.includes('cart')) {
        return res.json({
          intent: 'SWITCH_VIEW',
          spokenResponse: 'Returning to your main shopping dashboard.',
          actionPayload: { targetView: 'dashboard' },
        });
      }
      if (lower.includes('budget') || lower.includes('how much') || lower.includes('total')) {
        const total = currentPlan?.items?.reduce((acc: number, i: any) => acc + (i.estimatedPrice || 0), 0) || 0;
        const target = currentPlan?.profile?.budget || 200;
        return res.json({
          intent: 'CHECK_BUDGET',
          spokenResponse: `Your current cart total is $${total} out of your $${target} budget.`,
          actionPayload: { total, target },
        });
      }
      if (lower.includes('save') || lower.includes('cymbal select') || lower.includes('store brand')) {
        return res.json({
          intent: 'SWAP_STORE_BRAND',
          spokenResponse: 'Converting eligible items to Cymbal Select to maximize your store brand savings.',
          actionPayload: { applyStoreBrand: true },
        });
      }
      if (lower.includes('add') || lower.includes('need') || lower.includes('buy')) {
        return res.json({
          intent: 'ADD_ITEM',
          spokenResponse: `Added to your CymbalMart cart.`,
          actionPayload: {
            item: {
              name: speech.replace(/add|need|buy|to my list|to cart/gi, '').trim() || 'Cymbal Select Grocery Item',
              quantity: 1,
              unit: 'items',
              estimatedPrice: 8,
              department: 'Snacks & Pantry',
              aisleNumber: 'Aisle 8',
              brandTier: 'cymbal_select',
              priority: 'recommended',
            },
          },
        });
      }

      return res.json({
        intent: 'GENERAL_ASSIST',
        spokenResponse: `I heard: "${speech}". You can say "add ice", "go to checkout", "switch to shopping mode", or "how much is my budget?".`,
        actionPayload: null,
      });
    }

    const itemsSummary = (currentPlan?.items || [])
      .slice(0, 25)
      .map((it: any) => `${it.id}: "${it.name}" (Qty: ${it.quantity} ${it.unit}, $${it.estimatedPrice}, Dept: ${it.department}, Status: ${it.status})`)
      .join('\n');

    const prompt = `You are the Voice Control Engine for CymbalMart Shopping Agent.
A customer is speaking voice commands hands-free to control their entire shopping and party planning journey.

Current State:
- View: "${currentView || 'dashboard'}"
- Event: "${currentPlan?.profile?.title || 'Party'}"
- Budget: $${currentPlan?.profile?.budget || 200}
- Guests: ${currentPlan?.profile?.guestCount?.adults || 10} Adults, ${currentPlan?.profile?.guestCount?.kids || 0} Kids
- Items in cart (${currentPlan?.items?.length || 0}):
${itemsSummary}

Customer Voice Input: "${speech}"

Analyze the customer's intent and choose the exact action. Output a valid JSON response:
{
  "intent": "ADD_ITEMS" | "REMOVE_ITEM" | "UPDATE_QUANTITY" | "CHECK_OFF_ITEM" | "UPDATE_PLAN_PROFILE" | "SWAP_STORE_BRAND" | "AUTO_ALIGN_BUDGET" | "SWITCH_VIEW" | "OPEN_MODAL" | "PROCEED_CHECKOUT" | "CHECK_BUDGET" | "GENERAL_ASSIST",
  "spokenResponse": "Concise, friendly 1-2 sentence spoken confirmation for text-to-speech audio feedback to the customer",
  "actionPayload": {
    // For ADD_ITEMS:
    "itemsToAdd": [
      {
        "name": "string (e.g. Cymbal Select Party Ice 10lb)",
        "quantity": number,
        "unit": "string",
        "estimatedPrice": number,
        "department": "Produce & Fresh Market" | "Deli & Butcher Block" | "Bakery & Pastries" | "Beverages & Spirits" | "Party Supplies & Tableware" | "Snacks & Pantry" | "Frozen & Ice Bay" | "Cymbal Wholesale Bulk" | "Household & Cleanup",
        "aisleNumber": "string",
        "brandTier": "cymbal_select" | "cymbal_organics" | "brand_name",
        "priority": "must_have" | "recommended" | "optional",
        "notes": "string"
      }
    ],
    // For REMOVE_ITEM:
    "targetItemName": "string",
    "targetItemId": "string or null",
    // For UPDATE_QUANTITY:
    "targetItemName": "string",
    "targetItemId": "string or null",
    "newQuantity": number,
    // For CHECK_OFF_ITEM:
    "targetItemName": "string",
    "targetItemId": "string or null",
    "newStatus": "in_cart" | "purchased" | "to_buy" | "already_have",
    // For UPDATE_PLAN_PROFILE:
    "profileUpdates": {
      "title": "string (optional)",
      "theme": "string (optional)",
      "budget": number (optional),
      "guestAdults": number (optional),
      "guestKids": number (optional)
    },
    // For SWITCH_VIEW:
    "targetView": "dashboard" | "shopping_mode" | "timeline",
    // For OPEN_MODAL:
    "targetModal": "checkout" | "setup" | "add_item" | "export" | "portions" | "chat",
    // For PROCEED_CHECKOUT:
    "fulfillmentMethod": "curbside" | "delivery" | "in_store" (optional),
    "completeOrder": boolean (optional)
  }
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (err: any) {
    console.error('Error in /api/voice/intent:', err);
    res.status(500).json({
      intent: 'GENERAL_ASSIST',
      spokenResponse: "I'm listening! You can say 'add 3 bags of ice', 'show my budget', or 'go to checkout'.",
      actionPayload: null,
      error: err.message,
    });
  }
});

// Endpoint: AI Item Substitution & Cymbal Select Brand Swapper
app.post('/api/party/item-substitute', async (req, res) => {
  try {
    const { item, goal, profile } = req.body;
    const ai = getGenAI();

    if (!ai) {
      return res.json({
        suggestions: [
          {
            name: `Cymbal Select ${item.name}`,
            quantity: item.quantity,
            unit: item.unit,
            estimatedPrice: Math.max(1, Math.round(item.estimatedPrice * 0.75)),
            store: 'CymbalMart Supercenter',
            department: item.department || 'Produce & Fresh Market',
            reason: 'Switch to Cymbal Select private label brand to instantly save 25% with identical quality.'
          },
          {
            name: `Cymbal Bulk Pack ${item.name}`,
            quantity: Math.max(1, Math.round(item.quantity * 1.5)),
            unit: item.unit,
            estimatedPrice: Math.round(item.estimatedPrice * 1.1),
            store: 'Cymbal Wholesale Club',
            department: 'Cymbal Wholesale Bulk',
            reason: 'Wholesale bulk bundle gives 50% more volume for only 10% extra cost.'
          }
        ]
      });
    }

    const prompt = `You are the CymbalMart Smart Substitution Engine.
Given this item:
Item: ${item.name} (${item.quantity} ${item.unit}, $${item.estimatedPrice})
Category: ${item.category}
Current Department: ${item.department}
Theme: ${profile?.theme || 'Party'}
Host Goal: "${goal || 'Lower cost with Cymbal Select store brand or find dietary alternative'}"

Suggest 3 smart alternatives within CymbalMart (such as Cymbal Select store-brand swap, Cymbal Organics swap, bulk pack, or dietary replacement).
Return as a JSON array:
[
  {
    "name": "Alternative item name",
    "brandTier": "cymbal_select" | "cymbal_organics" | "brand_name",
    "quantity": number,
    "unit": "unit",
    "estimatedPrice": number,
    "store": "CymbalMart Supercenter" | "Cymbal Wholesale Club" | "Cymbal Spirits & Wine" | "Cymbal Bakery Express",
    "department": "Produce & Fresh Market" | "Deli & Butcher Block" | "Bakery & Pastries" | "Beverages & Spirits" | "Party Supplies & Tableware" | "Snacks & Pantry" | "Frozen & Ice Bay" | "Cymbal Wholesale Bulk",
    "reason": "Why this is a great swap (e.g. Save 28% with Cymbal Select, Gluten-Free certified, etc.)"
  }
]`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '[]');
    return res.json({ suggestions: parsed });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Fallback generator for CymbalMart
function generateSmartFallbackPlan(profile: any) {
  const total = (profile?.guestCount?.adults || 16) + (profile?.guestCount?.kids || 4);
  const adults = profile?.guestCount?.adults || 16;
  const budget = profile?.budget || 350;

  return {
    items: [
      {
        name: 'Cymbal Select Marinated Flank Steak & Chicken Fajita Kit',
        category: 'food_mains',
        department: 'Deli & Butcher Block',
        aisleNumber: 'Meat Counter',
        brandTier: 'cymbal_select',
        quantity: Math.ceil(total * 0.5),
        unit: 'lbs',
        estimatedPrice: 48,
        originalPrice: 64,
        savings: 16,
        targetStore: 'CymbalMart Supercenter',
        priority: 'must_have',
        notes: 'Pre-marinated in lime, cumin & garlic for rapid sizzling',
        dietaryTag: 'Gluten-Free'
      },
      {
        name: 'Cymbal Organics Fresh Flour & White Corn Tortillas',
        category: 'food_mains',
        department: 'Bakery & Pastries',
        aisleNumber: 'Aisle 4',
        brandTier: 'cymbal_organics',
        quantity: 3,
        unit: 'packs',
        estimatedPrice: 9,
        originalPrice: 12,
        savings: 3,
        targetStore: 'CymbalMart Supercenter',
        priority: 'must_have',
        notes: '3-4 street tacos per guest',
        dietaryTag: 'Vegetarian'
      },
      {
        name: 'Cymbal Fresh House Guacamole & Charred Pico de Gallo Kit',
        category: 'food_appetizers',
        department: 'Produce & Fresh Market',
        aisleNumber: 'Aisle 1-3',
        brandTier: 'cymbal_select',
        quantity: 3,
        unit: 'tubs',
        estimatedPrice: 15,
        originalPrice: 20,
        savings: 5,
        targetStore: 'CymbalMart Supercenter',
        priority: 'must_have',
        notes: 'Made fresh in-store daily with ripe Haas avocados',
        dietaryTag: 'Vegan'
      },
      {
        name: 'Cymbal Select Restaurant-Style Sea Salt Tortilla Chips',
        category: 'food_appetizers',
        department: 'Snacks & Pantry',
        aisleNumber: 'Aisle 8',
        brandTier: 'cymbal_select',
        quantity: 4,
        unit: 'bags',
        estimatedPrice: 12,
        originalPrice: 16,
        savings: 4,
        targetStore: 'CymbalMart Supercenter',
        priority: 'must_have',
        notes: 'Generous grazing starter for arrivals',
        dietaryTag: 'Gluten-Free'
      },
      {
        name: 'Cymbal Select Mexican-Style Street Corn (Elote) Salad Kit',
        category: 'food_sides',
        department: 'Produce & Fresh Market',
        aisleNumber: 'Aisle 2',
        brandTier: 'cymbal_select',
        quantity: 3,
        unit: 'kits',
        estimatedPrice: 14,
        originalPrice: 18,
        savings: 4,
        targetStore: 'CymbalMart Supercenter',
        priority: 'recommended',
        notes: 'Sweet corn, cotija cheese, chili lime dressing',
        dietaryTag: 'Vegetarian'
      },
      {
        name: 'Cymbal Artisan Bakery Cinnamon-Sugar Churro Bites',
        category: 'food_dessert',
        department: 'Bakery & Pastries',
        aisleNumber: 'Aisle 4',
        brandTier: 'cymbal_select',
        quantity: 2,
        unit: 'platters',
        estimatedPrice: 16,
        originalPrice: 22,
        savings: 6,
        targetStore: 'Cymbal Bakery Express',
        priority: 'must_have',
        notes: 'Warm in oven 5 mins before serving with spiced chocolate dip',
        dietaryTag: 'Vegetarian'
      },
      {
        name: 'Cymbal Premium Pure Ice Bags (10 lb Bags)',
        category: 'ice_essentials',
        department: 'Frozen & Ice Bay',
        aisleNumber: 'Front Ice Bay',
        brandTier: 'cymbal_select',
        quantity: 3,
        unit: 'bags',
        estimatedPrice: 9,
        originalPrice: 12,
        savings: 3,
        targetStore: 'CymbalMart Supercenter',
        priority: 'must_have',
        notes: '1.5 lbs per guest for cooling drinks and cocktail station',
        dietaryTag: 'All'
      },
      {
        name: 'Cymbal Select Lime Sparkling Water (24-Can Case)',
        category: 'beverages_nonalcoholic',
        department: 'Beverages & Spirits',
        aisleNumber: 'Aisle 12',
        brandTier: 'cymbal_select',
        quantity: 2,
        unit: 'cases',
        estimatedPrice: 14,
        originalPrice: 18,
        savings: 4,
        targetStore: 'CymbalMart Supercenter',
        priority: 'must_have',
        notes: 'Zero sugar thirst quencher and cocktail mixer',
        dietaryTag: 'All'
      },
      {
        name: 'Cymbal Spirits Agave Blanco Tequila (750ml)',
        category: 'beverages_alcoholic',
        department: 'Beverages & Spirits',
        aisleNumber: 'Aisle 14',
        brandTier: 'brand_name',
        quantity: 2,
        unit: 'bottles',
        estimatedPrice: 42,
        originalPrice: 42,
        savings: 0,
        targetStore: 'Cymbal Spirits & Wine',
        priority: 'must_have',
        notes: 'Signature Paloma & Margarita cocktail base',
        dietaryTag: 'All'
      },
      {
        name: 'Cymbal Organics 100% Ruby Red Grapefruit Juice',
        category: 'beverages_nonalcoholic',
        department: 'Produce & Fresh Market',
        aisleNumber: 'Aisle 1',
        brandTier: 'cymbal_organics',
        quantity: 2,
        unit: 'bottles',
        estimatedPrice: 10,
        originalPrice: 13,
        savings: 3,
        targetStore: 'CymbalMart Supercenter',
        priority: 'recommended',
        notes: 'Fresh tart Paloma cocktail mixer',
        dietaryTag: 'Vegan'
      },
      {
        name: 'Cymbal Party Compostable Heavy-Duty 9" Plates (50 ct)',
        category: 'tableware_disposables',
        department: 'Party Supplies & Tableware',
        aisleNumber: 'Aisle 18',
        brandTier: 'cymbal_select',
        quantity: 1,
        unit: 'packs',
        estimatedPrice: 11,
        originalPrice: 15,
        savings: 4,
        targetStore: 'CymbalMart Supercenter',
        priority: 'must_have',
        notes: 'Sturdy leak-resistant sugarcane fiber plates',
        dietaryTag: 'All'
      },
      {
        name: 'Cymbal Party Crystal Clear 12oz Cups & Napkins Pack',
        category: 'tableware_disposables',
        department: 'Party Supplies & Tableware',
        aisleNumber: 'Aisle 18',
        brandTier: 'cymbal_select',
        quantity: 1,
        unit: 'packs',
        estimatedPrice: 8,
        originalPrice: 11,
        savings: 3,
        targetStore: 'CymbalMart Supercenter',
        priority: 'must_have',
        notes: '2 cups per guest calculation',
        dietaryTag: 'All'
      },
      {
        name: 'Cymbal Wholesale Heavy-Duty Drawstring Trash Bags (40 ct)',
        category: 'cleanup_hardware',
        department: 'Household & Cleanup',
        aisleNumber: 'Aisle 20',
        brandTier: 'cymbal_select',
        quantity: 1,
        unit: 'boxes',
        estimatedPrice: 9,
        originalPrice: 13,
        savings: 4,
        targetStore: 'Cymbal Wholesale Club',
        priority: 'must_have',
        notes: 'Rapid party cleanup stations',
        dietaryTag: 'All'
      }
    ],
    timeline: [
      {
        timeFrame: 'T-5 Days (Order & Tableware)',
        label: 'CymbalMart Digital Order Setup',
        action: 'Lock in party tableware, compostable plates, napkins, and non-perishables via CymbalMart App for curbside pickup.',
        recommendedStores: ['CymbalMart Supercenter'],
        keyItems: ['Plates & Cups', 'Decorations', 'Trash Bags']
      },
      {
        timeFrame: 'T-2 Days (Pantry & Spirits Run)',
        label: 'Cymbal Spirits & Wholesale Run',
        action: 'Pick up Agave Blanco tequila, craft mixers, bulk chips, and canned sparkling sodas.',
        recommendedStores: ['Cymbal Spirits & Wine', 'Cymbal Wholesale Club'],
        keyItems: ['Tequila & Mixers', 'Chips', 'Seltzers']
      },
      {
        timeFrame: 'Day Of (Fresh Butcher, Bakery & Ice)',
        label: 'Fresh Pickup & Ice Loading',
        action: 'Pick up fresh marinated fajita meats from Cymbal Butcher, fresh guacamole, hot churro bites, and 30 lbs of ice 2 hours before start.',
        recommendedStores: ['CymbalMart Supercenter', 'Cymbal Bakery Express'],
        keyItems: ['Marinated Meats', 'Fresh Guacamole', 'Churro Bites', 'Ice Bags']
      }
    ],
    recipesAndDrinks: [
      {
        name: 'Cymbal Signature Sparkling Hibiscus Paloma (Batch for 20)',
        type: 'drink',
        servesCount: 20,
        prepTime: '10 mins',
        ingredients: [
          '750ml Cymbal Agave Blanco Tequila',
          '4 cups Cymbal Organics Grapefruit Juice',
          '2 cups Fresh Lime Juice & Hibiscus Tea syrup',
          '4 cans Cymbal Select Lime Sparkling Water',
          'Chili-lime salt for glass rims'
        ],
        instructions: 'Mix tequila, grapefruit juice, and hibiscus in a 2-gallon drink dispenser over ice. Top with sparkling lime water right before guests arrive.',
        pairings: 'Pairs wonderfully with fresh street tacos and spicy guacamole.'
      },
      {
        name: 'Sizzling Street Tacos with Charred Elote Corn Salad',
        type: 'food',
        servesCount: 22,
        prepTime: '20 mins',
        ingredients: [
          'Cymbal Select Marinated Flank Steak & Chicken',
          'Cymbal White Corn Tortillas',
          'Cheddar & Cotija Crumbles',
          'Fresh Pico de Gallo & Cilantro'
        ],
        instructions: 'Sear marinated meats over high heat for 3-4 mins per side. Slice against grain. Keep warm in chafing dish or slow cooker with warm tortillas.',
        pairings: 'Serve with ice-cold sparkling water and lime wedges.'
      }
    ],
    budgetTips: [
      'Switching to Cymbal Select store brand saves an estimated $59 across proteins, chips, and tableware without sacrificing taste.',
      'Batching the signature Paloma cocktail in a dispenser cuts beverage costs by 40% compared to buying individual canned cocktails.',
      'Buy 10lb ice bags in bulk from the front Ice Bay at CymbalMart instead of high-markup gas station bags.'
    ],
    agentAdvice: 'Your taco fiesta plan provides 3.5 tacos per attendee with ample fresh sides and drinks. Placing an express curbside pickup order 2 days prior guarantees bakery and meat counter availability.',
    estimatedSavings: 59
  };
}

// Vite middleware integration
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CymbalMart Party Planner Server running on http://localhost:${PORT}`);
  });
}

startServer();
