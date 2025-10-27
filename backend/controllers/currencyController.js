const User = require('../models/User');
const { getSupportedCurrencies, getExchangeRates } = require('../utils/currencyConverter');

// Get supported currencies
exports.getSupportedCurrencies = async (req, res) => {
    try {
        const currencies = getSupportedCurrencies();
        res.json({ currencies });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching currencies", error: error.message });
    }
};

// Get current exchange rates
exports.getExchangeRates = async (req, res) => {
    try {
        const { base = 'USD' } = req.query;
        const rates = await getExchangeRates(base);
        res.json(rates);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching exchange rates", error: error.message });
    }
};

// Update user's preferred currency
exports.updateUserCurrency = async (req, res) => {
    try {
        const userId = req.user._id;
        const { currency } = req.body;

        if (!currency) {
            return res.status(400).json({ message: "Currency is required" });
        }

        const currencies = getSupportedCurrencies();
        const isSupported = currencies.some(c => c.code === currency);

        if (!isSupported) {
            return res.status(400).json({ message: "Currency not supported" });
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { currency },
            { new: true }
        ).select('-password');

        res.json({ 
            message: "Currency updated successfully",
            user 
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error updating currency", error: error.message });
    }
};
