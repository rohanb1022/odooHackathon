const { validationResult } = require('express-validator');
const AuditCycle = require('../models/AuditCycle');
const AuditRecord = require('../models/AuditRecord');
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
  sendForbidden,
} = require('../utils/apiResponse');

// ─── Create Audit Cycle ────────────────────────────────────────────────────────

/**
 * @desc  Create a new physical verification audit cycle
 * @route POST /api/v1/audit-cycles
 * @access Admin, Asset Manager
 */
exports.createAuditCycle = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return sendBadRequest(res, 'Validation failed', errors.array());

  const { title, scopeType, scopeValue, dateRangeStart, dateRangeEnd, auditorIds = [] } = req.body;

  const start = new Date(dateRangeStart);
  const end = new Date(dateRangeEnd);
  if (end <= start) {
    return sendBadRequest(res, 'dateRangeEnd must be after dateRangeStart');
  }

  const cycle = await AuditCycle.create({
    title,
    scopeType,
    scopeValue: scopeValue || null,
    dateRangeStart: start,
    dateRangeEnd: end,
    auditorIds,
    createdBy: req.user._id,
    status: 'Open',
  });

  await activityLogService.log({
    actorId: req.user._id,
    action: 'AUDIT_CYCLE_CREATED',
    targetModel: 'AuditCycle',
    targetId: cycle._id,
    meta: { title, scopeType, scopeValue },
    ipAddress: activityLogService.getIp(req),
  });

  const io = req.app.get('io') || null;
  if (auditorIds && auditorIds.length > 0) {
    await notifyMany(io, auditorIds, {
      type: 'Audit_Assigned',
      title: 'New Audit Assignment',
      message: `You have been assigned as an auditor for audit cycle "${title}" (${scopeType.toUpperCase()})`,
      relatedId: cycle._id,
      relatedModel: 'AuditCycle',
    });
  }

  const populated = await AuditCycle.findById(cycle._id)
    .populate('auditorIds', 'firstName lastName email role')
    .populate('createdBy', 'firstName lastName email role');

  return sendCreated(res, { auditCycle: populated }, 'Audit cycle created successfully');
});

// ─── Assign Auditors ───────────────────────────────────────────────────────────

/**
 * @desc  Assign or update auditors for an audit cycle
 * @route POST /api/v1/audit-cycles/:id/assign
 * @access Admin, Asset Manager
 */
exports.assignAuditors = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return sendBadRequest(res, 'Validation failed', errors.array());

  const { auditorIds } = req.body;

  const cycle = await AuditCycle.findById(req.params.id);
  if (!cycle) return sendNotFound(res, 'Audit cycle not found');
  if (cycle.status === 'Closed') {
    return sendBadRequest(res, 'Cannot assign auditors to a closed audit cycle');
  }

  cycle.auditorIds = auditorIds;
  await cycle.save();

  await activityLogService.log({
    actorId: req.user._id,
    action: 'AUDIT_AUDITORS_ASSIGNED',
    targetModel: 'AuditCycle',
    targetId: cycle._id,
    meta: { auditorIds },
    ipAddress: activityLogService.getIp(req),
  });

  const io = req.app.get('io') || null;
  await notifyMany(io, auditorIds, {
    type: 'Audit_Assigned',
    title: 'Audit Assignment Updated',
    message: `You are assigned as an auditor for audit cycle "${cycle.title}"`,
    relatedId: cycle._id,
    relatedModel: 'AuditCycle',
  });

  const populated = await AuditCycle.findById(cycle._id)
    .populate('auditorIds', 'firstName lastName email role')
    .populate('createdBy', 'firstName lastName email role');

  return sendSuccess(res, { auditCycle: populated }, 'Auditors assigned successfully');
});

// ─── Verify Asset (Barcode Scanner / Physical Check) ───────────────────────────

/**
 * @desc  Auditor verifies or reports discrepancy on an asset during an audit cycle
 * @route POST /api/v1/audit-cycles/:id/verify
 * @access Authenticated (Assigned Auditors, Managers, Admins)
 */
exports.verifyAsset = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return sendBadRequest(res, 'Validation failed', errors.array());

  const { assetId, result, notes } = req.body;

  const cycle = await AuditCycle.findById(req.params.id);
  if (!cycle) return sendNotFound(res, 'Audit cycle not found');
  if (cycle.status === 'Closed') {
    return sendBadRequest(res, 'Cannot record verification on a closed audit cycle');
  }

  // Permission check: must be assigned auditor or admin/manager
  const isAuditor = cycle.auditorIds.some((id) => id.toString() === req.user._id.toString());
  const isAdminOrMgr = ['admin', 'asset_manager'].includes(req.user.role);
  if (!isAuditor && !isAdminOrMgr) {
    return sendForbidden(res, 'You are not assigned as an auditor for this cycle');
  }

  const asset = await Asset.findById(assetId);
  if (!asset || asset.isDeleted) {
    return sendNotFound(res, 'Asset not found');
  }

  // Create or update unique record for (auditCycleId, assetId)
  const record = await AuditRecord.findOneAndUpdate(
    { auditCycleId: cycle._id, assetId: asset._id },
    {
      $set: {
        auditorId: req.user._id,
        result,
        notes: notes || null,
        verifiedAt: new Date(),
      },
    },
    { new: true, upsert: true, runValidators: true }
  ).populate('assetId', 'name assetTag serialNumber location condition status');

  await activityLogService.log({
    actorId: req.user._id,
    action: 'AUDIT_ASSET_VERIFIED',
    targetModel: 'AuditRecord',
    targetId: record._id,
    meta: { auditCycleId: cycle._id, assetId: asset._id, result, notes },
    ipAddress: activityLogService.getIp(req),
  });

  const io = req.app.get('io') || null;
  // If discrepancy found (Missing or Damaged), notify managers immediately
  if (['Missing', 'Damaged'].includes(result)) {
    const managers = await User.find({ role: { $in: ['admin', 'asset_manager'] }, status: 'Active' }).select('_id');
    const mgrIds = managers.map((m) => m._id);
    await notifyMany(io, mgrIds, {
      type: 'Audit_Discrepancy',
      title: `Audit Discrepancy: ${result}`,
      message: `Asset "${asset.name}" (${asset.assetTag}) marked as ${result} during audit "${cycle.title}"`,
      relatedId: record._id,
      relatedModel: 'AuditCycle',
    });
  }

  return sendSuccess(res, { auditRecord: record }, `Asset marked as ${result}`);
});

// ─── Close Audit Cycle & Generate Discrepancy Report ───────────────────────────

/**
 * @desc  Close audit cycle and generate summary discrepancy report
 * @route POST /api/v1/audit-cycles/:id/close
 * @access Admin, Asset Manager
 */
exports.closeAuditCycle = asyncHandler(async (req, res) => {
  const cycle = await AuditCycle.findById(req.params.id);
  if (!cycle) return sendNotFound(res, 'Audit cycle not found');
  if (cycle.status === 'Closed') {
    return sendBadRequest(res, 'Audit cycle is already closed');
  }

  // Find scoped assets
  const assetFilter = { isDeleted: false };
  if (cycle.scopeType === 'department' && cycle.scopeValue) {
    assetFilter.departmentId = cycle.scopeValue;
  } else if (cycle.scopeType === 'location' && cycle.scopeValue) {
    assetFilter.location = { $regex: cycle.scopeValue, $options: 'i' };
  }

  const totalScopedAssets = await Asset.countDocuments(assetFilter);

  // Summarize verified records and update asset statuses/conditions
  const records = await AuditRecord.find({ auditCycleId: cycle._id });
  let verified = 0;
  let missing = 0;
  let damaged = 0;
  const recordedAssetIds = [];

  for (const r of records) {
    recordedAssetIds.push(r.assetId);
    if (r.result === 'Verified') {
      verified++;
    } else if (r.result === 'Missing') {
      missing++;
      // Auto-update asset status to 'Lost' for confirmed missing items
      await Asset.findByIdAndUpdate(r.assetId, { $set: { status: 'Lost' } });
    } else if (r.result === 'Damaged') {
      damaged++;
      // Auto-update asset condition to 'Damaged' for flagged damaged items
      await Asset.findByIdAndUpdate(r.assetId, { $set: { condition: 'Damaged' } });
    }
  }

  // Assets in scope without a record count as missing & are updated to 'Lost'
  const unrecordedAssets = await Asset.find({ ...assetFilter, _id: { $nin: recordedAssetIds } });
  for (const ua of unrecordedAssets) {
    missing++;
    await Asset.findByIdAndUpdate(ua._id, { $set: { status: 'Lost' } });
  }

  cycle.status = 'Closed';
  cycle.closedAt = new Date();
  cycle.closedBy = req.user._id;
  cycle.discrepancyReport = {
    totalAssets: totalScopedAssets,
    verified,
    missing,
    damaged,
    generatedAt: new Date(),
  };

  await cycle.save();

  await activityLogService.log({
    actorId: req.user._id,
    action: 'AUDIT_CYCLE_CLOSED',
    targetModel: 'AuditCycle',
    targetId: cycle._id,
    meta: { discrepancyReport: cycle.discrepancyReport },
    ipAddress: activityLogService.getIp(req),
  });

  const populated = await AuditCycle.findById(cycle._id)
    .populate('auditorIds', 'firstName lastName email role')
    .populate('createdBy', 'firstName lastName email role')
    .populate('closedBy', 'firstName lastName email role');

  return sendSuccess(res, { auditCycle: populated }, 'Audit cycle closed and discrepancy report generated');
});

// ─── Get All Audit Cycles ──────────────────────────────────────────────────────

/**
 * @desc  List audit cycles with filtering
 * @route GET /api/v1/audit-cycles
 * @access Authenticated
 */
exports.getAllAuditCycles = asyncHandler(async (req, res) => {
  const { status, scopeType, page = 1, limit = 20 } = req.query;

  const query = {};
  if (status) query.status = status;
  if (scopeType) query.scopeType = scopeType;

  // Role scoping: employees see cycles where they are assigned auditor
  if (req.user.role === 'employee') {
    query.auditorIds = req.user._id;
  }

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  const [auditCycles, total] = await Promise.all([
    AuditCycle.find(query)
      .populate('auditorIds', 'firstName lastName email role')
      .populate('createdBy', 'firstName lastName email role')
      .populate('closedBy', 'firstName lastName email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    AuditCycle.countDocuments(query),
  ]);

  return sendSuccess(res, {
    auditCycles,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum) || 1,
    },
  }, 'Audit cycles fetched successfully');
});

// ─── Get Single Audit Cycle with Records ───────────────────────────────────────

/**
 * @desc  Get audit cycle details along with its verified records
 * @route GET /api/v1/audit-cycles/:id
 * @access Authenticated
 */
exports.getAuditCycleById = asyncHandler(async (req, res) => {
  const cycle = await AuditCycle.findById(req.params.id)
    .populate('auditorIds', 'firstName lastName email role')
    .populate('createdBy', 'firstName lastName email role')
    .populate('closedBy', 'firstName lastName email role')
    .lean();

  if (!cycle) return sendNotFound(res, 'Audit cycle not found');

  const records = await AuditRecord.find({ auditCycleId: cycle._id })
    .populate('assetId', 'name assetTag serialNumber location condition status')
    .populate('auditorId', 'firstName lastName email role')
    .sort({ verifiedAt: -1 })
    .lean();

  return sendSuccess(res, { auditCycle: cycle, records }, 'Audit cycle details fetched successfully');
});
