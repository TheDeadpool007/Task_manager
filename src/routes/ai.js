const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');

const {
  generateProductivityTip,
  generateTipForTask,
  getUsageStats,
  generateComprehensiveTips,
  generateDailyInsights
} = require('../controllers/aiController');

const { authenticateToken } = require('../middleware/auth');
const { body } = require('express-validator');
const { handleValidationErrors } = require('../middleware/validation');

// Rate limiting for AI endpoints
const aiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 AI requests per windowMs
  message: {
    success: false,
    error: 'Too many AI requests, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// All routes require authentication
router.use(authenticateToken);
router.use(aiRateLimit);

// Validation middleware for tip generation
const validateTipRequest = [
  body('taskDescription')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Task description must be between 10 and 500 characters'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Priority must be low, medium, high, or urgent'),
  body('category')
    .optional()
    .isIn(['work', 'personal', 'study', 'health', 'finance', 'other'])
    .withMessage('Category must be work, personal, study, health, finance, or other'),
  handleValidationErrors
];

// AI tip generation routes
router.post('/tip', validateTipRequest, generateProductivityTip);
router.post('/tip/comprehensive', validateTipRequest, generateComprehensiveTips);
router.post('/tasks/:taskId/tip', generateTipForTask);
router.get('/insights/daily', generateDailyInsights);
router.get('/usage', getUsageStats);

module.exports = router;
