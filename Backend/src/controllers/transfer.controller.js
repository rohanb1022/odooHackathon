const { validationResult } = require('express-validator');
const TransferRequest = require('../models/TransferRequest');
const Allocation = require('../models/Allocation');
const Asset = require('../models/Asset');
const User = require('../models/User');
const asyncHandler = require('../middlewares/asyncHandler');
const activityLogService = require('../services/activityLog.service');
const { createNotification, notifyMany } = require('../services/notification.service');
const {
  sendSuccess,
  sendCreated,
  sendBadRequest,
  sendNotFound,
} = require('../utils/apiResponse');

// ─── Create Transfer Request ───────────────────────────────────────────────────

/**
 * @desc  Request to transfer an asset to another user
 * @route POST /api/v1/transfer-requests
 * @access All authenticated
 */
exports.createTransferRequest = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return sendBadRequest(res, 'Validation failed', errors.array());

  const { assetId, toUserId, reason } = req.body;

  // 1. Verify Asset exists and is not deleted
  const asset = await Asset.findOne({ _id: assetId, isDeleted: false });
  if (!asset) return sendNotFound(res, 'Asset not found');

  // 2. Verify target user exists and is active
  const targetUser = await User.findById(toUserId);
  if (!targetUser) return sendNotFound(res, 'Target user (toUserId) not found');
  if (targetUser.status !== 'Active') {
    return sendBadRequest(res, 'Cannot transfer asset to an inactive user account');
  }

  // 3. Determine current holder (fromUserId) from asset or active allocation
  let fromUserId = asset.assignedTo || null;
  const activeAllocation = await Allocation.findOne({ assetId, status: 'Active' });
  if (activeAllocation) {
    fromUserId = activeAllocation.allocatedTo;
  }

  // Prevent transferring to the same person holding it right now
  if (fromUserId && fromUserId.toString() === toUserId.toString()) {
    return sendBadRequest(res, 'Asset is already assigned to the target user');
  }

  // 4. Prevent duplicate pending requests for this asset
  const existingPending = await TransferRequest.findOne({ assetId, status: 'Requested' });
  if (existingPending) {
    return sendBadRequest(res, 'This asset already has a pending transfer request under review');
  }

  // 5. Create TransferRequest
  const transfer = await TransferRequest.create({
    assetId,
    requestedBy: req.user._id,
    fromUserId: fromUserId,
    toUserId,
    reason: reason || 'No reason specified',
    status: 'Requested',
  });

  // 6. Log activity
  await activityLogService.log({
    actorId: req.user._id,
    action: 'TRANSFER_REQUESTED',
    targetModel: 'TransferRequest',
    targetId: transfer._id,
    meta: {
      assetId: asset._id,
      assetTag: asset.assetTag,
      assetName: asset.name,
      fromUserId,
      toUserId,
      reason,
    },
    ipAddress: activityLogService.getIp(req),
  });

  // 7. Notify target recipient (and current holder if different from requester)
  const notifyIds = [toUserId];
  if (fromUserId && fromUserId.toString() !== req.user._id.toString() && fromUserId.toString() !== toUserId.toString()) {
    notifyIds.push(fromUserId);
  }
  await notifyMany(req.app.get('io') || null, notifyIds, {
    type: 'Transfer_Requested',
    title: 'Asset Transfer Requested',
    message: `Transfer of asset ${asset.assetTag} (${asset.name}) to ${targetUser.name} has been requested.`,
    relatedId: transfer._id,
    relatedModel: 'TransferRequest',
  });

  const populated = await TransferRequest.findById(transfer._id)
    .populate('assetId', 'name assetTag categoryId serialNumber status photo')
    .populate('requestedBy', 'name email role avatar')
    .populate('fromUserId', 'name email role avatar')
    .populate('toUserId', 'name email role avatar departmentId');

  return sendCreated(res, { transferRequest: populated }, 'Transfer request submitted successfully');
});

// ─── Get All Transfer Requests ─────────────────────────────────────────────────

/**
 * @desc  List all transfer requests with filtering and pagination
 * @route GET /api/v1/transfer-requests
 * @access All authenticated
 */
exports.getAllTransferRequests = asyncHandler(async (req, res) => {
  const { status, assetId, fromUserId, toUserId, requestedBy, page = 1, limit = 20 } = req.query;

  const filter = {};

  // Regular employee scoping
  if (req.user.role === 'employee') {
    filter.$or = [
      { requestedBy: req.user._id },
      { fromUserId: req.user._id },
      { toUserId: req.user._id },
    ];
  } else {
    if (fromUserId) filter.fromUserId = fromUserId;
    if (toUserId) filter.toUserId = toUserId;
    if (requestedBy) filter.requestedBy = requestedBy;
  }

  if (status) filter.status = status;
  if (assetId) filter.assetId = assetId;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await TransferRequest.countDocuments(filter);

  const transferRequests = await TransferRequest.find(filter)
    .populate('assetId', 'name assetTag categoryId status photo')
    .populate('requestedBy', 'name email role avatar')
    .populate('fromUserId', 'name email role avatar')
    .populate('toUserId', 'name email role avatar departmentId')
    .populate('reviewedBy', 'name email role')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .lean();

  return sendSuccess(res, {
    total,
    page: parseInt(page),
    limit: parseInt(limit),
    pages: Math.ceil(total / parseInt(limit)),
    count: transferRequests.length,
    transferRequests,
  }, 'Transfer requests fetched successfully');
});

// ─── Get Single Transfer Request By ID ─────────────────────────────────────────

/**
 * @desc  Get detail of a transfer request
 * @route GET /api/v1/transfer-requests/:id
 * @access All authenticated
 */
exports.getTransferRequestById = asyncHandler(async (req, res) => {
  const transfer = await TransferRequest.findById(req.params.id)
    .populate('assetId', 'name assetTag categoryId status condition location photo')
    .populate('requestedBy', 'name email role avatar')
    .populate('fromUserId', 'name email role avatar departmentId')
    .populate('toUserId', 'name email role avatar departmentId')
    .populate('reviewedBy', 'name email role')
    .lean();

  if (!transfer) return sendNotFound(res, 'Transfer request not found');

  if (req.user.role === 'employee') {
    const isOwner =
      transfer.requestedBy?._id?.toString() === req.user._id.toString() ||
      transfer.fromUserId?._id?.toString() === req.user._id.toString() ||
      transfer.toUserId?._id?.toString() === req.user._id.toString();

    if (!isOwner) return sendNotFound(res, 'Transfer request not found');
  }

  return sendSuccess(res, { transferRequest: transfer }, 'Transfer request detail fetched successfully');
});

// ─── Approve Transfer Request ──────────────────────────────────────────────────

/**
 * @desc  Approve a pending transfer request, completing the reallocation
 * @route PATCH /api/v1/transfer-requests/:id/approve
 * @access Admin, Asset Manager
 */
exports.approveTransferRequest = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return sendBadRequest(res, 'Validation failed', errors.array());

  const { reviewNote } = req.body;

  const transfer = await TransferRequest.findById(req.params.id);
  if (!transfer) return sendNotFound(res, 'Transfer request not found');
  if (transfer.status !== 'Requested') {
    return sendBadRequest(res, `Transfer request is not pending under review. Current status: '${transfer.status}'`);
  }

  const asset = await Asset.findOne({ _id: transfer.assetId, isDeleted: false });
  if (!asset) return sendNotFound(res, 'Associated asset not found');

  const targetUser = await User.findById(transfer.toUserId);
  if (!targetUser || targetUser.status !== 'Active') {
    return sendBadRequest(res, 'Target user is no longer active or could not be found');
  }

  // 1. Close out current active allocation if any exists
  const currentAllocation = await Allocation.findOne({ assetId: asset._id, status: 'Active' });
  if (currentAllocation) {
    currentAllocation.actualReturnDate = new Date();
    currentAllocation.status = 'Returned';
    currentAllocation.conditionNotes = currentAllocation.conditionNotes
      ? `${currentAllocation.conditionNotes} | Transferred via Request ${transfer._id}`
      : `Transferred via Request ${transfer._id}`;
    await currentAllocation.save();
  }

  // 2. Create new active allocation for target user
  const newAllocation = await Allocation.create({
    assetId: asset._id,
    allocatedTo: targetUser._id,
    allocatedBy: req.user._id,
    departmentId: targetUser.departmentId || null,
    conditionAtAllocation: asset.condition || 'Good',
    conditionNotes: reviewNote || transfer.reason || 'Allocated via Transfer Request',
    status: 'Active',
  });

  // 3. Update Asset
  asset.status = 'Allocated';
  asset.assignedTo = targetUser._id;
  if (targetUser.departmentId) {
    asset.departmentId = targetUser.departmentId;
  }
  await asset.save();

  // 4. Update TransferRequest status
  transfer.status = 'Approved';
  transfer.reviewedBy = req.user._id;
  transfer.reviewNote = reviewNote || 'Transfer approved and asset reallocated.';
  await transfer.save();

  // 5. Log activity
  await activityLogService.log({
    actorId: req.user._id,
    action: 'TRANSFER_APPROVED',
    targetModel: 'TransferRequest',
    targetId: transfer._id,
    meta: {
      assetId: asset._id,
      assetTag: asset.assetTag,
      fromUserId: transfer.fromUserId,
      toUserId: transfer.toUserId,
      newAllocationId: newAllocation._id,
    },
    ipAddress: activityLogService.getIp(req),
  });

  // 6. Notify relevant parties
  const notifyIds = [transfer.requestedBy, transfer.toUserId];
  if (transfer.fromUserId) notifyIds.push(transfer.fromUserId);
  const uniqueIds = [...new Set(notifyIds.map((id) => id?.toString()))].filter(Boolean);

  await notifyMany(req.app.get('io') || null, uniqueIds, {
    type: 'Transfer_Approved',
    title: 'Transfer Approved',
    message: `Transfer of ${asset.assetTag} (${asset.name}) to ${targetUser.name} has been approved.`,
    relatedId: transfer._id,
    relatedModel: 'TransferRequest',
  });

  const populated = await TransferRequest.findById(transfer._id)
    .populate('assetId', 'name assetTag categoryId status')
    .populate('requestedBy', 'name email')
    .populate('fromUserId', 'name email')
    .populate('toUserId', 'name email departmentId')
    .populate('reviewedBy', 'name email role');

  return sendSuccess(res, { transferRequest: populated, allocation: newAllocation }, `Transfer approved. ${asset.assetTag} reallocated to ${targetUser.name}`);
});

// ─── Reject Transfer Request ───────────────────────────────────────────────────

/**
 * @desc  Reject a pending transfer request
 * @route PATCH /api/v1/transfer-requests/:id/reject
 * @access Admin, Asset Manager
 */
exports.rejectTransferRequest = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return sendBadRequest(res, 'Validation failed', errors.array());

  const { reviewNote } = req.body;

  const transfer = await TransferRequest.findById(req.params.id);
  if (!transfer) return sendNotFound(res, 'Transfer request not found');
  if (transfer.status !== 'Requested') {
    return sendBadRequest(res, `Transfer request is not pending under review. Current status: '${transfer.status}'`);
  }

  const asset = await Asset.findOne({ _id: transfer.assetId, isDeleted: false });

  // Update status
  transfer.status = 'Rejected';
  transfer.reviewedBy = req.user._id;
  transfer.reviewNote = reviewNote || 'Transfer request rejected.';
  await transfer.save();

  // Log activity
  await activityLogService.log({
    actorId: req.user._id,
    action: 'TRANSFER_REJECTED',
    targetModel: 'TransferRequest',
    targetId: transfer._id,
    meta: {
      assetId: transfer.assetId,
      assetTag: asset?.assetTag || 'Unknown',
      fromUserId: transfer.fromUserId,
      toUserId: transfer.toUserId,
      reviewNote,
    },
    ipAddress: activityLogService.getIp(req),
  });

  // Notify parties
  const notifyIds = [transfer.requestedBy, transfer.toUserId];
  if (transfer.fromUserId) notifyIds.push(transfer.fromUserId);
  const uniqueIds = [...new Set(notifyIds.map((id) => id?.toString()))].filter(Boolean);

  await notifyMany(req.app.get('io') || null, uniqueIds, {
    type: 'Transfer_Rejected',
    title: 'Transfer Rejected',
    message: `Transfer request for ${asset?.assetTag || 'asset'} has been rejected: ${transfer.reviewNote}`,
    relatedId: transfer._id,
    relatedModel: 'TransferRequest',
  });

  const populated = await TransferRequest.findById(transfer._id)
    .populate('assetId', 'name assetTag categoryId status')
    .populate('requestedBy', 'name email')
    .populate('fromUserId', 'name email')
    .populate('toUserId', 'name email')
    .populate('reviewedBy', 'name email role');

  return sendSuccess(res, { transferRequest: populated }, 'Transfer request rejected successfully');
});
