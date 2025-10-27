const express = require("express");
const {
    getSupportedCurrencies,
    getExchangeRates,
    updateUserCurrency
} = require("../controllers/currencyController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/supported", getSupportedCurrencies);
router.get("/rates", getExchangeRates);
router.put("/update-preference", protect, updateUserCurrency);

module.exports = router;
