const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:3002", "http://localhost:8080", "http://127.0.0.1:8080"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// In-memory storage (for development without MongoDB)
let users = [];
let tasks = [];
let userIdCounter = 1;
let taskIdCounter = 1;

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:3002", "http://localhost:8080", "http://127.0.0.1:8080"],
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from frontend directory
app.use(express.static('frontend'));

// Helper function to generate JWT
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

// Helper function to verify JWT
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(403).json({ message: 'Invalid token' });
  }

  const user = users.find(u => u.id === decoded.userId);
  if (!user) {
    return res.status(403).json({ message: 'User not found' });
  }

  req.user = user;
  next();
};

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role = 'user' } = req.body;

    // Check if user exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(password, 12);

    // Create user
    const user = {
      id: userIdCounter++,
      name,
      email,
      password: hashedPassword,
      role,
      createdAt: new Date()
    };

    users.push(user);

    // Generate token
    const token = generateToken(user.id);

    // Remove password from response
    const { password: _, ...userResponse } = user;

    res.status(201).json({
      message: 'User registered successfully',
      user: userResponse,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcryptjs.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user.id);

    // Remove password from response
    const { password: _, ...userResponse } = user;

    res.json({
      message: 'Login successful',
      user: userResponse,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/auth/profile', authenticateToken, (req, res) => {
  const { password: _, ...userResponse } = req.user;
  res.json({ user: userResponse });
});

// Task Routes
app.get('/api/tasks', authenticateToken, (req, res) => {
  const userTasks = tasks.filter(task => task.userId === req.user.id);
  res.json({ tasks: userTasks });
});

app.post('/api/tasks', authenticateToken, (req, res) => {
  try {
    const { title, description, priority = 'medium', status = 'pending', dueDate, tags = [] } = req.body;

    const task = {
      _id: taskIdCounter++,
      title,
      description,
      priority,
      status,
      dueDate,
      tags: typeof tags === 'string' ? tags.split(',').map(tag => tag.trim()) : tags,
      userId: req.user.id,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    tasks.push(task);

    // Emit to all connected clients
    io.emit('taskCreated', task);

    res.status(201).json({
      message: 'Task created successfully',
      task
    });
  } catch (error) {
    console.error('Task creation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/tasks/:id', authenticateToken, (req, res) => {
  try {
    const taskId = parseInt(req.params.id);
    const taskIndex = tasks.findIndex(t => t._id === taskId && t.userId === req.user.id);

    if (taskIndex === -1) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const updatedTask = {
      ...tasks[taskIndex],
      ...req.body,
      updatedAt: new Date()
    };

    tasks[taskIndex] = updatedTask;

    // Emit to all connected clients
    io.emit('taskUpdated', updatedTask);

    res.json({
      message: 'Task updated successfully',
      task: updatedTask
    });
  } catch (error) {
    console.error('Task update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/tasks/:id', authenticateToken, (req, res) => {
  try {
    const taskId = parseInt(req.params.id);
    const taskIndex = tasks.findIndex(t => t._id === taskId && t.userId === req.user.id);

    if (taskIndex === -1) {
      return res.status(404).json({ message: 'Task not found' });
    }

    tasks.splice(taskIndex, 1);

    // Emit to all connected clients
    io.emit('taskDeleted', taskId);

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Task deletion error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Quote Routes
app.get('/api/quotes/daily', async (req, res) => {
  try {
    const quotes = [
      { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
      { text: "Life is what happens to you while you're busy making other plans.", author: "John Lennon" },
      { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
      { text: "It is during our darkest moments that we must focus to see the light.", author: "Aristotle" },
      { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" }
    ];
    
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    res.json({ quote: randomQuote });
  } catch (error) {
    console.error('Quote error:', error);
    res.status(500).json({ message: 'Failed to fetch quote' });
  }
});

app.get('/api/quotes/random', async (req, res) => {
  try {
    const quotes = [
      { text: "Don't let yesterday take up too much of today.", author: "Will Rogers" },
      { text: "You learn more from failure than from success. Don't let it stop you.", author: "Unknown" },
      { text: "If you are working on something that you really care about, you don't have to be pushed.", author: "Steve Jobs" },
      { text: "Experience is the teacher of all things.", author: "Julius Caesar" },
      { text: "To live is the rarest thing in the world. Most people just exist.", author: "Oscar Wilde" }
    ];
    
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    res.json({ quote: randomQuote });
  } catch (error) {
    console.error('Quote error:', error);
    res.status(500).json({ message: 'Failed to fetch quote' });
  }
});

// AI Routes
app.get('/api/ai/tip', async (req, res) => {
  try {
    const tips = [
      "Break large tasks into smaller, manageable chunks to avoid feeling overwhelmed.",
      "Use the Pomodoro Technique: work for 25 minutes, then take a 5-minute break.",
      "Prioritize your tasks using the Eisenhower Matrix: urgent vs important.",
      "Set specific, measurable goals with clear deadlines.",
      "Eliminate distractions by turning off notifications during focused work time.",
      "Review and adjust your task list regularly to stay on track.",
      "Celebrate small wins to maintain motivation throughout your projects.",
      "Use time-blocking to dedicate specific hours to different types of work.",
      "Practice the 'two-minute rule': if it takes less than two minutes, do it now.",
      "Start your day with the most challenging task when your energy is highest."
    ];
    
    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    res.json({ tip: randomTip });
  } catch (error) {
    console.error('AI tip error:', error);
    res.status(500).json({ message: 'Failed to fetch productivity tip' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    users: users.length,
    tasks: tasks.length
  });
});

// Root endpoint
app.get('/api', (req, res) => {
  res.json({ 
    message: 'Task Manager API (In-Memory Mode)',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      tasks: '/api/tasks',
      quotes: '/api/quotes',
      ai: '/api/ai',
      health: '/health'
    }
  });
});

// Serve frontend for all non-API routes
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ message: 'API endpoint not found' });
  }
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`🔌 User connected: ${socket.id}`);
  
  socket.on('disconnect', () => {
    console.log(`🔌 User disconnected: ${socket.id}`);
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(error.status || 500).json({
    message: error.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

const PORT = process.env.PORT || 3002;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Frontend available at: http://localhost:${PORT}`);
  console.log(`🔗 API available at: http://localhost:${PORT}/api`);
  console.log(`💾 Using in-memory database (no MongoDB required)`);
  console.log('🎉 Task Manager is ready to use!');
});
