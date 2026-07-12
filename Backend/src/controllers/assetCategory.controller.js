const { validationResult } = require('express-validator');
const AssetCategory = require('../models/AssetCategory');
const Asset = require('../models/Asset');
const asyncHandler = require('../middlewares/asyncHandler');
const activityLogService = require('../services/activityLog.service');
const {
  sendSuccess,
  sendCreated,
  sendBadRequest,
  sendNotFound,
} = require('../utils/apiResponse');

// ─── Create Category ───────────────────────────────────────────────────────────

/**
 * @desc  Create a new asset category
 * @route POST /api/v1/asset-categories
 * @access Admin
 */
exports.createCategory = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return sendBadRequest(res, 'Validation failed', errors.array());

  const { name, description, customFields } = req.body;

  const category = await AssetCategory.create({ name, description, customFields: customFields || [] });

  await activityLogService.log({
    actorId: req.user._id,
    action: 'CATEGORY_CREATED',
    targetModel: 'AssetCategory',
    targetId: category._id,
    meta: { name: category.name },
    ipAddress: activityLogService.getIp(req),
  });

  return sendCreated(res, { category }, 'Asset category created successfully');
});

// ─── Get All Categories ────────────────────────────────────────────────────────

/**
 * @desc  Get all asset categories
 * @route GET /api/v1/asset-categories
 * @access All authenticated
 */
exports.getAllCategories = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;

  const categories = await AssetCategory.find(filter).sort({ name: 1 }).lean();

  // Attach asset count per category
  const withCounts = await Promise.all(
    categories.map(async (cat) => {
      const assetCount = await Asset.countDocuments({ categoryId: cat._id });
      return { ...cat, assetCount };
    })
  );

  return sendSuccess(res, { count: withCounts.length, categories: withCounts }, 'Categories fetched successfully');
});

// ─── Update Category ───────────────────────────────────────────────────────────

/**
 * @desc  Update an asset category
 * @route PATCH /api/v1/asset-categories/:id
 * @access Admin
 */
exports.updateCategory = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return sendBadRequest(res, 'Validation failed', errors.array());

  const category = await AssetCategory.findById(req.params.id);
  if (!category) return sendNotFound(res, 'Asset category not found');

  const { name, description, customFields, status } = req.body;
  const oldName = category.name;

  if (name !== undefined) category.name = name;
  if (description !== undefined) category.description = description;
  if (customFields !== undefined) category.customFields = customFields;
  if (status !== undefined) category.status = status;

  await category.save();

  await activityLogService.log({
    actorId: req.user._id,
    action: 'CATEGORY_UPDATED',
    targetModel: 'AssetCategory',
    targetId: category._id,
    meta: { oldName, newName: category.name },
    ipAddress: activityLogService.getIp(req),
  });

  return sendSuccess(res, { category }, 'Asset category updated successfully');
});

// ─── Delete / Deactivate Category ─────────────────────────────────────────────

/**
 * @desc  Deactivate an asset category (soft delete)
 * @route DELETE /api/v1/asset-categories/:id
 * @access Admin
 */
exports.deleteCategory = asyncHandler(async (req, res) => {
  const category = await AssetCategory.findById(req.params.id);
  if (!category) return sendNotFound(res, 'Asset category not found');

  // Prevent deletion if active assets exist in this category
  const assetCount = await Asset.countDocuments({ categoryId: req.params.id });
  if (assetCount > 0) {
    return sendBadRequest(res, `Cannot deactivate category with ${assetCount} asset(s). Reassign or retire assets first.`);
  }

  category.status = 'Inactive';
  await category.save();

  await activityLogService.log({
    actorId: req.user._id,
    action: 'CATEGORY_DEACTIVATED',
    targetModel: 'AssetCategory',
    targetId: category._id,
    meta: { name: category.name },
    ipAddress: activityLogService.getIp(req),
  });

  return sendSuccess(res, { category }, 'Asset category deactivated successfully');
});
