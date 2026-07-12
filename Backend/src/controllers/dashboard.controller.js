const { sendSuccess } = require('../utils/apiResponse');
const Asset = require('../models/Asset');
const Allocation = require('../models/Allocation');
const MaintenanceRequest = require('../models/MaintenanceRequest');
const Booking = require('../models/Booking');
const TransferRequest = require('../models/TransferRequest');
const asyncHandler = require('../middlewares/asyncHandler');

exports.getDashboard = asyncHandler(async (req, res) => {
  const [
    assetsAvailable,
    assetsAllocated,
    maintenanceToday,
    activeBookings,
    pendingTransfers,
  ] = await Promise.all([
    Asset.countDocuments({ status: 'Available' }),
    Asset.countDocuments({ status: 'Allocated' }),
    MaintenanceRequest.countDocuments({ 
      status: 'Pending',
      createdAt: { $gte: new Date(new Date().setHours(0,0,0,0)) } 
    }),
    Booking.countDocuments({ status: { $in: ['Upcoming', 'Ongoing'] } }),
    TransferRequest.countDocuments({ status: 'Pending' })
  ]);

  const overdueReturns = await Allocation.countDocuments({
    status: 'Active',
    expectedReturnDate: { $lt: new Date() }
  });

  return sendSuccess(res, {
    assetsAvailable,
    assetsAllocated,
    maintenanceToday,
    activeBookings,
    pendingTransfers,
    overdueReturns
  }, 'Dashboard stats fetched successfully');
});
