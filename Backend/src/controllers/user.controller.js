const { validationResult } = require('express-validator');
const User = require('../models/User');
const Department = require('../models/Department');
const asyncHandler = require('../middlewares/asyncHandler');
const activityLogService = require('../services/activityLog.service');
const {
  sendSuccess,
  sendBadRequest,
  sendNotFound,
  sendForbidden,
} = require('../utils/apiResponse');

// ─── Get All Users ─────────────────────────────────────────────────────────────

/**
 * @desc  Get all users with optional filters
 * @route GET /api/v1/users
 * @access Admin, Asset Manager
 * @query role, status, departmentId, search
 */
exports.getAllUsers = asyncHandler(async (req, res) => {
  const { role, status, departmentId, search } = req.query;

  const filter = {};
  if (role) filter.role = role;
  if (status) filter.status = status;
  if (departmentId) filter.departmentId = departmentId;

  // Name / email search
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const users = await User.find(filter)
    .populate('departmentId', 'name status')
    .select('-password')
    .sort({ createdAt: -1 })
    .lean();

  return sendSuccess(res, { count: users.length, users }, 'Users fetched successfully');
});

// ─── Get User By ID ────────────────────────────────────────────────────────────

/**
 * @desc  Get single user by ID
 * @route GET /api/v1/users/:id
 * @access Admin, Asset Manager
 */
exports.getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .populate('departmentId', 'name status headId')
    .select('-password')
    .lean();

  if (!user) return sendNotFound(res, 'User not found');

  return sendSuccess(res, { user }, 'User fetched successfully');
});

// ─── Promote User ──────────────────────────────────────────────────────────────

/**
 * @desc  Promote/demote a user's role (Admin only)
 *        This is the ONLY place roles are assigned — no self-elevation
 * @route PATCH /api/v1/users/:id/promote
 * @access Admin
 */
exports.promoteUser = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return sendBadRequest(res, 'Validation failed', errors.array());

  const { role } = req.body;

  // Prevent admin from demoting themselves
  if (req.params.id === req.user._id.toString()) {
    return sendForbidden(res, 'You cannot change your own role');
  }

  const user = await User.findById(req.params.id);
  if (!user) return sendNotFound(res, 'User not found');

  const oldRole = user.role;
  user.role = role;
  await user.save();

  // If promoting to department_head and user has a department, reflect in Department.headId
  if (role === 'department_head' && user.departmentId) {
    await Department.findByIdAndUpdate(user.departmentId, { headId: user._id });
  }

  // If demoting from department_head, remove them as department head
  if (oldRole === 'department_head' && role !== 'department_head') {
    await Department.updateMany({ headId: user._id }, { $set: { headId: null } });
  }

  await activityLogService.log({
    actorId: req.user._id,
    action: 'USER_PROMOTED',
    targetModel: 'User',
    targetId: user._id,
    meta: { userId: user._id, userName: user.name, oldRole, newRole: role },
    ipAddress: activityLogService.getIp(req),
  });

  const updated = await User.findById(req.params.id)
    .populate('departmentId', 'name')
    .select('-password');

  return sendSuccess(res, { user: updated }, `User role updated from '${oldRole}' to '${role}'`);
});

// ─── Update User Status ────────────────────────────────────────────────────────

/**
 * @desc  Activate or deactivate a user account (Admin only)
 * @route PATCH /api/v1/users/:id/status
 * @access Admin
 */
exports.updateUserStatus = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return sendBadRequest(res, 'Validation failed', errors.array());

  const { status } = req.body;

  // Prevent self-deactivation
  if (req.params.id === req.user._id.toString()) {
    return sendForbidden(res, 'You cannot change your own account status');
  }

  const user = await User.findById(req.params.id);
  if (!user) return sendNotFound(res, 'User not found');

  const oldStatus = user.status;
  user.status = status;
  await user.save();

  await activityLogService.log({
    actorId: req.user._id,
    action: status === 'Active' ? 'USER_ACTIVATED' : 'USER_DEACTIVATED',
    targetModel: 'User',
    targetId: user._id,
    meta: { userName: user.name, oldStatus, newStatus: status },
    ipAddress: activityLogService.getIp(req),
  });

  const updated = await User.findById(req.params.id)
    .populate('departmentId', 'name')
    .select('-password');

  return sendSuccess(res, { user: updated }, `User account ${status === 'Active' ? 'activated' : 'deactivated'} successfully`);
});
