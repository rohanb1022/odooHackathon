const { validationResult } = require('express-validator');
const MaintenanceRequest = require('../models/MaintenanceRequest');
const Asset = require('../models/Asset');
const asyncHandler = require('../middlewares/asyncHandler');
const activityLogService = require('../services/activityLog.service');
const { uploadBufferToCloudinary } = require('../services/upload.service');
const { createNotification } = require('../services/notification.service');
const mlService = require('../services/ml.service');
const {
  sendSuccess,
  sendCreated,
  sendBadRequest,
  sendNotFound,
} = require('../utils/apiResponse');

// ─── Raise Maintenance ─────────────────────────────────────────────────────────

/**
 * @desc  Create a new maintenance request for an asset
 * @route POST /api/v1/maintenance
 * @access Authenticated (All roles)
 */
exports.raiseMaintenance = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return sendBadRequest(res, 'Validation failed', errors.array());

  let { assetId, description, priority, photo } = req.body;

  const asset = await Asset.findById(assetId).populate('categoryId', 'name');
  if (!asset || asset.isDeleted) {
    return sendNotFound(res, 'Asset not found');
  }

  // Check if image buffer was uploaded via Multer
  const photoFile = req.file || req.files?.photo?.[0] || req.files?.image?.[0];
  if (photoFile) {
    try {
      const uploadRes = await uploadBufferToCloudinary(photoFile.buffer, {
        folder: 'assetflow/maintenance',
        resourceType: 'image',
      });
      photo = uploadRes.secure_url;
    } catch (err) {
      console.warn('[MaintenanceController] Photo upload failed, continuing without photo:', err.message);
    }
  }

  // Run AI Diagnostic analysis
  let aiDiagnostic = null;
  try {
    const aiResult = await mlService.analyzeMaintenance({
      description,
      asset: {
        name: asset.name,
        condition: asset.condition,
        categoryId: asset.categoryId,
        manufacturer: asset.manufacturer,
        modelNumber: asset.modelNumber,
        location: asset.location
      }
    });
    if (aiResult && aiResult.success && aiResult.data) {
      aiDiagnostic = {
        recommendedPriority: aiResult.data.recommendedPriority,
        probableCauses: aiResult.data.probableCauses,
        suggestedActions: aiResult.data.suggestedActions,
        suggestedSpareParts: aiResult.data.suggestedSpareParts,
        analyzedAt: new Date()
      };
      if (aiResult.data.recommendedPriority) {
        priority = aiResult.data.recommendedPriority;
      }
    }
  } catch (err) {
    console.warn('[MaintenanceController] AI Maintenance analysis failed:', err.message);
  }

  const request = await MaintenanceRequest.create({
    assetId,
    raisedBy: req.user._id,
    description,
    priority: priority || 'Medium',
    photo: photo || null,
    status: 'Pending',
    aiDiagnostic
  });

  // Log activity
  await activityLogService.log({
    actorId: req.user._id,
    action: 'MAINTENANCE_RAISED',
    targetModel: 'MaintenanceRequest',
    targetId: request._id,
    meta: { assetId, priority: request.priority, description: `Raised maintenance request for asset "${asset.name}" (${asset.assetTag}): ${description.substring(0, 50)}...` },
    ipAddress: activityLogService.getIp(req),
  });

  const populated = await MaintenanceRequest.findById(request._id)
    .populate('assetId', 'name assetTag location status condition')
    .populate('raisedBy', 'firstName lastName email role');

  return sendCreated(res, { maintenance: populated }, 'Maintenance request submitted successfully');
});

// ─── Get All Maintenance Requests ──────────────────────────────────────────────

/**
 * @desc  Get maintenance requests with role scoping & filtering
 * @route GET /api/v1/maintenance
 * @access Authenticated (All roles)
 */
exports.getAllMaintenance = asyncHandler(async (req, res) => {
  const { assetId, status, priority, technicianId, page = 1, limit = 20 } = req.query;

  const query = {};

  // Role scoping: Employees see requests raised by or assigned to them
  if (req.user.role === 'employee') {
    query.$or = [{ raisedBy: req.user._id }, { technicianId: req.user._id }];
  }

  if (assetId) query.assetId = assetId;
  if (status) query.status = status;
  if (priority) query.priority = priority;
  if (technicianId) query.technicianId = technicianId;

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  const [requests, total] = await Promise.all([
    MaintenanceRequest.find(query)
      .populate('assetId', 'name assetTag location status condition')
      .populate('raisedBy', 'firstName lastName email role')
      .populate('technicianId', 'firstName lastName email role')
      .populate('approvedBy', 'firstName lastName email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    MaintenanceRequest.countDocuments(query),
  ]);

  return sendSuccess(res, {
    requests,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum) || 1,
    },
  }, 'Maintenance requests fetched successfully');
});

// ─── Approve Maintenance ───────────────────────────────────────────────────────

/**
 * @desc  Approve a pending maintenance request and mark asset Under Maintenance
 * @route PATCH /api/v1/maintenance/:id/approve
 * @access Admin, Asset Manager
 */
exports.approveMaintenance = asyncHandler(async (req, res) => {
  const request = await MaintenanceRequest.findById(req.params.id);
  if (!request) return sendNotFound(res, 'Maintenance request not found');

  if (request.status !== 'Pending') {
    return sendBadRequest(res, `Cannot approve request with status '${request.status}'`);
  }

  const { technicianId } = req.body;

  request.status = 'Approved';
  request.approvedBy = req.user._id;
  if (technicianId) request.technicianId = technicianId;
  await request.save();

  // Business Rule: Update asset status to 'Under Maintenance' so it cannot be allocated or double-booked
  const asset = await Asset.findById(request.assetId);
  if (asset) {
    asset.status = 'Under Maintenance';
    await asset.save();
  }

  await activityLogService.log({
    actorId: req.user._id,
    action: 'MAINTENANCE_APPROVED',
    targetModel: 'MaintenanceRequest',
    targetId: request._id,
    meta: { technicianId: request.technicianId, description: `Approved maintenance request for asset (${asset ? asset.assetTag : request.assetId})` },
    ipAddress: activityLogService.getIp(req),
  });

  const populated = await MaintenanceRequest.findById(request._id)
    .populate('assetId', 'name assetTag location status condition')
    .populate('raisedBy', 'firstName lastName email role')
    .populate('technicianId', 'firstName lastName email role')
    .populate('approvedBy', 'firstName lastName email role');

  return sendSuccess(res, { maintenance: populated }, 'Maintenance request approved and asset set to Under Maintenance');
});

// ─── Reject Maintenance ────────────────────────────────────────────────────────

/**
 * @desc  Reject a pending maintenance request
 * @route PATCH /api/v1/maintenance/:id/reject
 * @access Admin, Asset Manager
 */
exports.rejectMaintenance = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return sendBadRequest(res, 'Validation failed', errors.array());

  const request = await MaintenanceRequest.findById(req.params.id);
  if (!request) return sendNotFound(res, 'Maintenance request not found');

  if (request.status !== 'Pending') {
    return sendBadRequest(res, `Cannot reject request with status '${request.status}'`);
  }

  request.status = 'Rejected';
  request.approvedBy = req.user._id;
  request.rejectionReason = req.body.rejectionReason;
  await request.save();

  await activityLogService.log({
    actorId: req.user._id,
    action: 'MAINTENANCE_REJECTED',
    targetModel: 'MaintenanceRequest',
    targetId: request._id,
    meta: { rejectionReason: request.rejectionReason, description: `Rejected maintenance request for asset (${request.assetId}). Reason: ${request.rejectionReason}` },
    ipAddress: activityLogService.getIp(req),
  });

  const populated = await MaintenanceRequest.findById(request._id)
    .populate('assetId', 'name assetTag location status condition')
    .populate('raisedBy', 'firstName lastName email role')
    .populate('approvedBy', 'firstName lastName email role');

  return sendSuccess(res, { maintenance: populated }, 'Maintenance request rejected');
});

// ─── Assign Maintenance Technician ─────────────────────────────────────────────

/**
 * @desc  Assign or change technician for maintenance request
 * @route PATCH /api/v1/maintenance/:id/assign
 * @access Admin, Asset Manager
 */
exports.assignMaintenance = asyncHandler(async (req, res) => {
  const { technicianId } = req.body;
  if (!technicianId) {
    return sendBadRequest(res, 'technicianId is required');
  }

  const request = await MaintenanceRequest.findById(req.params.id);
  if (!request) return sendNotFound(res, 'Maintenance request not found');

  if (['Resolved', 'Rejected'].includes(request.status)) {
    return sendBadRequest(res, `Cannot assign technician to request with status '${request.status}'`);
  }

  request.technicianId = technicianId;
  if (request.status === 'Approved' || request.status === 'Pending') {
    request.status = 'Assigned';
  }
  if (!request.approvedBy) request.approvedBy = req.user._id;
  await request.save();

  // Ensure asset status is Under Maintenance
  const asset = await Asset.findById(request.assetId);
  if (asset && asset.status !== 'Under Maintenance') {
    asset.status = 'Under Maintenance';
    await asset.save();
  }

  await activityLogService.log({
    actorId: req.user._id,
    action: 'MAINTENANCE_ASSIGNED',
    targetModel: 'MaintenanceRequest',
    targetId: request._id,
    meta: { technicianId, description: `Assigned technician (${technicianId}) to maintenance request (${asset ? asset.assetTag : request.assetId})` },
    ipAddress: activityLogService.getIp(req),
  });

  const io = req.app.get('io') || null;
  await createNotification(io, {
    userId: technicianId,
    type: 'Maintenance_Assigned',
    title: 'New Maintenance Assignment',
    message: `You have been assigned to repair asset "${asset ? asset.name : 'Unknown Asset'}" (${asset ? asset.assetTag : ''})`,
    relatedId: request._id,
    relatedModel: 'MaintenanceRequest',
  });

  const populated = await MaintenanceRequest.findById(request._id)
    .populate('assetId', 'name assetTag location status condition')
    .populate('raisedBy', 'firstName lastName email role')
    .populate('technicianId', 'firstName lastName email role')
    .populate('approvedBy', 'firstName lastName email role');

  return sendSuccess(res, { maintenance: populated }, 'Technician assigned successfully (`Assigned`)');
});

// ─── Start Maintenance ─────────────────────────────────────────────────────────

/**
 * @desc  Start work on approved maintenance request
 * @route PATCH /api/v1/maintenance/:id/start
 * @access Admin, Asset Manager, Assigned Technician
 */
exports.startMaintenance = asyncHandler(async (req, res) => {
  const request = await MaintenanceRequest.findById(req.params.id);
  if (!request) return sendNotFound(res, 'Maintenance request not found');

  if (!['Approved', 'Assigned', 'Pending'].includes(request.status)) {
    return sendBadRequest(res, `Cannot start maintenance on request with status '${request.status}'`);
  }

  request.status = 'In Progress';
  if (!request.approvedBy) request.approvedBy = req.user._id;
  await request.save();

  const asset = await Asset.findById(request.assetId);
  if (asset && asset.status !== 'Under Maintenance') {
    asset.status = 'Under Maintenance';
    await asset.save();
  }

  await activityLogService.log({
    actorId: req.user._id,
    action: 'MAINTENANCE_STARTED',
    targetModel: 'MaintenanceRequest',
    targetId: request._id,
    meta: { description: `Started work on maintenance request for asset (${asset ? asset.assetTag : request.assetId})` },
    ipAddress: activityLogService.getIp(req),
  });

  const populated = await MaintenanceRequest.findById(request._id)
    .populate('assetId', 'name assetTag location status condition')
    .populate('raisedBy', 'firstName lastName email role')
    .populate('technicianId', 'firstName lastName email role');

  return sendSuccess(res, { maintenance: populated }, 'Maintenance work started (`In Progress`)');
});

// ─── Resolve Maintenance ───────────────────────────────────────────────────────

/**
 * @desc  Resolve a maintenance request and mark asset Available
 * @route PATCH /api/v1/maintenance/:id/resolve
 * @access Admin, Asset Manager, Assigned Technician
 */
exports.resolveMaintenance = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return sendBadRequest(res, 'Validation failed', errors.array());

  const request = await MaintenanceRequest.findById(req.params.id);
  if (!request) return sendNotFound(res, 'Maintenance request not found');

  if (!['In Progress', 'Approved', 'Assigned'].includes(request.status)) {
    return sendBadRequest(res, `Cannot resolve request with status '${request.status}'`);
  }

  const { resolutionNotes, condition } = req.body;

  request.status = 'Resolved';
  request.resolvedAt = new Date();
  request.resolutionNotes = resolutionNotes || 'Issue resolved successfully';
  await request.save();

  // Business Rule: Return asset status to 'Available' and optionally update condition
  const asset = await Asset.findById(request.assetId);
  if (asset) {
    asset.status = 'Available';
    if (condition) asset.condition = condition;
    await asset.save();
  }

  await activityLogService.log({
    actorId: req.user._id,
    action: 'MAINTENANCE_RESOLVED',
    targetModel: 'MaintenanceRequest',
    targetId: request._id,
    meta: { resolutionNotes: request.resolutionNotes, conditionAtResolve: asset?.condition, description: `Resolved maintenance request for asset (${asset ? asset.assetTag : request.assetId}). Notes: ${request.resolutionNotes}` },
    ipAddress: activityLogService.getIp(req),
  });

  const populated = await MaintenanceRequest.findById(request._id)
    .populate('assetId', 'name assetTag location status condition')
    .populate('raisedBy', 'firstName lastName email role')
    .populate('technicianId', 'firstName lastName email role');

  return sendSuccess(res, { maintenance: populated }, 'Maintenance request resolved and asset marked Available');
});

// ─── Direct Status Update (for Kanban Board Drag & Drop) ─────────────────────────

/**
 * @desc  Update maintenance request status directly (handles Kanban drag/drop and transitions)
 * @route PATCH /api/v1/maintenance/:id/status
 * @access Admin, Asset Manager, Assigned Technician
 */
exports.updateStatus = asyncHandler(async (req, res) => {
  const { status, technicianId, resolutionNotes, rejectionReason } = req.body;
  const request = await MaintenanceRequest.findById(req.params.id);
  if (!request) return sendNotFound(res, 'Maintenance request not found');

  if (!status) return sendBadRequest(res, 'Status is required');

  const oldStatus = request.status;
  request.status = status;

  if (technicianId) request.technicianId = technicianId;
  if (rejectionReason) request.rejectionReason = rejectionReason;
  if (resolutionNotes) request.resolutionNotes = resolutionNotes;
  if (status === 'Resolved' && !request.resolvedAt) request.resolvedAt = new Date();
  if (['Approved', 'Assigned', 'In Progress'].includes(status) && !request.approvedBy) {
    request.approvedBy = req.user._id;
  }

  await request.save();

  // Business Rule: Sync asset status
  const asset = await Asset.findById(request.assetId);
  if (asset) {
    if (['Approved', 'Assigned', 'In Progress'].includes(status)) {
      asset.status = 'Under Maintenance';
      await asset.save();
    } else if (status === 'Resolved') {
      asset.status = 'Available';
      await asset.save();
    }
  }

  await activityLogService.log({
    actorId: req.user._id,
    action: `MAINTENANCE_${status.toUpperCase().replace(/\s+/g, '_')}`,
    targetModel: 'MaintenanceRequest',
    targetId: request._id,
    meta: { oldStatus, newStatus: status, description: `Moved maintenance request for asset (${asset ? asset.assetTag : request.assetId}) to "${status}"` },
    ipAddress: activityLogService.getIp(req),
  });

  const populated = await MaintenanceRequest.findById(request._id)
    .populate('assetId', 'name assetTag location status condition')
    .populate('raisedBy', 'firstName lastName email role')
    .populate('technicianId', 'firstName lastName email role')
    .populate('approvedBy', 'firstName lastName email role');

  return sendSuccess(res, { maintenance: populated }, `Maintenance request status updated to ${status}`);
});

