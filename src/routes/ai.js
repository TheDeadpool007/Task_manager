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
  body('taskTitle')
    .trim()
    .notEmpty()
    .withMessage('Task title is required')
    .isLength({ min: 3, max: 100 })
    .withMessage('Task title must be between 3 and 100 characters'),
  handleValidationErrors
];

// AI tip generation routes
router.post('/tip', validateTipRequest, generateProductivityTip);
router.post('/tip/comprehensive', validateTipRequest, generateComprehensiveTips);
router.post('/tasks/:taskId/tip', generateTipForTask);
router.get('/insights/daily', generateDailyInsights);
router.get('/usage', getUsageStats);

module.exports = router;
