const OpenAI = require('openai');

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Expense categories
const EXPENSE_CATEGORIES = [
    'Food & Dining',
    'Transportation',
    'Housing & Utilities',
    'Shopping & Retail',
    'Entertainment',
    'Healthcare',
    'Education',
    'Fitness & Wellness',
    'Business & Work',
    'Travel',
    'Financial Services',
    'Gifts & Donations',
    'Maintenance & Repairs',
    'Subscriptions',
    'Other'
];

// In-memory cache to reduce API calls for common descriptions
const categorizationCache = new Map();
const CACHE_MAX_SIZE = 500;
const CACHE_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Categorize expense using OpenAI GPT-3.5-turbo
 */
async function categorizeExpenseWithAI(description, amount = null) {
    try {
        // Normalize description for caching
        const cacheKey = description.toLowerCase().trim();
        
        // Check cache first
        if (categorizationCache.has(cacheKey)) {
            const cached = categorizationCache.get(cacheKey);
            if (Date.now() - cached.timestamp < CACHE_EXPIRY_MS) {
                console.log(`Cache hit for: ${description}`);
                return cached.result;
            } else {
                categorizationCache.delete(cacheKey);
            }
        }

        // Prepare prompt for OpenAI
        const prompt = createCategorizationPrompt(description, amount);

        // Call OpenAI API
        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: 'You are an expert financial assistant specializing in categorizing expenses accurately. Respond ONLY with valid JSON.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: 0.3, // Lower temperature for more consistent results
            max_tokens: 150
        });

        // Parse AI response
        const aiResponse = response.choices[0].message.content.trim();
        const result = parseAIResponse(aiResponse, description);

        // Cache the result
        if (result.success) {
            cacheResult(cacheKey, result);
        }

        return result;

    } catch (error) {
        console.error('AI Categorization Error:', error.message);
        
        // Fallback to keyword-based categorization
        return fallbackCategorization(description);
    }
}

/**
 * Create prompt for OpenAI
 */
function createCategorizationPrompt(description, amount) {
    const categoriesList = EXPENSE_CATEGORIES.join(', ');
    
    let prompt = `Categorize this expense into ONE of these categories: [${categoriesList}]

Expense Description: "${description}"`;

    if (amount) {
        prompt += `\nAmount: $${amount}`;
    }

    prompt += `

Respond ONLY with valid JSON in this exact format:
{
  "category": "exact category name from the list",
  "confidence": 0.95,
  "reasoning": "brief explanation"
}

Rules:
- Choose the MOST appropriate category
- confidence should be 0.0 to 1.0
- Use "Other" only if truly unclear
- Be consistent with similar expenses`;

    return prompt;
}

/**
 * Parse AI response
 */
function parseAIResponse(aiResponse, originalDescription) {
    try {
        // Extract JSON from response (handle cases where AI adds extra text)
        let jsonStr = aiResponse;
        
        // Try to find JSON in the response
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            jsonStr = jsonMatch[0];
        }

        const parsed = JSON.parse(jsonStr);

        // Validate category
        if (!EXPENSE_CATEGORIES.includes(parsed.category)) {
            console.warn(`Invalid category: ${parsed.category}, using fallback`);
            return fallbackCategorization(originalDescription);
        }

        // Validate confidence
        const confidence = parseFloat(parsed.confidence);
        if (isNaN(confidence) || confidence < 0 || confidence > 1) {
            parsed.confidence = 0.7; // Default moderate confidence
        }

        return {
            success: true,
            category: parsed.category,
            confidence: confidence,
            reasoning: parsed.reasoning || 'AI-based categorization',
            source: 'openai'
        };

    } catch (error) {
        console.error('Error parsing AI response:', error.message);
        return fallbackCategorization(originalDescription);
    }
}

/**
 * Fallback keyword-based categorization
 */
function fallbackCategorization(description) {
    const desc = description.toLowerCase();

    const keywordMap = {
        'Food & Dining': ['food', 'restaurant', 'cafe', 'pizza', 'burger', 'dinner', 'lunch', 'breakfast', 'starbucks', 'mcdonald', 'domino', 'subway', 'grocery', 'supermarket'],
        'Transportation': ['uber', 'lyft', 'taxi', 'gas', 'fuel', 'petrol', 'parking', 'metro', 'train', 'bus', 'flight', 'car'],
        'Housing & Utilities': ['rent', 'mortgage', 'electricity', 'water', 'internet', 'wifi', 'utility', 'housing'],
        'Shopping & Retail': ['amazon', 'walmart', 'target', 'shop', 'store', 'clothing', 'clothes', 'shoes', 'mall'],
        'Entertainment': ['movie', 'cinema', 'netflix', 'spotify', 'game', 'concert', 'theater', 'entertainment'],
        'Healthcare': ['doctor', 'hospital', 'pharmacy', 'medicine', 'medical', 'health', 'clinic', 'dental'],
        'Education': ['school', 'college', 'university', 'course', 'book', 'tuition', 'education', 'learning'],
        'Fitness & Wellness': ['gym', 'fitness', 'yoga', 'sport', 'wellness', 'workout', 'exercise'],
        'Business & Work': ['office', 'supplies', 'software', 'business', 'work', 'meeting'],
        'Travel': ['hotel', 'airbnb', 'booking', 'travel', 'vacation', 'trip', 'airline'],
        'Financial Services': ['bank', 'fee', 'atm', 'transfer', 'payment', 'insurance'],
        'Gifts & Donations': ['gift', 'donation', 'charity', 'present'],
        'Maintenance & Repairs': ['repair', 'fix', 'maintenance', 'service', 'plumber', 'electrician'],
        'Subscriptions': ['subscription', 'monthly', 'annual', 'membership', 'premium']
    };

    for (const [category, keywords] of Object.entries(keywordMap)) {
        for (const keyword of keywords) {
            if (desc.includes(keyword)) {
                return {
                    success: true,
                    category: category,
                    confidence: 0.6,
                    reasoning: `Matched keyword: "${keyword}"`,
                    source: 'keyword-matching'
                };
            }
        }
    }

    // Default to "Other" if no match found
    return {
        success: true,
        category: 'Other',
        confidence: 0.3,
        reasoning: 'No specific category match found',
        source: 'default'
    };
}

/**
 * Cache categorization result
 */
function cacheResult(key, result) {
    // Implement LRU-like cache (remove oldest if size exceeded)
    if (categorizationCache.size >= CACHE_MAX_SIZE) {
        const firstKey = categorizationCache.keys().next().value;
        categorizationCache.delete(firstKey);
    }

    categorizationCache.set(key, {
        result: result,
        timestamp: Date.now()
    });
}

/**
 * Get all available categories
 */
function getAvailableCategories() {
    return EXPENSE_CATEGORIES;
}

/**
 * Clear cache (useful for testing or manual refresh)
 */
function clearCache() {
    categorizationCache.clear();
    console.log('AI categorization cache cleared');
}

/**
 * Get cache statistics
 */
function getCacheStats() {
    return {
        size: categorizationCache.size,
        maxSize: CACHE_MAX_SIZE,
        expiryMs: CACHE_EXPIRY_MS
    };
}

module.exports = {
    categorizeExpenseWithAI,
    getAvailableCategories,
    clearCache,
    getCacheStats,
    EXPENSE_CATEGORIES
};
