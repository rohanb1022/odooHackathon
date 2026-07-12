const { validationResult } = require('express-validator');
const Asset = require('../models/Asset');
const AssetCategory = require('../models/AssetCategory');
const Department = require('../models/Department');
const Allocation = require('../models/Allocation');
const MaintenanceRequest = require('../models/MaintenanceRequest');
const Booking = require('../models/Booking');
const asyncHandler = require('../middlewares/asyncHandler');
const activityLogService = require('../services/activityLog.service');
const { uploadBufferToCloudinary } = require('../services/upload.service');
const { generateAssetTag } = require('../utils/assetTag');
const { generateQRCode } = require('../utils/qrCode');
const {
  sendSuccess,
  sendCreated,
  sendBadRequest,
  sendNotFound,
} = require('../utils/apiResponse');

// ─── Register Asset ────────────────────────────────────────────────────────────

/**
 * @desc  Register a new asset with auto-generated AF-XXXX tag
 * @route POST /api/v1/assets
 * @access Admin, Asset Manager
 */
exports.registerAsset = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return sendBadRequest(res, 'Validation failed', errors.array());

  let {
    name, categoryId, serialNumber, location, condition,
    isBookable, acquisitionDate, acquisitionCost,
    departmentId, photo, documents, customFieldValues,
    manufacturer, modelNumber, warrantyExpiry, assignedTo,
  } = req.body;

  // Check if image/photo buffer was uploaded via Multer and upload to Cloudinary
  const photoFile = req.files?.photo?.[0] || req.files?.image?.[0] || req.file;
  if (photoFile) {
    const uploadRes = await uploadBufferToCloudinary(photoFile.buffer, {
      folder: 'assetflow/assets',
      resourceType: 'image',
    });
    photo = uploadRes.secure_url;
  }

  // Check if document buffers were uploaded via Multer
  if (req.files?.documents && req.files.documents.length > 0) {
    const docUploadPromises = req.files.documents.map((file) =>
      uploadBufferToCloudinary(file.buffer, {
        folder: 'assetflow/documents',
        resourceType: 'auto',
      })
    );
    const docResults = await Promise.all(docUploadPromises);
    documents = (documents || []).concat(docResults.map((d) => d.secure_url));
  }

  // Validate category exists and is active
  const category = await AssetCategory.findById(categoryId);
  if (!category) return sendNotFound(res, 'Asset category not found');
  if (category.status === 'Inactive') return sendBadRequest(res, 'Cannot register asset under an inactive category');

  // Validate department if provided
  if (departmentId) {
    const dept = await Department.findById(departmentId);
    if (!dept) return sendNotFound(res, 'Department not found');
  }

  // Generate next sequential asset tag
  const assetTag = await generateAssetTag();

  const asset = await Asset.create({
    name,
    assetTag,
    categoryId,
    serialNumber: serialNumber || null,
    location: location || null,
    condition: condition || 'Good',
    isBookable: isBookable || false,
    acquisitionDate: acquisitionDate || null,
    acquisitionCost: acquisitionCost || null,
    departmentId: departmentId || null,
    photo: photo || null,
    documents: documents || [],
    customFieldValues: customFieldValues || {},
    manufacturer: manufacturer || null,
    modelNumber: modelNumber || null,
    warrantyExpiry: warrantyExpiry || null,
    assignedTo: assignedTo || null,
    status: 'Available',
  });

  await activityLogService.log({
    actorId: req.user._id,
    action: 'ASSET_REGISTERED',
    targetModel: 'Asset',
    targetId: asset._id,
    meta: { assetTag: asset.assetTag, name: asset.name, categoryId },
    ipAddress: activityLogService.getIp(req),
  });

  const populated = await Asset.findById(asset._id)
    .populate('categoryId', 'name')
    .populate('departmentId', 'name');

  return sendCreated(res, { asset: populated }, `Asset registered successfully with tag ${assetTag}`);
});

// ─── Get All Assets ────────────────────────────────────────────────────────────

/**
 * @desc  Get all assets with rich filtering and pagination
 * @route GET /api/v1/assets
 * @access All authenticated
 * @query category, status, location, departmentId, assetTag, isBookable, search, page, limit
 */


// This is for 
exports.getAllAssets = asyncHandler(async (req, res) => {
  const {
    category, status, location, departmentId, assetTag,
    isBookable, search, page = 1, limit = 20,
  } = req.query;

  const filter = { isDeleted: false };

  if (status) filter.status = status;
  if (location) filter.location = { $regex: location, $options: 'i' };
  if (departmentId) filter.departmentId = departmentId;
  if (assetTag) filter.assetTag = { $regex: assetTag, $options: 'i' };
  if (isBookable !== undefined) filter.isBookable = isBookable === 'true';

  // Filter by category name (lookup categoryId from name)
  if (category) {
    const cat = await AssetCategory.findOne({ name: { $regex: category, $options: 'i' } });
    if (cat) filter.categoryId = cat._id;
  }

  // Full-text search on name, serialNumber, assetTag
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { assetTag: { $regex: search, $options: 'i' } },
      { serialNumber: { $regex: search, $options: 'i' } },
      { location: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await Asset.countDocuments({ ...filter, isDeleted: false });

  const assets = await Asset.find(filter)
    .populate('categoryId', 'name')
    .populate('departmentId', 'name')
    .populate('assignedTo', 'name email avatar')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .lean();

  return sendSuccess(res, {
    total,
    page: parseInt(page),
    limit: parseInt(limit),
    pages: Math.ceil(total / parseInt(limit)),
    count: assets.length,
    assets,
  }, 'Assets fetched successfully');
});

// ─── Get Asset By ID ───────────────────────────────────────────────────────────

/**
 * @desc  Get single asset with full history (allocation, maintenance, booking)
 * @route GET /api/v1/assets/:id
 * @access All authenticated
 */
exports.getAssetById = asyncHandler(async (req, res) => {
  const asset = await Asset.findById(req.params.id)
    .populate('categoryId', 'name customFields')
    .populate('departmentId', 'name status')
    .populate('assignedTo', 'name email role avatar')
    .lean();

  if (!asset) return sendNotFound(res, 'Asset not found');

  // Current holder (active allocation)
  const activeAllocation = await Allocation.findOne({ assetId: asset._id, status: 'Active' })
    .populate('allocatedTo', 'name email role avatar')
    .populate('allocatedBy', 'name email')
    .lean();

  // Allocation history (last 10)
  const allocationHistory = await Allocation.find({ assetId: asset._id })
    .populate('allocatedTo', 'name email')
    .populate('allocatedBy', 'name email')
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  // Maintenance history (last 10)
  const maintenanceHistory = await MaintenanceRequest.find({ assetId: asset._id })
    .populate('raisedBy', 'name email')
    .populate('technicianId', 'name email')
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  // Booking history (last 10, only for bookable assets)
  const bookingHistory = asset.isBookable
    ? await Booking.find({ resourceId: asset._id })
      .populate('bookedBy', 'name email')
      .sort({ startTime: -1 })
      .limit(10)
      .lean()
    : [];

  return sendSuccess(res, {
    asset,
    currentHolder: activeAllocation?.allocatedTo || null,
    activeAllocation: activeAllocation || null,
    allocationHistory,
    maintenanceHistory,
    bookingHistory,
  }, 'Asset fetched successfully');
});

// ─── Update Asset ──────────────────────────────────────────────────────────────

/**
 * @desc  Update asset details
 * @route PATCH /api/v1/assets/:id
 * @access Admin, Asset Manager
 */
exports.updateAsset = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return sendBadRequest(res, 'Validation failed', errors.array());

  const asset = await Asset.findById(req.params.id);
  if (!asset) return sendNotFound(res, 'Asset not found');

  let {
    name, categoryId, serialNumber, location, condition,
    status, isBookable, acquisitionDate, acquisitionCost,
    departmentId, photo, documents, customFieldValues,
    manufacturer, modelNumber, warrantyExpiry, assignedTo,
  } = req.body;

  // Check if image/photo buffer was uploaded via Multer during update
  const photoFile = req.files?.photo?.[0] || req.files?.image?.[0] || req.file;
  if (photoFile) {
    const uploadRes = await uploadBufferToCloudinary(photoFile.buffer, {
      folder: 'assetflow/assets',
      resourceType: 'image',
    });
    photo = uploadRes.secure_url;
  }

  // Check if document buffers were uploaded via Multer during update
  if (req.files?.documents && req.files.documents.length > 0) {
    const docUploadPromises = req.files.documents.map((file) =>
      uploadBufferToCloudinary(file.buffer, {
        folder: 'assetflow/documents',
        resourceType: 'auto',
      })
    );
    const docResults = await Promise.all(docUploadPromises);
    documents = (asset.documents || []).concat(docResults.map((d) => d.secure_url));
  }

  // Validate new category if changing
  if (categoryId && categoryId !== asset.categoryId.toString()) {
    const cat = await AssetCategory.findById(categoryId);
    if (!cat) return sendNotFound(res, 'Asset category not found');
    if (cat.status === 'Inactive') return sendBadRequest(res, 'Cannot assign an inactive category');
  }

  const oldStatus = asset.status;

  if (name !== undefined) asset.name = name;
  if (categoryId !== undefined) asset.categoryId = categoryId;
  if (serialNumber !== undefined) asset.serialNumber = serialNumber;
  if (location !== undefined) asset.location = location;
  if (condition !== undefined) asset.condition = condition;
  if (status !== undefined) asset.status = status;
  if (isBookable !== undefined) asset.isBookable = isBookable;
  if (acquisitionDate !== undefined) asset.acquisitionDate = acquisitionDate;
  if (acquisitionCost !== undefined) asset.acquisitionCost = acquisitionCost;
  if (departmentId !== undefined) asset.departmentId = departmentId || null;
  if (photo !== undefined) asset.photo = photo;
  if (documents !== undefined) asset.documents = documents;
  if (customFieldValues !== undefined) asset.customFieldValues = customFieldValues;
  if (manufacturer !== undefined) asset.manufacturer = manufacturer;
  if (modelNumber !== undefined) asset.modelNumber = modelNumber;
  if (warrantyExpiry !== undefined) asset.warrantyExpiry = warrantyExpiry || null;
  if (assignedTo !== undefined) asset.assignedTo = assignedTo || null;

  await asset.save();

  await activityLogService.log({
    actorId: req.user._id,
    action: 'ASSET_UPDATED',
    targetModel: 'Asset',
    targetId: asset._id,
    meta: { assetTag: asset.assetTag, oldStatus, newStatus: asset.status },
    ipAddress: activityLogService.getIp(req),
  });

  const updated = await Asset.findById(req.params.id)
    .populate('categoryId', 'name')
    .populate('departmentId', 'name');

  return sendSuccess(res, { asset: updated }, 'Asset updated successfully');
});

// ─── Delete Asset (Soft) ───────────────────────────────────────────────────────

/**
 * @desc  Soft-delete an asset (sets isDeleted=true)
 * @route DELETE /api/v1/assets/:id
 * @access Admin, Asset Manager
 */
exports.deleteAsset = asyncHandler(async (req, res) => {
  const asset = await Asset.findOne({ _id: req.params.id, isDeleted: false });
  if (!asset) return sendNotFound(res, 'Asset not found');

  // Block deletion if asset is currently allocated
  if (asset.status === 'Allocated') {
    return sendBadRequest(res, 'Cannot delete an allocated asset. Return it first.');
  }

  asset.isDeleted = true;
  asset.status = 'Disposed';
  await asset.save();

  await activityLogService.log({
    actorId: req.user._id,
    action: 'ASSET_DELETED',
    targetModel: 'Asset',
    targetId: asset._id,
    meta: { assetTag: asset.assetTag, name: asset.name },
    ipAddress: activityLogService.getIp(req),
  });

  return sendSuccess(res, {}, `Asset ${asset.assetTag} has been disposed`);
});

// ─── Get Asset QR Code ─────────────────────────────────────────────────────────

/**
 * @desc  Generate and return QR code for an asset
 * @route GET /api/v1/assets/:id/qr
 * @access All authenticated
 */
exports.getAssetQR = asyncHandler(async (req, res) => {
  const asset = await Asset.findById(req.params.id)
    .populate('categoryId', 'name')
    .lean();

  if (!asset) return sendNotFound(res, 'Asset not found');

  const qrDataUrl = await generateQRCode(asset);

  return sendSuccess(res, {
    assetTag: asset.assetTag,
    name: asset.name,
    qrCode: qrDataUrl,
  }, 'QR code generated successfully');
});
