const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('./asyncHandler');
const { sendUnauthorized, sendForbidden } = require('../utils/apiResponse');

/**
 * Verify JWT token from Authorization header or httpOnly cookie.
 * Attaches req.user on success.
 */
const verifyToken = asyncHandler(async (req, res, next) => {
  let token;

  // Check Authorization header first (Bearer token)
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }
  // Fallback to httpOnly cookie
  else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return sendUnauthorized(res, 'No token provided. Please log in.');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password').lean();

    if (!user) {
      return sendUnauthorized(res, 'User no longer exists.');
    }

    if (user.status === 'Inactive') {
      return sendForbidden(res, 'Your account has been deactivated.');
    }

    req.user = user;
    next();
  } catch (err) {
    return sendUnauthorized(res, 'Invalid or expired token.');
  }
});

/**
 * Role-based access control factory.
 * Usage: authorize('admin', 'asset_manager')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendUnauthorized(res, 'Not authenticated.');
    }
    if (!roles.includes(req.user.role)) {
      return sendForbidden(
        res,
        `Access denied. Required roles: ${roles.join(', ')}. Your role: ${req.user.role}`
      );
    }
    next();
  };
};

/**
 * Shorthand role guards
 */
const isAdmin = authorize('admin');
const isAdminOrManager = authorize('admin', 'asset_manager');
const isAdminOrHead = authorize('admin', 'department_head');
const isAdminOrManagerOrHead = authorize('admin', 'asset_manager', 'department_head');

module.exports = {
  verifyToken,
  authorize,
  isAdmin,
  isAdminOrManager,
  isAdminOrHead,
  isAdminOrManagerOrHead,
};
