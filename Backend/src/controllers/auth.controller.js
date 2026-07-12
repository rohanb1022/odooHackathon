const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const asyncHandler = require('../middlewares/asyncHandler');
const activityLogService = require('../services/activityLog.service');
const {
  sendSuccess,
  sendCreated,
  sendBadRequest,
  sendUnauthorized,
} = require('../utils/apiResponse');

// ─── Helper ────────────────────────────────────────────────────────────────────

/**
 * Signs a JWT and sets it as an httpOnly cookie.
 * Also returns the token in the response body for Authorization header usage.
 */
const signAndSendToken = (user, res, statusCode = 200, message = 'Success') => {
  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
  };

  res.cookie('token', token, cookieOptions);

  const userPayload = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    departmentId: user.departmentId,
    avatar: user.avatar,
    createdAt: user.createdAt,
  };

  return res.status(statusCode).json({
    success: true,
    message,
    token,
    user: userPayload,
  });
};

// ─── Controllers ───────────────────────────────────────────────────────────────

/**
 * @desc  Register a new employee (role is always 'employee', no self-elevation)
 * @route POST /api/v1/auth/register
 * @access Public
 */
const register = asyncHandler(async (req, res) => {
  // Validate request body
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendBadRequest(res, 'Validation failed', errors.array());
  }

  const { name, email, password, departmentId } = req.body;

  // Check duplicate email
  const existing = await User.findOne({ email });
  if (existing) {
    return sendBadRequest(res, 'An account with this email already exists.');
  }

  // Create user — role is always 'employee' regardless of request body
  const user = await User.create({
    name,
    email,
    password,
    departmentId: departmentId || null,
    role: 'employee',
  });

  // Log activity
  await activityLogService.log({
    actorId: user._id,
    action: 'USER_REGISTERED',
    targetModel: 'User',
    targetId: user._id,
    meta: { email: user.email },
    ipAddress: activityLogService.getIp(req),
  });

  return signAndSendToken(user, res, 201, 'Account created successfully');
});

/**
 * @desc  Login with email & password
 * @route POST /api/v1/auth/login
 * @access Public
 */
const login = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendBadRequest(res, 'Validation failed', errors.array());
  }

  const { email, password } = req.body;

  // Explicitly select password since it is excluded by default
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.matchPassword(password))) {
    return sendUnauthorized(res, 'Invalid email or password.');
  }

  if (user.status === 'Inactive') {
    return sendUnauthorized(res, 'Your account has been deactivated. Please contact an administrator.');
  }

  // Log activity
  await activityLogService.log({
    actorId: user._id,
    action: 'USER_LOGIN',
    targetModel: 'User',
    targetId: user._id,
    ipAddress: activityLogService.getIp(req),
  });

  return signAndSendToken(user, res, 200, 'Logged in successfully');
});

/**
 * @desc  Logout — clears cookie
 * @route POST /api/v1/auth/logout
 * @access Private
 */
const logout = asyncHandler(async (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0),
  });

  await activityLogService.log({
    actorId: req.user._id,
    action: 'USER_LOGOUT',
    targetModel: 'User',
    targetId: req.user._id,
    ipAddress: activityLogService.getIp(req),
  });

  return sendSuccess(res, {}, 'Logged out successfully');
});

/**
 * @desc  Get current logged-in user profile
 * @route GET /api/v1/auth/me
 * @access Private
 */
const getMe = asyncHandler(async (req, res) => {
  // Populate department info
  const user = await User.findById(req.user._id)
    .populate('departmentId', 'name status')
    .lean();

  return sendSuccess(res, { user }, 'Profile fetched successfully');
});

module.exports = { register, login, logout, getMe };
