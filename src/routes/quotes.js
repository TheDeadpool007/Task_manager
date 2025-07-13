const express = require('express');
const router = express.Router();

const {
  getRandomQuote,
  getDailyQuote,
  getQuotesByCategory,
  getMultipleQuotes
} = require('../controllers/quoteController');

// Public routes (no authentication required for quotes)
router.get('/random', getRandomQuote);
router.get('/daily', getDailyQuote);
router.get('/category/:category', getQuotesByCategory);
router.get('/multiple', getMultipleQuotes);

module.exports = router;
