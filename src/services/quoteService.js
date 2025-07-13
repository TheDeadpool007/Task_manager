const axios = require('axios');

class QuoteService {
  constructor() {
    this.baseURLs = {
      zenquotes: 'https://zenquotes.io/api',
      quotable: 'https://api.quotable.io'
    };
    this.cache = new Map();
    this.cacheExpiry = 30 * 60 * 1000; // 30 minutes
  }

  // Get a random quote from ZenQuotes.io
  async getRandomQuoteFromZen() {
    try {
      const response = await axios.get(`${this.baseURLs.zenquotes}/random`, {
        timeout: 5000
      });
      
      if (response.data && response.data[0]) {
        const quote = response.data[0];
        return {
          text: quote.q,
          author: quote.a,
          source: 'ZenQuotes.io'
        };
      }
      return null;
    } catch (error) {
      console.error('ZenQuotes API error:', error.message);
      return null;
    }
  }

  // Get a random quote from Quotable.io
  async getRandomQuoteFromQuotable() {
    try {
      const response = await axios.get(`${this.baseURLs.quotable}/random`, {
        timeout: 5000,
        params: {
          minLength: 50,
          maxLength: 200,
          tags: 'motivational|inspirational|success|wisdom'
        }
      });
      
      if (response.data) {
        return {
          text: response.data.content,
          author: response.data.author,
          source: 'Quotable.io',
          tags: response.data.tags
        };
      }
      return null;
    } catch (error) {
      console.error('Quotable API error:', error.message);
      return null;
    }
  }

  // Get quotes by category from Quotable.io
  async getQuotesByCategory(category = 'motivational') {
    try {
      const cacheKey = `category_${category}`;
      
      // Check cache first
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        if (Date.now() - cached.timestamp < this.cacheExpiry) {
          return cached.data;
        }
      }

      const response = await axios.get(`${this.baseURLs.quotable}/quotes`, {
        timeout: 5000,
        params: {
          tags: category,
          limit: 10,
          minLength: 30,
          maxLength: 300
        }
      });
      
      if (response.data && response.data.results) {
        const quotes = response.data.results.map(quote => ({
          text: quote.content,
          author: quote.author,
          source: 'Quotable.io',
          tags: quote.tags
        }));

        // Cache the results
        this.cache.set(cacheKey, {
          data: quotes,
          timestamp: Date.now()
        });

        return quotes;
      }
      return [];
    } catch (error) {
      console.error('Quotable category API error:', error.message);
      return [];
    }
  }

  // Get a daily quote (cached for 24 hours)
  async getDailyQuote() {
    try {
      const cacheKey = 'daily_quote';
      const today = new Date().toDateString();
      
      // Check if we have today's quote cached
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        if (cached.date === today) {
          return cached.data;
        }
      }

      // Try to get from Quotable first, then ZenQuotes
      let quote = await this.getRandomQuoteFromQuotable();
      if (!quote) {
        quote = await this.getRandomQuoteFromZen();
      }

      if (quote) {
        // Cache the daily quote
        this.cache.set(cacheKey, {
          data: quote,
          date: today
        });
      }

      return quote;
    } catch (error) {
      console.error('Daily quote error:', error.message);
      return null;
    }
  }

  // Get a random motivational quote with fallback
  async getMotivationalQuote() {
    try {
      // Try multiple sources for reliability
      let quote = await this.getRandomQuoteFromQuotable();
      
      if (!quote) {
        quote = await this.getRandomQuoteFromZen();
      }

      // Fallback quotes if APIs are down
      if (!quote) {
        const fallbackQuotes = [
          {
            text: "The way to get started is to quit talking and begin doing.",
            author: "Walt Disney",
            source: "Fallback"
          },
          {
            text: "Don't be afraid to give up the good to go for the great.",
            author: "John D. Rockefeller",
            source: "Fallback"
          },
          {
            text: "Innovation distinguishes between a leader and a follower.",
            author: "Steve Jobs",
            source: "Fallback"
          },
          {
            text: "The future belongs to those who believe in the beauty of their dreams.",
            author: "Eleanor Roosevelt",
            source: "Fallback"
          },
          {
            text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
            author: "Winston Churchill",
            source: "Fallback"
          }
        ];

        quote = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
      }

      return quote;
    } catch (error) {
      console.error('Motivational quote error:', error.message);
      return {
        text: "Success is walking from failure to failure with no loss of enthusiasm.",
        author: "Winston Churchill",
        source: "Fallback"
      };
    }
  }

  // Clear cache (useful for testing)
  clearCache() {
    this.cache.clear();
  }
}

module.exports = new QuoteService();
