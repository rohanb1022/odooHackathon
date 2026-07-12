const Asset = require('../models/Asset');
const Allocation = require('../models/Allocation');
const MaintenanceRequest = require('../models/MaintenanceRequest');
const Booking = require('../models/Booking');
const mlService = require('../services/ml.service');
const { sendSuccess, sendNotFound } = require('../utils/apiResponse');
const asyncHandler = require('../middlewares/asyncHandler');

/**
 * @desc  AI Chat agent proxy with backend tools (functions)
 * @route POST /api/v1/ai/chat
 * @access Authenticated (All roles)
 */
exports.chat = asyncHandler(async (req, res) => {
  const { message, history } = req.body;

  const payload = {
    message,
    history: history || [],
    user: {
      id: req.user._id.toString(),
      name: req.user.name,
      role: req.user.role,
      departmentId: req.user.departmentId ? req.user.departmentId.toString() : null,
    },
  };

  // Extract auth token to forward for credentials inside tool executions
  const token = req.headers.authorization || (req.cookies && req.cookies.token ? `Bearer ${req.cookies.token}` : '');

  const response = await mlService.chat(payload, { 'Authorization': token });
  
  return sendSuccess(res, {
    reply: response.reply,
    actions: response.actions || []
  }, 'AI response generated successfully');
});

/**
 * @desc  Evaluate asset health based on history
 * @route GET /api/v1/ai/asset-health/:id
 * @access Authenticated (All roles)
 */
exports.getAssetHealth = asyncHandler(async (req, res) => {
  const asset = await Asset.findById(req.params.id)
    .populate('categoryId', 'name')
    .populate('departmentId', 'name')
    .lean();
    
  if (!asset) return sendNotFound(res, 'Asset not found');

  const allocations = await Allocation.find({ assetId: asset._id })
    .populate('allocatedTo', 'name email')
    .lean();
    
  const maintenance = await MaintenanceRequest.find({ assetId: asset._id })
    .populate('raisedBy', 'name email')
    .lean();
    
  const bookings = await Booking.find({ resourceId: asset._id })
    .populate('userId', 'name email')
    .lean();

  const payload = {
    asset: {
      name: asset.name,
      condition: asset.condition,
      status: asset.status,
      acquisitionDate: asset.acquisitionDate,
      acquisitionCost: asset.acquisitionCost,
      manufacturer: asset.manufacturer,
      modelNumber: asset.modelNumber,
    },
    history: {
      allocations,
      maintenance,
      bookings,
    },
  };

  const token = req.headers.authorization || (req.cookies && req.cookies.token ? `Bearer ${req.cookies.token}` : '');
  const response = await mlService.getAssetHealth(payload, { 'Authorization': token });
  
  return sendSuccess(res, response.data, 'Asset health evaluated successfully');
});

/**
 * @desc  Predict asset failure probability and timeline
 * @route GET /api/v1/ai/predict-maintenance/:id
 * @access Authenticated (All roles)
 */
exports.predictMaintenance = asyncHandler(async (req, res) => {
  const asset = await Asset.findById(req.params.id)
    .populate('categoryId', 'name')
    .lean();
    
  if (!asset) return sendNotFound(res, 'Asset not found');

  const allocations = await Allocation.find({ assetId: asset._id }).lean();
  const maintenance = await MaintenanceRequest.find({ assetId: asset._id }).lean();

  const payload = {
    asset: {
      name: asset.name,
      condition: asset.condition,
      status: asset.status,
      acquisitionDate: asset.acquisitionDate,
      manufacturer: asset.manufacturer,
      modelNumber: asset.modelNumber,
    },
    history: {
      allocations,
      maintenance,
    },
  };

  const token = req.headers.authorization || (req.cookies && req.cookies.token ? `Bearer ${req.cookies.token}` : '');
  const response = await mlService.predictMaintenance(payload, { 'Authorization': token });
  
  return sendSuccess(res, response.data, 'Asset maintenance predicted successfully');
});
