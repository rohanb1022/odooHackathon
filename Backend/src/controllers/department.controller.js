const { validationResult } = require('express-validator');
const Department = require('../models/Department');
const User = require('../models/User');
const asyncHandler = require('../middlewares/asyncHandler');
const activityLogService = require('../services/activityLog.service');
const {
  sendSuccess,
  sendCreated,
  sendBadRequest,
  sendNotFound,
} = require('../utils/apiResponse');

// ─── Create Department ──────────────────────────────────────────────────────────

/**
 * @desc  Create a new department
 * @route POST /api/v1/departments
 * @access Admin
 */
exports.createDepartment = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return sendBadRequest(res, 'Validation failed', errors.array());

  const { name, parentDepartment, headId, status, description } = req.body;

  // Validate parent exists if provided
  if (parentDepartment) {
    const parent = await Department.findById(parentDepartment);
    if (!parent) return sendNotFound(res, 'Parent department not found');
  }

  // Validate head user exists if provided
  if (headId) {
    const head = await User.findById(headId);
    if (!head) return sendNotFound(res, 'Head user not found');
  }

  const department = await Department.create({ name, parentDepartment, headId, status, description });

  // If headId set, auto-promote user to department_head if they're an employee
  if (headId) {
    const headUser = await User.findById(headId);
    if (headUser && headUser.role === 'employee') {
      await User.findByIdAndUpdate(headId, { role: 'department_head', departmentId: department._id });
    }
  }

  await activityLogService.log({
    actorId: req.user._id,
    action: 'DEPARTMENT_CREATED',
    targetModel: 'Department',
    targetId: department._id,
    meta: { name: department.name },
    ipAddress: activityLogService.getIp(req),
  });

  return sendCreated(res, { department }, 'Department created successfully');
});

// ─── Get All Departments ───────────────────────────────────────────────────────

/**
 * @desc  Get all departments (with optional status filter)
 * @route GET /api/v1/departments
 * @access All authenticated
 */
exports.getAllDepartments = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;

  const departments = await Department.find(filter)
    .populate('parentDepartment', 'name')
    .populate('headId', 'name email role')
    .sort({ name: 1 })
    .lean();

  return sendSuccess(res, { count: departments.length, departments }, 'Departments fetched successfully');
});

// ─── Get Department By ID ──────────────────────────────────────────────────────

/**
 * @desc  Get single department with members count
 * @route GET /api/v1/departments/:id
 * @access All authenticated
 */
exports.getDepartmentById = asyncHandler(async (req, res) => {
  const department = await Department.findById(req.params.id)
    .populate('parentDepartment', 'name status')
    .populate('headId', 'name email role avatar')
    .lean();

  if (!department) return sendNotFound(res, 'Department not found');

  // Count members in this department
  const memberCount = await User.countDocuments({ departmentId: req.params.id, status: 'Active' });
  const members = await User.find({ departmentId: req.params.id })
    .select('name email role status avatar')
    .lean();

  return sendSuccess(res, { department: { ...department, memberCount, members } }, 'Department fetched successfully');
});

// ─── Update Department ─────────────────────────────────────────────────────────

/**
 * @desc  Update department
 * @route PATCH /api/v1/departments/:id
 * @access Admin
 */
exports.updateDepartment = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return sendBadRequest(res, 'Validation failed', errors.array());

  const { name, parentDepartment, headId, status, description } = req.body;

  const department = await Department.findById(req.params.id);
  if (!department) return sendNotFound(res, 'Department not found');

  // Prevent circular parent (dept can't be its own parent)
  if (parentDepartment && parentDepartment.toString() === req.params.id) {
    return sendBadRequest(res, 'A department cannot be its own parent');
  }

  if (parentDepartment) {
    const parent = await Department.findById(parentDepartment);
    if (!parent) return sendNotFound(res, 'Parent department not found');
  }

  // Handle head change — promote new head if needed
  if (headId && headId.toString() !== department.headId?.toString()) {
    const newHead = await User.findById(headId);
    if (!newHead) return sendNotFound(res, 'Head user not found');
    if (newHead.role === 'employee') {
      await User.findByIdAndUpdate(headId, { role: 'department_head', departmentId: department._id });
    }
  }

  const oldName = department.name;
  if (name !== undefined) department.name = name;
  if (parentDepartment !== undefined) department.parentDepartment = parentDepartment || null;
  if (headId !== undefined) department.headId = headId || null;
  if (status !== undefined) department.status = status;
  if (description !== undefined) department.description = description;

  await department.save();

  await activityLogService.log({
    actorId: req.user._id,
    action: 'DEPARTMENT_UPDATED',
    targetModel: 'Department',
    targetId: department._id,
    meta: { oldName, newName: department.name },
    ipAddress: activityLogService.getIp(req),
  });

  const updated = await Department.findById(req.params.id)
    .populate('parentDepartment', 'name')
    .populate('headId', 'name email role');

  return sendSuccess(res, { department: updated }, 'Department updated successfully');
});

// ─── Delete / Deactivate Department ───────────────────────────────────────────

/**
 * @desc  Deactivate a department (soft delete — sets status to Inactive)
 * @route DELETE /api/v1/departments/:id
 * @access Admin
 */
exports.deleteDepartment = asyncHandler(async (req, res) => {
  const department = await Department.findById(req.params.id);
  if (!department) return sendNotFound(res, 'Department not found');

  // Check if any active users still belong to this department
  const activeMembers = await User.countDocuments({ departmentId: req.params.id, status: 'Active' });
  if (activeMembers > 0) {
    return sendBadRequest(res, `Cannot deactivate department with ${activeMembers} active member(s). Reassign them first.`);
  }

  department.status = 'Inactive';
  await department.save();

  await activityLogService.log({
    actorId: req.user._id,
    action: 'DEPARTMENT_DEACTIVATED',
    targetModel: 'Department',
    targetId: department._id,
    meta: { name: department.name },
    ipAddress: activityLogService.getIp(req),
  });

  return sendSuccess(res, { department }, 'Department deactivated successfully');
});
