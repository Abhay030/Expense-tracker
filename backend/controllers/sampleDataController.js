const { populateSampleData, clearSampleData, getSampleDataStatus } = require('../services/sampleDataService');
const cache = require('../middleware/cache');

exports.populateSampleData = async (req, res) => {
    const userId = req.user._id;
    try {
        const result = await populateSampleData(userId);
        cache.invalidateUser(userId);
        if (result.exists) {
            return res.status(200).json(result);
        }
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error populating sample data', error: error.message });
    }
};

exports.clearSampleData = async (req, res) => {
    const userId = req.user._id;
    try {
        const result = await clearSampleData(userId);
        cache.invalidateUser(userId);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error clearing sample data', error: error.message });
    }
};

exports.getSampleDataStatus = async (req, res) => {
    const userId = req.user._id;
    try {
        const status = await getSampleDataStatus(userId);
        res.status(200).json(status);
    } catch (error) {
        res.status(500).json({ message: 'Error checking sample data status', error: error.message });
    }
};
