const quoteService = require('../services/quoteService');

// Get a random motivational quote
const getRandomQuote = async (req, res) => {
  try {
    const quote = await quoteService.getMotivationalQuote();
    
    if (!quote) {
      return res.status(503).json({
        success: false,
        error: 'Quote service temporarily unavailable'
      });
    }

    res.json({
      success: true,
      data: { quote }
    });
  } catch (error) {
    console.error('Get random quote error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch quote'
    });
  }
};

// Get daily quote
const getDailyQuote = async (req, res) => {
  try {
    const quote = await quoteService.getDailyQuote();
    
    if (!quote) {
      return res.status(503).json({
        success: false,
        error: 'Quote service temporarily unavailable'
      });
    }

    res.json({
      success: true,
      data: { quote }
    });
  } catch (error) {
    console.error('Get daily quote error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch daily quote'
    });
  }
};

// Get quotes by category
const getQuotesByCategory = async (req, res) => {
  try {
    const { category = 'motivational' } = req.params;
    
    const allowedCategories = [
      'motivational', 'inspirational', 'success', 'wisdom', 
      'leadership', 'perseverance', 'work', 'productivity'
    ];

    if (!allowedCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid category',
        allowedCategories
      });
    }

    const quotes = await quoteService.getQuotesByCategory(category);
    
    res.json({
      success: true,
      data: { 
        quotes,
        category,
        count: quotes.length
      }
    });
  } catch (error) {
    console.error('Get quotes by category error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch quotes by category'
    });
  }
};

// Get multiple random quotes
const getMultipleQuotes = async (req, res) => {
  try {
    const { count = 5 } = req.query;
    const maxCount = 10;
    const requestedCount = Math.min(parseInt(count), maxCount);

    const quotes = [];
    for (let i = 0; i < requestedCount; i++) {
      const quote = await quoteService.getMotivationalQuote();
      if (quote) {
        quotes.push(quote);
      }
    }

    res.json({
      success: true,
      data: { 
        quotes,
        count: quotes.length,
        requested: requestedCount
      }
    });
  } catch (error) {
    console.error('Get multiple quotes error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch multiple quotes'
    });
  }
};

module.exports = {
  getRandomQuote,
  getDailyQuote,
  getQuotesByCategory,
  getMultipleQuotes
};
