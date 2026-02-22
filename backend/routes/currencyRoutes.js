const express = require("express");
const {
    getSupportedCurrencies,
    getExchangeRates,
    updateUserCurrency
} = require("../controllers/currencyController");

const { protect } = require("../middleware/authMiddleware");
const { validate } = require("../middleware/validate");

const router = express.Router();

router.get("/supported", getSupportedCurrencies);
router.get("/rates", getExchangeRates);
router.put("/update-preference", protect, validate('updateCurrency'), updateUserCurrency);

module.exports = router;
