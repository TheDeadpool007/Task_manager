const express = require('express');
const router = express.Router();

const {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  logout,
  getAllUsers,
  updateUserRole,
  deactivateUser
} = require('../controllers/authController');

const { authenticateToken, requireRole } = require('../middleware/auth');
const {
  validateUserRegistration,
  validateUserLogin,
  validatePasswordChange,
  validateProfileUpdate
} = require('../middleware/validation');

// Public routes
router.post('/register', validateUserRegistration, register);
router.post('/login', validateUserLogin, login);

// Protected routes (require authentication)
router.use(authenticateToken);

// User profile routes
router.get('/profile', getProfile);
router.put('/profile', validateProfileUpdate, updateProfile);
router.put('/change-password', validatePasswordChange, changePassword);
router.post('/logout', logout);

// Admin only routes
router.get('/users', requireRole(['admin']), getAllUsers);
router.put('/users/:userId/role', requireRole(['admin']), updateUserRole);
router.put('/users/:userId/deactivate', requireRole(['admin']), deactivateUser);

module.exports = router;
