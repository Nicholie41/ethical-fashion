const jwt = require('jsonwebtoken');

// Ensure the JWT secret is set at startup
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  throw new Error("JWT_SECRET environment variable is not set");
}

/**
 * Middleware to authenticate JWT and attach req.user.
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  jwt.verify(token, jwtSecret, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

/**
 * Role-based authorization middleware (single role).
 * Usage: authorizeRole('admin')
 */
function authorizeRole(role) {
  return (req, res, next) => {
    if (req.user && req.user.role === role) {
      next();
    } else {
      res.status(403).json({ error: 'Forbidden: Insufficient privileges' });
    }
  };
}

/**
 * Role-based authorization middleware (multiple roles).
 * Usage: authorizeRoles(['admin', 'supplier'])
 */
function authorizeRoles(roles) {
  return (req, res, next) => {
    if (req.user && roles.includes(req.user.role)) {
      next();
    } else {
      res.status(403).json({ error: 'Forbidden: Insufficient privileges' });
    }
  };
}

module.exports = { authenticateToken, authorizeRole, authorizeRoles };