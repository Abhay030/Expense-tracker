const express = require('express');
const {
    populateSampleData,
    clearSampleData,
    getSampleDataStatus,
} = require('../controllers/sampleDataController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/populate', protect, populateSampleData);
router.delete('/clear', protect, clearSampleData);
router.get('/status', protect, getSampleDataStatus);

module.exports = router;
