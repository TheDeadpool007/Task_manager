// Simple test server to debug issues
const express = require('express');
require('dotenv').config();

console.log('🔧 Starting debug server...');

const app = express();
const PORT = process.env.PORT || 5000;

// Basic middleware
app.use(express.json());

// Test route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Debug server is working!',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK',
    message: 'Debug server health check passed'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Debug server running on port ${PORT}`);
  console.log(`🌐 Test URL: http://localhost:${PORT}`);
}).on('error', (err) => {
  console.error('❌ Server startup error:', err.message);
  
  if (err.code === 'EADDRINUSE') {
    console.log(`⚠️ Port ${PORT} is already in use. Try a different port.`);
    console.log('💡 Edit .env file and change PORT=5000 to PORT=3001');
  }
  
  process.exit(1);
});
