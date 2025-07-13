const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

console.log('🔧 Starting Task Manager server (No DB mode)...');

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Test routes (no database required)
app.get('/', (req, res) => {
  res.json({ 
    message: 'Task Manager API - No DB Mode',
    version: '1.0.0',
    status: 'Server running successfully!',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      quotes: '/api/quotes/random'
    }
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK',
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Simple quotes endpoint (no external API)
app.get('/api/quotes/random', (req, res) => {
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
    }
  ];
  
  const randomQuote = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
  
  res.json({
    success: true,
    data: { quote: randomQuote }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    requestedPath: req.originalUrl,
    availableRoutes: ['/', '/health', '/api/quotes/random']
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message 
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 Task Manager server running on port ${PORT}`);
  console.log(`🌐 Open: http://localhost:${PORT}`);
  console.log(`💡 Test quotes: http://localhost:${PORT}/api/quotes/random`);
  console.log(`🔍 Health check: http://localhost:${PORT}/health`);
}).on('error', (err) => {
  console.error('❌ Server startup error:', err.message);
  
  if (err.code === 'EADDRINUSE') {
    console.log(`⚠️ Port ${PORT} is already in use.`);
    console.log('💡 Solutions:');
    console.log('   1. Kill the process using the port');
    console.log('   2. Change PORT in .env to a different number (e.g., 3002)');
    console.log('   3. Run: netstat -ano | findstr :' + PORT);
  }
  
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});
