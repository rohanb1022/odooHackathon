const Asset = require('../models/Asset');
const Allocation = require('../models/Allocation');
const Booking = require('../models/Booking');
const MaintenanceRequest = require('../models/MaintenanceRequest');
const Department = require('../models/Department');
const asyncHandler = require('../middlewares/asyncHandler');
const { sendSuccess, sendBadRequest } = require('../utils/apiResponse');

// ─── Get Asset & Valuation Report (Plus Nearing Retirement & Due Maintenance) ──

/**
 * @desc  Get asset valuation, depreciation summary, and status/category distribution
 * @route GET /api/v1/reports/assets
 * @access Admin, Asset Manager
 */
exports.getAssetReport = asyncHandler(async (req, res) => {
  const [statusDistribution, categoryDistribution, conditionDistribution, totalValuationRaw, nearingRetirementAssets, dueForMaintenanceAssets] = await Promise.all([
    Asset.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: '$status', count: { $sum: 1 }, totalCost: { $sum: '$purchaseCost' } } },
    ]),
    Asset.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: '$categoryId', count: { $sum: 1 }, totalCost: { $sum: '$purchaseCost' } } },
      {
        $lookup: {
          from: 'assetcategories',
          localField: '_id',
          foreignField: '_id',
          as: 'category',
        },
      },
      { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
      { $project: { categoryName: { $ifNull: ['$category.name', 'Uncategorized'] }, count: 1, totalCost: 1 } },
    ]),
    Asset.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: '$condition', count: { $sum: 1 } } },
    ]),
    Asset.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: null, totalPurchaseCost: { $sum: '$purchaseCost' }, count: { $sum: 1 } } },
    ]),
    // Assets nearing retirement: condition Poor/Damaged or status Retired/Lost or > 4 yrs old
    Asset.find({
      isDeleted: false,
      $or: [
        { condition: { $in: ['Poor', 'Damaged'] } },
        { status: { $in: ['Retired', 'Lost'] } },
        { purchaseDate: { $lt: new Date(Date.now() - 4 * 365 * 24 * 60 * 60 * 1000) } },
      ],
    })
      .select('name assetTag serialNumber condition status purchaseDate purchaseCost location')
      .limit(20)
      .lean(),
    // Assets due for maintenance: Under Maintenance or Needs Repair or active maintenance requests
    Asset.find({
      isDeleted: false,
      $or: [
        { status: 'Under Maintenance' },
        { condition: { $in: ['Fair', 'Poor', 'Damaged'] } },
      ],
    })
      .select('name assetTag serialNumber condition status location')
      .limit(20)
      .lean(),
  ]);

  const totalCost = totalValuationRaw[0]?.totalPurchaseCost || 0;
  const totalAssets = totalValuationRaw[0]?.count || 0;

  // Compute straight-line depreciation estimate (assuming 5 year average useful life 20% annual)
  const allAssets = await Asset.find({ isDeleted: false, purchaseDate: { $ne: null } }).select('purchaseCost purchaseDate').lean();
  let totalCurrentValuation = 0;
  let totalDepreciation = 0;
  const now = new Date();

  allAssets.forEach((a) => {
    const cost = a.purchaseCost || 0;
    if (a.purchaseDate) {
      const ageYears = Math.max(0, (now - new Date(a.purchaseDate)) / (1000 * 60 * 60 * 24 * 365));
      const depRate = 0.20; // 20% straight line per year
      const depAmount = Math.min(cost, cost * ageYears * depRate);
      totalDepreciation += depAmount;
      totalCurrentValuation += (cost - depAmount);
    } else {
      totalCurrentValuation += cost;
    }
  });

  return sendSuccess(res, {
    summary: {
      totalAssets,
      totalPurchaseCost: totalCost,
      totalEstimatedDepreciation: Math.round(totalDepreciation),
      totalCurrentValuation: Math.round(totalCurrentValuation),
    },
    statusDistribution,
    categoryDistribution,
    conditionDistribution,
    nearingRetirementAssets,
    dueForMaintenanceAssets,
  }, 'Asset report generated successfully');
});

// ─── Get Utilization Report (Most-Used vs Idle & Booking Heatmap) ──────────────

/**
 * @desc  Get allocation utilization rates, most-used vs idle assets, and booking heatmap
 * @route GET /api/v1/reports/utilization
 * @access Admin, Asset Manager
 */
exports.getUtilizationReport = asyncHandler(async (req, res) => {
  const [totalAssets, allocatedAssets, bookableAssets, activeBookings, topAllocatedAssets, activeAllocatedIdsRaw, bookingHeatmapRaw] = await Promise.all([
    Asset.countDocuments({ isDeleted: false }),
    Asset.countDocuments({ status: 'Allocated', isDeleted: false }),
    Asset.countDocuments({ isBookable: true, isDeleted: false }),
    Booking.countDocuments({ status: { $in: ['Upcoming', 'Ongoing'] } }),
    // Most used assets
    Allocation.aggregate([
      { $group: { _id: '$assetId', allocationsCount: { $sum: 1 } } },
      { $sort: { allocationsCount: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'assets',
          localField: '_id',
          foreignField: '_id',
          as: 'asset',
        },
      },
      { $unwind: '$asset' },
      { $project: { assetName: '$asset.name', assetTag: '$asset.assetTag', allocationsCount: 1 } },
    ]),
    Allocation.distinct('assetId'),
    // Booking heatmap: count bookings grouped by hour of start time (0-23)
    Booking.aggregate([
      {
        $project: {
          hourOfDay: { $hour: '$startTime' },
        },
      },
      {
        $group: {
          _id: '$hourOfDay',
          bookingsCount: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  // Idle assets: assets currently Available with no allocation history
  const idleAssets = await Asset.find({
    isDeleted: false,
    status: 'Available',
    _id: { $nin: activeAllocatedIdsRaw },
  })
    .select('name assetTag serialNumber location categoryId')
    .limit(15)
    .populate('categoryId', 'name')
    .lean();

  const utilizationRate = totalAssets > 0 ? ((allocatedAssets / totalAssets) * 100).toFixed(2) : '0.00';

  return sendSuccess(res, {
    utilizationSummary: {
      totalAssets,
      allocatedAssets,
      utilizationRatePercentage: Number(utilizationRate),
      bookableAssetsCount: bookableAssets,
      activeOrUpcomingBookingsCount: activeBookings,
    },
    topAllocatedAssets,
    idleAssets,
    bookingHeatmap: bookingHeatmapRaw.map((h) => ({ hourOfDay: `${h._id}:00 - ${h._id + 1}:00`, bookingsCount: h.bookingsCount })),
  }, 'Utilization report generated successfully');
});

// ─── Get Maintenance Report (Frequency by Asset/Category) ──────────────────────

/**
 * @desc  Get maintenance breakdown, frequency by priority/status/asset/category, and resolution times
 * @route GET /api/v1/reports/maintenance
 * @access Admin, Asset Manager
 */
exports.getMaintenanceReport = asyncHandler(async (req, res) => {
  const [byPriority, byStatus, resolvedTickets, byAsset, byCategory] = await Promise.all([
    MaintenanceRequest.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } },
    ]),
    MaintenanceRequest.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    MaintenanceRequest.find({ status: 'Resolved' }).select('createdAt updatedAt').lean(),
    // Maintenance frequency by asset
    MaintenanceRequest.aggregate([
      { $group: { _id: '$assetId', requestsCount: { $sum: 1 } } },
      { $sort: { requestsCount: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'assets',
          localField: '_id',
          foreignField: '_id',
          as: 'asset',
        },
      },
      { $unwind: '$asset' },
      { $project: { assetName: '$asset.name', assetTag: '$asset.assetTag', requestsCount: 1 } },
    ]),
    // Maintenance frequency by asset category
    MaintenanceRequest.aggregate([
      {
        $lookup: {
          from: 'assets',
          localField: 'assetId',
          foreignField: '_id',
          as: 'asset',
        },
      },
      { $unwind: '$asset' },
      {
        $group: { _id: '$asset.categoryId', requestsCount: { $sum: 1 } },
      },
      {
        $lookup: {
          from: 'assetcategories',
          localField: '_id',
          foreignField: '_id',
          as: 'category',
        },
      },
      { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
      { $project: { categoryName: { $ifNull: ['$category.name', 'Uncategorized'] }, requestsCount: 1 } },
    ]),
  ]);

  let totalHours = 0;
  resolvedTickets.forEach((t) => {
    const diffHours = (new Date(t.updatedAt) - new Date(t.createdAt)) / (1000 * 60 * 60);
    totalHours += Math.max(0, diffHours);
  });

  const avgResolutionTimeHours = resolvedTickets.length > 0 ? (totalHours / resolvedTickets.length).toFixed(1) : '0.0';

  return sendSuccess(res, {
    maintenanceSummary: {
      totalRequests: byStatus.reduce((acc, curr) => acc + curr.count, 0),
      resolvedCount: resolvedTickets.length,
      averageResolutionTimeHours: Number(avgResolutionTimeHours),
    },
    byPriority,
    byStatus,
    byAsset,
    byCategory,
  }, 'Maintenance report generated successfully');
});

// ─── Get Department Report (With Allocation Summary) ───────────────────────────

/**
 * @desc  Get asset valuation and active allocation summary broken down per department
 * @route GET /api/v1/reports/departments
 * @access Admin, Asset Manager
 */
exports.getDepartmentReport = asyncHandler(async (req, res) => {
  const departmentBreakdown = await Asset.aggregate([
    { $match: { isDeleted: false } },
    {
      $group: {
        _id: '$departmentId',
        assetCount: { $sum: 1 },
        totalPurchaseCost: { $sum: '$purchaseCost' },
      },
    },
    {
      $lookup: {
        from: 'departments',
        localField: '_id',
        foreignField: '_id',
        as: 'dept',
      },
    },
    { $unwind: { path: '$dept', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        departmentName: { $ifNull: ['$dept.name', 'Unassigned / Global'] },
        departmentCode: { $ifNull: ['$dept.code', 'N/A'] },
        assetCount: 1,
        totalPurchaseCost: 1,
      },
    },
    { $sort: { totalPurchaseCost: -1 } },
  ]);

  // Compute active allocations per department
  const activeAllocationsByDept = await Allocation.aggregate([
    { $match: { status: 'Active' } },
    {
      $lookup: {
        from: 'assets',
        localField: 'assetId',
        foreignField: '_id',
        as: 'asset',
      },
    },
    { $unwind: '$asset' },
    {
      $group: {
        _id: '$asset.departmentId',
        activeAllocationsCount: { $sum: 1 },
      },
    },
  ]);

  const allocMap = {};
  activeAllocationsByDept.forEach((item) => {
    const key = item._id ? item._id.toString() : 'null';
    allocMap[key] = item.activeAllocationsCount;
  });

  const enrichedBreakdown = departmentBreakdown.map((d) => {
    const key = d._id ? d._id.toString() : 'null';
    return {
      ...d,
      activeAllocationsCount: allocMap[key] || 0,
    };
  });

  return sendSuccess(res, { departmentBreakdown: enrichedBreakdown }, 'Department report generated successfully');
});

// ─── Exportable Reports (CSV format) ───────────────────────────────────────────

/**
 * @desc  Download operational reports as structured CSV file
 * @route GET /api/v1/reports/export
 * @access Admin, Asset Manager
 */
exports.exportReport = asyncHandler(async (req, res) => {
  const { type = 'assets' } = req.query;

  let csvContent = '';
  const now = new Date().toISOString().split('T')[0];

  if (type === 'assets') {
    const assets = await Asset.find({ isDeleted: false }).populate('categoryId', 'name').lean();
    csvContent = 'Asset Tag,Name,Category,Status,Condition,Location,Purchase Cost\n';
    assets.forEach((a) => {
      const cat = a.categoryId ? a.categoryId.name : 'Uncategorized';
      csvContent += `"${a.assetTag}","${a.name}","${cat}","${a.status}","${a.condition}","${a.location || 'N/A'}",${a.purchaseCost || 0}\n`;
    });
    res.setHeader('Content-Disposition', `attachment; filename="assets_report_${now}.csv"`);
  } else if (type === 'utilization') {
    const allocations = await Allocation.find().populate('assetId', 'name assetTag').populate('allocatedTo', 'firstName lastName email').lean();
    csvContent = 'Asset Tag,Asset Name,Allocated To,Allocation Date,Expected Return,Status\n';
    allocations.forEach((al) => {
      const tag = al.assetId?.assetTag || 'N/A';
      const name = al.assetId?.name || 'N/A';
      const user = al.allocatedTo ? `${al.allocatedTo.firstName} ${al.allocatedTo.lastName}` : 'N/A';
      csvContent += `"${tag}","${name}","${user}","${al.allocationDate || ''}","${al.expectedReturnDate || ''}","${al.status}"\n`;
    });
    res.setHeader('Content-Disposition', `attachment; filename="utilization_report_${now}.csv"`);
  } else if (type === 'maintenance') {
    const requests = await MaintenanceRequest.find().populate('assetId', 'name assetTag').populate('technicianId', 'firstName lastName').lean();
    csvContent = 'Asset Tag,Asset Name,Priority,Status,Description,Technician,Raised Date\n';
    requests.forEach((m) => {
      const tag = m.assetId?.assetTag || 'N/A';
      const name = m.assetId?.name || 'N/A';
      const tech = m.technicianId ? `${m.technicianId.firstName} ${m.technicianId.lastName}` : 'Unassigned';
      csvContent += `"${tag}","${name}","${m.priority}","${m.status}","${(m.description || '').replace(/"/g, '""')}","${tech}","${m.createdAt}"\n`;
    });
    res.setHeader('Content-Disposition', `attachment; filename="maintenance_report_${now}.csv"`);
  } else {
    return sendBadRequest(res, 'Invalid export type. Allowed values: assets, utilization, maintenance');
  }

  res.setHeader('Content-Type', 'text/csv');
  return res.status(200).send(csvContent);
});
