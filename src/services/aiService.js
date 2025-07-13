const axios = require('axios');

class AIService {
  constructor() {
    this.openRouterBaseURL = 'https://openrouter.ai/api/v1';
    this.togetherBaseURL = 'https://api.together.xyz/v1';
    this.cache = new Map();
    this.cacheExpiry = 60 * 60 * 1000; // 1 hour
    this.rateLimitCache = new Map();
    this.dailyLimit = 50; // Free tier daily limit
  }

  // Check if user has exceeded daily rate limit
  checkRateLimit(userId) {
    const today = new Date().toDateString();
    const key = `${userId}_${today}`;
    
    const usage = this.rateLimitCache.get(key) || 0;
    return usage < this.dailyLimit;
  }

  // Increment rate limit counter
  incrementRateLimit(userId) {
    const today = new Date().toDateString();
    const key = `${userId}_${today}`;
    
    const usage = this.rateLimitCache.get(key) || 0;
    this.rateLimitCache.set(key, usage + 1);
  }

  // Generate cache key for similar requests
  generateCacheKey(taskDescription, priority, category) {
    const normalized = taskDescription.toLowerCase().replace(/[^a-z0-9]/g, '');
    return `${normalized}_${priority}_${category}`;
  }

  // Generate AI productivity tip using OpenRouter
  async generateTipWithOpenRouter(taskDescription, priority = 'medium', category = 'general') {
    try {
      if (!process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY === 'your-openrouter-api-key') {
        throw new Error('OpenRouter API key not configured');
      }

      const prompt = this.createProductivityPrompt(taskDescription, priority, category);

      const response = await axios.post(
        `${this.openRouterBaseURL}/chat/completions`,
        {
          model: 'microsoft/wizardlm-2-8x22b', // Free tier model
          messages: [
            {
              role: 'system',
              content: 'You are a productivity expert assistant. Provide concise, actionable productivity tips and strategies.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 200,
          temperature: 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://task-manager-app.com',
            'X-Title': 'Task Manager App'
          },
          timeout: 10000
        }
      );

      if (response.data && response.data.choices && response.data.choices[0]) {
        return {
          tip: response.data.choices[0].message.content.trim(),
          source: 'OpenRouter AI',
          model: 'WizardLM-2',
          category,
          priority
        };
      }

      return null;
    } catch (error) {
      console.error('OpenRouter API error:', error.message);
      throw error;
    }
  }

  // Generate AI productivity tip using Together AI
  async generateTipWithTogether(taskDescription, priority = 'medium', category = 'general') {
    try {
      if (!process.env.TOGETHER_API_KEY || process.env.TOGETHER_API_KEY === 'your-together-api-key') {
        throw new Error('Together AI API key not configured');
      }

      const prompt = this.createProductivityPrompt(taskDescription, priority, category);

      const response = await axios.post(
        `${this.togetherBaseURL}/chat/completions`,
        {
          model: 'meta-llama/Llama-2-7b-chat-hf', // Free tier model
          messages: [
            {
              role: 'system',
              content: 'You are a productivity expert assistant. Provide concise, actionable productivity tips and strategies.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 200,
          temperature: 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.TOGETHER_API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );

      if (response.data && response.data.choices && response.data.choices[0]) {
        return {
          tip: response.data.choices[0].message.content.trim(),
          source: 'Together AI',
          model: 'Llama-2-7B',
          category,
          priority
        };
      }

      return null;
    } catch (error) {
      console.error('Together AI API error:', error.message);
      throw error;
    }
  }

  // Create a well-structured prompt for productivity tips
  createProductivityPrompt(taskDescription, priority, category) {
    return `Task: ${taskDescription}
Priority: ${priority}
Category: ${category}

Please provide a specific, actionable productivity tip to help complete this task efficiently. Focus on:
1. Time management strategies
2. Focus and concentration techniques
3. Task breakdown approaches
4. Relevant tools or methods

Keep the response concise (2-3 sentences) and practical.`;
  }

  // Main method to generate productivity tip with fallback
  async generateProductivityTip(taskDescription, userId, priority = 'medium', category = 'general') {
    try {
      // Check rate limiting
      if (!this.checkRateLimit(userId)) {
        return {
          tip: "You've reached your daily AI tip limit. Try breaking down your task into smaller, manageable steps and tackle them one at a time using the Pomodoro Technique.",
          source: 'Rate Limited',
          isRateLimited: true
        };
      }

      // Check cache first
      const cacheKey = this.generateCacheKey(taskDescription, priority, category);
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        if (Date.now() - cached.timestamp < this.cacheExpiry) {
          return cached.data;
        }
      }

      let tip = null;

      // Try OpenRouter first
      try {
        tip = await this.generateTipWithOpenRouter(taskDescription, priority, category);
      } catch (error) {
        console.log('OpenRouter failed, trying Together AI...');
      }

      // Fallback to Together AI
      if (!tip) {
        try {
          tip = await this.generateTipWithTogether(taskDescription, priority, category);
        } catch (error) {
          console.log('Together AI also failed, using fallback tips...');
        }
      }

      // Fallback to predefined tips
      if (!tip) {
        tip = this.getFallbackTip(category, priority);
      }

      // Cache the result
      if (tip && !tip.isRateLimited) {
        this.cache.set(cacheKey, {
          data: tip,
          timestamp: Date.now()
        });
      }

      // Increment rate limit counter
      this.incrementRateLimit(userId);

      return tip;
    } catch (error) {
      console.error('Generate productivity tip error:', error);
      return this.getFallbackTip(category, priority);
    }
  }

  // Fallback tips when AI services are unavailable
  getFallbackTip(category, priority) {
    const tips = {
      work: {
        high: "For high-priority work tasks, use the Eisenhower Matrix to distinguish between urgent and important. Start with deep work sessions of 90 minutes for maximum focus.",
        medium: "Break your work task into 25-minute focused sessions using the Pomodoro Technique. Take 5-minute breaks between sessions to maintain productivity.",
        low: "Batch similar work tasks together and tackle them during your lower-energy periods. Use this time to clear smaller items from your task list.",
        urgent: "For urgent work tasks, eliminate all distractions, communicate your unavailability, and focus solely on the task until completion."
      },
      personal: {
        high: "Schedule personal high-priority tasks during your peak energy hours. Treat them with the same importance as work commitments.",
        medium: "Link personal tasks to existing habits. For example, do this task right after your morning coffee or before dinner.",
        low: "Use waiting time or transition periods for low-priority personal tasks. Keep a mobile-friendly version ready.",
        urgent: "For urgent personal matters, delegate what you can and focus on what only you can do. Don't let perfectionism slow you down."
      },
      study: {
        high: "Use active recall and spaced repetition for high-priority study topics. Test yourself frequently rather than just re-reading.",
        medium: "Create a distraction-free study environment and use the Feynman Technique - explain the concept in simple terms as if teaching someone else.",
        low: "Use audio resources or flashcards for low-priority study materials during commutes or exercise.",
        urgent: "Focus on understanding core concepts first, then move to details. Use practice problems to identify knowledge gaps quickly."
      },
      default: {
        high: "Break this high-priority task into smaller, specific actions. Complete the most challenging part when your energy is highest.",
        medium: "Set a specific time to work on this task and remove potential distractions from your environment beforehand.",
        low: "Pair this task with something enjoyable or do it during a natural transition time in your day.",
        urgent: "Focus on progress, not perfection. Identify the minimum viable completion criteria and work towards that first."
      }
    };

    const categoryTips = tips[category] || tips.default;
    const tip = categoryTips[priority] || categoryTips.medium;

    return {
      tip,
      source: 'Fallback Tips',
      category,
      priority
    };
  }

  // Get usage statistics for a user
  getUserUsage(userId) {
    const today = new Date().toDateString();
    const key = `${userId}_${today}`;
    const usage = this.rateLimitCache.get(key) || 0;
    
    return {
      dailyUsage: usage,
      dailyLimit: this.dailyLimit,
      remaining: Math.max(0, this.dailyLimit - usage)
    };
  }

  // Clear cache (useful for testing)
  clearCache() {
    this.cache.clear();
  }

  // Clear rate limit cache (useful for testing)
  clearRateLimitCache() {
    this.rateLimitCache.clear();
  }
}

module.exports = new AIService();
