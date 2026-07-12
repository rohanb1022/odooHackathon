const { validationResult } = require('express-validator');
const Allocation = require('../models/Allocation');
const Asset = require('../models/Asset');
const User = require('../models/User');
const Department = require('../models/Department');
const asyncHandler = require('../middlewares/asyncHandler');
const activityLogService = require('../services/activityLog.service');
const { createNotification } = require('../services/notification.service');
const {
  sendSuccess,
  sendCreated,
  sendBadRequest,
  sendNotFound,
} = require('../utils/apiResponse');

// ─── Create Allocation (Assign Asset) ──────────────────────────────────────────

/**
 * @desc  Allocate an asset to a user
 * @route POST /api/v1/allocations
 * @access Admin, Asset Manager, Department Head
 */
exports.createAllocation = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return sendBadRequest(res, 'Validation failed', errors.array());

  const {
    assetId,
    allocatedTo,
    departmentId,
    expectedReturnDate,
    conditionAtAllocation,
    conditionNotes,
  } = req.body;

  // 1. Verify Asset exists and is not deleted
  const asset = await Asset.findOne({ _id: assetId, isDeleted: false });
  if (!asset) return sendNotFound(res, 'Asset not found');

  // 2. Business Rule: Asset must be Available for allocation
  if (asset.status !== 'Available') {
    return sendBadRequest(res, `Asset is not available for allocation. Current status is '${asset.status}'`);
  }

  // Double-check: prevent any active allocation from existing
  const existingActive = await Allocation.findOne({ assetId, status: 'Active' });
  if (existingActive) {
    return sendBadRequest(res, 'Asset already has an active allocation record. Return it first.');
  }

  // 3. Verify recipient user exists and is active
  const recipient = await User.findById(allocatedTo);
  if (!recipient) return sendNotFound(res, 'Recipient user not found');
  if (recipient.status !== 'Active') {
    return sendBadRequest(res, 'Cannot allocate asset to an inactive user account');
  }

  // 4. Verify department if explicitly passed, otherwise default to recipient's department
  let targetDepartmentId = departmentId || recipient.departmentId || null;
  if (targetDepartmentId) {
    const dept = await Department.findById(targetDepartmentId);
    if (!dept || dept.status === 'Inactive') {
      targetDepartmentId = null;
    }
  }

  // 5. Create Allocation record
  const allocation = await Allocation.create({
    assetId,
    allocatedTo,
    allocatedBy: req.user._id,
    departmentId: targetDepartmentId,
    expectedReturnDate: expectedReturnDate || null,
    conditionAtAllocation: conditionAtAllocation || asset.condition || 'Good',
    conditionNotes: conditionNotes || null,
    status: 'Active',
  });

  // 6. Update Asset status and assignedTo reference
  asset.status = 'Allocated';
  asset.assignedTo = recipient._id;
  if (targetDepartmentId) {
    asset.departmentId = targetDepartmentId;
  }
  await asset.save();

  // 7. Log activity
  await activityLogService.log({
    actorId: req.user._id,
    action: 'ASSET_ALLOCATED',
    targetModel: 'Allocation',
    targetId: allocation._id,
    meta: {
      assetId: asset._id,
      assetTag: asset.assetTag,
      assetName: asset.name,
      allocatedTo: recipient._id,
      recipientName: recipient.name,
    },
    ipAddress: activityLogService.getIp(req),
  });

  // 8. Send notification to recipient
  await createNotification(req.app.get('io') || null, {
    userId: recipient._id,
    type: 'Asset_Assigned',
    title: 'New Asset Assigned',
    message: `You have been assigned asset ${asset.assetTag} (${asset.name}).`,
    relatedId: allocation._id,
    relatedModel: 'Allocation',
  });

  const populated = await Allocation.findById(allocation._id)
    .populate('assetId', 'name assetTag categoryId serialNumber photo')
    .populate('allocatedTo', 'name email role avatar')
    .populate('allocatedBy', 'name email role')
    .populate('departmentId', 'name');

  return sendCreated(res, { allocation: populated }, `Asset ${asset.assetTag} allocated to ${recipient.name}`);
});

// ─── Return Allocation ─────────────────────────────────────────────────────────

/**
 * @desc  Mark an allocated asset as returned
 * @route POST /api/v1/allocations/return OR PATCH /api/v1/allocations/:id/return
 * @access Admin, Asset Manager, Department Head
 */
exports.returnAllocation = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return sendBadRequest(res, 'Validation failed', errors.array());

  const allocationId = req.params.id || req.body.allocationId;
  const { assetId, conditionAtReturn, conditionNotes } = req.body;

  let allocation;
  if (allocationId) {
    allocation = await Allocation.findById(allocationId);
  } else if (assetId) {
    allocation = await Allocation.findOne({ assetId, status: 'Active' });
  }

  if (!allocation) {
    return sendNotFound(res, 'Active allocation record not found');
  }

  if (allocation.status === 'Returned') {
    return sendBadRequest(res, 'This allocation record has already been marked as returned');
  }

  const asset = await Asset.findOne({ _id: allocation.assetId, isDeleted: false });
  if (!asset) {
    return sendNotFound(res, 'Associated asset not found');
  }

  // Update allocation
  allocation.actualReturnDate = new Date();
  allocation.status = 'Returned';
  if (conditionAtReturn) allocation.conditionAtReturn = conditionAtReturn;
  if (conditionNotes) {
    allocation.conditionNotes = allocation.conditionNotes
      ? `${allocation.conditionNotes} | Return Note: ${conditionNotes}`
      : conditionNotes;
  }
  await allocation.save();

  // Update asset
  asset.status = 'Available';
  asset.assignedTo = null;
  if (conditionAtReturn) asset.condition = conditionAtReturn;
  await asset.save();

  // Log activity
  await activityLogService.log({
    actorId: req.user._id,
    action: 'ASSET_RETURNED',
    targetModel: 'Allocation',
    targetId: allocation._id,
    meta: {
      assetId: asset._id,
      assetTag: asset.assetTag,
      assetName: asset.name,
      allocatedTo: allocation.allocatedTo,
      conditionAtReturn: conditionAtReturn || asset.condition,
    },
    ipAddress: activityLogService.getIp(req),
  });

  // Notify the user who held the asset
  await createNotification(req.app.get('io') || null, {
    userId: allocation.allocatedTo,
    type: 'Asset_Returned',
    title: 'Asset Returned',
    message: `Return of asset ${asset.assetTag} (${asset.name}) has been confirmed.`,
    relatedId: allocation._id,
    relatedModel: 'Allocation',
  });

  const populated = await Allocation.findById(allocation._id)
    .populate('assetId', 'name assetTag condition status')
    .populate('allocatedTo', 'name email')
    .populate('allocatedBy', 'name email');

  return sendSuccess(res, { allocation: populated }, `Asset ${asset.assetTag} marked as returned`);
});

// ─── Get All Allocations ───────────────────────────────────────────────────────

/**
 * @desc  List all allocations with filtering and pagination
 * @route GET /api/v1/allocations
 * @access All authenticated (regular employees see only their own or their dept's if head)
 */
exports.getAllocations = asyncHandler(async (req, res) => {
  const { userId, assetId, status, departmentId, page = 1, limit = 20 } = req.query;

  const filter = {};

  // Role-based scoping: regular employees only see their own allocations
  if (req.user.role === 'employee') {
    filter.allocatedTo = req.user._id;
  } else if (userId) {
    filter.allocatedTo = userId;
  }

  if (assetId) filter.assetId = assetId;
  if (status) filter.status = status;
  if (departmentId) filter.departmentId = departmentId;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await Allocation.countDocuments(filter);

  const allocations = await Allocation.find(filter)
    .populate('assetId', 'name assetTag categoryId serialNumber status photo condition')
    .populate('allocatedTo', 'name email role avatar departmentId')
    .populate('allocatedBy', 'name email role')
    .populate('departmentId', 'name')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .lean();

  return sendSuccess(res, {
    total,
    page: parseInt(page),
    limit: parseInt(limit),
    pages: Math.ceil(total / parseInt(limit)),
    count: allocations.length,
    allocations,
  }, 'Allocations fetched successfully');
});

// ─── Get Single Allocation By ID ───────────────────────────────────────────────

/**
 * @desc  Get single allocation detail by ID
 * @route GET /api/v1/allocations/:id
 * @access All authenticated
 */
exports.getAllocationById = asyncHandler(async (req, res) => {
  const allocation = await Allocation.findById(req.params.id)
    .populate('assetId', 'name assetTag categoryId serialNumber status photo condition location')
    .populate('allocatedTo', 'name email role avatar departmentId')
    .populate('allocatedBy', 'name email role')
    .populate('departmentId', 'name status')
    .lean();

  if (!allocation) return sendNotFound(res, 'Allocation not found');

  // If regular employee, check they own this allocation
  if (req.user.role === 'employee' && allocation.allocatedTo._id.toString() !== req.user._id.toString()) {
    return sendNotFound(res, 'Allocation not found');
  }

  return sendSuccess(res, { allocation }, 'Allocation detail fetched successfully');
});

// ─── Get Overdue Allocations ───────────────────────────────────────────────────

/**
 * @desc  List allocations past their expectedReturnDate
 * @route GET /api/v1/allocations/overdue
 * @access Admin, Asset Manager, Department Head
 */
exports.getOverdueAllocations = asyncHandler(async (req, res) => {
  const now = new Date();

  const filter = {
    status: 'Active',
    expectedReturnDate: { $ne: null, $lt: now },
  };

  const overdue = await Allocation.find(filter)
    .populate('assetId', 'name assetTag categoryId status condition location')
    .populate('allocatedTo', 'name email role avatar departmentId')
    .populate('allocatedBy', 'name email role')
    .sort({ expectedReturnDate: 1 })
    .lean();

  return sendSuccess(res, {
    count: overdue.length,
    allocations: overdue,
  }, 'Overdue allocations fetched successfully');
});
