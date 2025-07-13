const express = require('express');
const router = express.Router();

const {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  addComment,
  assignUserToTask,
  getTaskStats
} = require('../controllers/taskController');

const { authenticateToken, requireRole } = require('../middleware/auth');
const {
  validateTaskCreation,
  validateTaskUpdate,
  validateComment
} = require('../middleware/validation');

// All routes require authentication
router.use(authenticateToken);

// Task CRUD routes
router.get('/', getTasks);
router.get('/stats', getTaskStats);
router.get('/:id', getTaskById);
router.post('/', validateTaskCreation, createTask);
router.put('/:id', validateTaskUpdate, updateTask);
router.delete('/:id', deleteTask);

// Task interaction routes
router.post('/:id/comments', validateComment, addComment);
router.post('/:id/assign', requireRole(['admin', 'manager']), assignUserToTask);

module.exports = router;
