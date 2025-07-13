const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to authenticate JWT tokens
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        error: 'Access denied. No token provided.' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user and check if still active
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({ 
        error: 'Access denied. User not found or inactive.' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Access denied. Invalid token.' 
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Access denied. Token expired.' 
      });
    }
    
    console.error('Auth middleware error:', error);
    res.status(500).json({ 
      error: 'Internal server error during authentication.' 
    });
  }
};

// Middleware to check user roles
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required.' 
      });
    }

    // Convert single role to array
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Access denied. Insufficient permissions.',
        required: allowedRoles,
        current: req.user.role
      });
    }

    next();
  };
};

// Middleware to check if user has minimum role level
const requireMinRole = (minRole) => {
  const roleHierarchy = {
    user: 0,
    manager: 1,
    admin: 2
  };

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required.' 
      });
    }

    const userRoleLevel = roleHierarchy[req.user.role];
    const requiredLevel = roleHierarchy[minRole];

    if (userRoleLevel < requiredLevel) {
      return res.status(403).json({ 
        error: 'Access denied. Insufficient permissions.',
        required: minRole,
        current: req.user.role
      });
    }

    next();
  };
};

// Middleware to check if user owns resource or has admin/manager role
const requireOwnershipOrRole = (roles = ['admin', 'manager']) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required.' 
      });
    }

    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    
    // Check if user has required role
    if (allowedRoles.includes(req.user.role)) {
      return next();
    }

    // Check ownership (resource should have owner field in req.resource)
    if (req.resource && req.resource.owner && 
        req.resource.owner.toString() === req.user._id.toString()) {
      return next();
    }

    return res.status(403).json({ 
      error: 'Access denied. You can only access your own resources or need higher privileges.' 
    });
  };
};

// Socket.io authentication middleware
const authenticateSocket = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user and check if still active
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      return next(new Error('Authentication error: User not found or inactive'));
    }

    socket.userId = user._id.toString();
    socket.user = user;
    next();
  } catch (error) {
    console.error('Socket authentication error:', error);
    next(new Error('Authentication error: Invalid token'));
  }
};

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};

// Verify JWT token (utility function)
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = {
  authenticateToken,
  requireRole,
  requireMinRole,
  requireOwnershipOrRole,
  authenticateSocket,
  generateToken,
  verifyToken
};
