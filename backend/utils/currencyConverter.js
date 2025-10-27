const axios = require('axios');

// Supported currencies
const SUPPORTED_CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'SGD', 'AED', 'SAR', 'BRL', 'MXN', 'ZAR'];

// Cache for exchange rates (valid for 1 hour)
let exchangeRatesCache = {
    rates: null,
    timestamp: null,
    baseCurrency: 'USD'
};

const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

/**
 * Fetch exchange rates from API
 * Using exchangerate-api.io (free tier: 1500 requests/month)
 */
async function fetchExchangeRates(baseCurrency = 'USD') {
    try {
        const API_KEY = process.env.EXCHANGE_RATE_API_KEY || 'free'; // You can use 'free' for testing
        const url = API_KEY === 'free' 
            ? `https://open.er-api.com/v6/latest/${baseCurrency}`
            : `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/${baseCurrency}`;

        const response = await axios.get(url);
        
        if (response.data && response.data.rates) {
            return {
                rates: response.data.rates,
                baseCurrency: baseCurrency,
                timestamp: Date.now()
            };
        }
        
        throw new Error('Invalid response from exchange rate API');
    } catch (error) {
        console.error('Error fetching exchange rates:', error.message);
        // Return fallback rates if API fails
        return getFallbackRates(baseCurrency);
    }
}

/**
 * Get exchange rates (from cache or fresh)
 */
async function getExchangeRates(baseCurrency = 'USD') {
    const now = Date.now();
    
    // Check if cache is valid
    if (exchangeRatesCache.rates && 
        exchangeRatesCache.baseCurrency === baseCurrency &&
        exchangeRatesCache.timestamp &&
        (now - exchangeRatesCache.timestamp) < CACHE_DURATION) {
        return exchangeRatesCache;
    }
    
    // Fetch new rates
    const freshRates = await fetchExchangeRates(baseCurrency);
    exchangeRatesCache = freshRates;
    
    return exchangeRatesCache;
}

/**
 * Convert amount from one currency to another
 */
async function convertCurrency(amount, fromCurrency, toCurrency) {
    if (fromCurrency === toCurrency) {
        return amount;
    }
    
    try {
        const ratesData = await getExchangeRates(fromCurrency);
        const rate = ratesData.rates[toCurrency];
        
        if (!rate) {
            throw new Error(`Exchange rate not found for ${toCurrency}`);
        }
        
        return amount * rate;
    } catch (error) {
        console.error('Currency conversion error:', error.message);
        return amount; // Return original amount if conversion fails
    }
}

/**
 * Convert multiple transactions to user's preferred currency
 */
async function convertTransactions(transactions, userCurrency) {
    if (!transactions || transactions.length === 0) {
        return transactions;
    }
    
    const convertedTransactions = await Promise.all(
        transactions.map(async (transaction) => {
            const transactionCurrency = transaction.currency || 'USD';
            
            if (transactionCurrency === userCurrency) {
                return {
                    ...transaction,
                    convertedAmount: transaction.amount,
                    displayCurrency: userCurrency
                };
            }
            
            const convertedAmount = await convertCurrency(
                transaction.amount,
                transactionCurrency,
                userCurrency
            );
            
            return {
                ...transaction,
                originalAmount: transaction.amount,
                originalCurrency: transactionCurrency,
                convertedAmount: parseFloat(convertedAmount.toFixed(2)),
                displayCurrency: userCurrency
            };
        })
    );
    
    return convertedTransactions;
}

/**
 * Get all supported currencies with their symbols
 */
function getSupportedCurrencies() {
    return [
        { code: 'USD', name: 'US Dollar', symbol: '$' },
        { code: 'EUR', name: 'Euro', symbol: '€' },
        { code: 'GBP', name: 'British Pound', symbol: '£' },
        { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
        { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
        { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
        { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
        { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
        { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
        { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
        { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
        { code: 'SAR', name: 'Saudi Riyal', symbol: '﷼' },
        { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
        { code: 'MXN', name: 'Mexican Peso', symbol: 'Mex$' },
        { code: 'ZAR', name: 'South African Rand', symbol: 'R' }
    ];
}

/**
 * Get currency symbol by code
 */
function getCurrencySymbol(currencyCode) {
    const currencies = getSupportedCurrencies();
    const currency = currencies.find(c => c.code === currencyCode);
    return currency ? currency.symbol : currencyCode;
}

/**
 * Fallback exchange rates (approximate, updated periodically)
 */
function getFallbackRates(baseCurrency) {
    const fallbackRates = {
        'USD': {
            'USD': 1, 'EUR': 0.92, 'GBP': 0.79, 'INR': 83.12, 'JPY': 149.50,
            'AUD': 1.52, 'CAD': 1.36, 'CHF': 0.88, 'CNY': 7.24, 'SGD': 1.34,
            'AED': 3.67, 'SAR': 3.75, 'BRL': 4.97, 'MXN': 17.08, 'ZAR': 18.65
        }
    };
    
    // Simple conversion for other base currencies (not accurate, for fallback only)
    if (baseCurrency !== 'USD') {
        const usdRates = fallbackRates['USD'];
        const baseRate = usdRates[baseCurrency];
        const rates = {};
        
        Object.keys(usdRates).forEach(currency => {
            rates[currency] = usdRates[currency] / baseRate;
        });
        
        return {
            rates,
            baseCurrency,
            timestamp: Date.now()
        };
    }
    
    return {
        rates: fallbackRates['USD'],
        baseCurrency: 'USD',
        timestamp: Date.now()
    };
}

module.exports = {
    convertCurrency,
    convertTransactions,
    getExchangeRates,
    getSupportedCurrencies,
    getCurrencySymbol,
    SUPPORTED_CURRENCIES
};
