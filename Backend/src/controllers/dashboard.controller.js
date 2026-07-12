const Asset = require('../models/Asset');
const Allocation = require('../models/Allocation');
const Booking = require('../models/Booking');
const MaintenanceRequest = require('../models/MaintenanceRequest');
const TransferRequest = require('../models/TransferRequest');
const Notification = require('../models/Notification');
const ActivityLog = require('../models/ActivityLog');
const asyncHandler = require('../middlewares/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');

/**
 * @desc  Get real-time dashboard KPI cards and summary statistics
 * @route GET /api/v1/dashboard
 * @access Authenticated (Role-scoped data where applicable)
 */
exports.getDashboard = asyncHandler(async (req, res) => {
  const now = new Date();

  // Role scoping: employees get counts relevant to them or general availability
  const isEmployee = req.user.role === 'employee';

  const [
    assetsAvailable,
    assetsAllocated,
    assetsMaintenance,
    totalAssets,
    activeBookings,
    upcomingBookings,
    overdueAllocations,
    pendingTransfers,
    pendingMaintenance,
    unreadNotifications,
    recentActivities,
  ] = await Promise.all([
    Asset.countDocuments({ status: 'Available', isDeleted: false }),
    Asset.countDocuments({ status: 'Allocated', isDeleted: false }),
    Asset.countDocuments({ status: 'Under Maintenance', isDeleted: false }),
    Asset.countDocuments({ isDeleted: false }),
    Booking.countDocuments(isEmployee ? { status: 'Ongoing', bookedBy: req.user._id } : { status: 'Ongoing' }),
    Booking.countDocuments(isEmployee ? { status: 'Upcoming', bookedBy: req.user._id } : { status: 'Upcoming' }),
    Allocation.countDocuments(
      isEmployee
        ? { status: 'Active', allocatedTo: req.user._id, expectedReturnDate: { $lt: now } }
        : { status: 'Active', expectedReturnDate: { $lt: now } }
    ),
    TransferRequest.countDocuments(
      isEmployee ? { status: 'Pending', $or: [{ fromUserId: req.user._id }, { toUserId: req.user._id }] } : { status: 'Pending' }
    ),
    MaintenanceRequest.countDocuments(
      isEmployee ? { status: 'Pending', raisedBy: req.user._id } : { status: 'Pending' }
    ),
    Notification.countDocuments({ userId: req.user._id, isRead: false }),
    ActivityLog.find(isEmployee ? { actorId: req.user._id } : {})
      .populate('actorId', 'firstName lastName email role avatar')
      .sort({ createdAt: -1 })
      .limit(8)
      .lean(),
  ]);

  return sendSuccess(res, {
    kpiCards: {
      assetsAvailable,
      assetsAllocated,
      assetsMaintenance,
      totalAssets,
      activeBookings,
      upcomingBookings,
      overdueAllocations,
      pendingTransfers,
      pendingMaintenance,
      unreadNotifications,
    },
    recentActivities,
  }, 'Dashboard statistics fetched successfully');
});
