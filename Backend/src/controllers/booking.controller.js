const { validationResult } = require('express-validator');
const Booking = require('../models/Booking');
const Asset = require('../models/Asset');
const asyncHandler = require('../middlewares/asyncHandler');
const activityLogService = require('../services/activityLog.service');
const { createNotification } = require('../services/notification.service');
const {
  sendSuccess,
  sendCreated,
  sendBadRequest,
  sendNotFound,
  sendForbidden,
} = require('../utils/apiResponse');

// ─── Helper: Check Overlapping Bookings ────────────────────────────────────────

const checkOverlap = async (resourceId, start, end, excludeBookingId = null) => {
  const query = {
    resourceId,
    status: { $in: ['Upcoming', 'Ongoing'] },
    startTime: { $lt: new Date(end) },
    endTime: { $gt: new Date(start) },
  };

  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }

  const existing = await Booking.findOne(query);
  return existing;
};

// ─── Create Booking ────────────────────────────────────────────────────────────

/**
 * @desc  Create a new resource reservation/booking (with time-slot overlap prevention)
 * @route POST /api/v1/bookings
 * @access Authenticated (All roles)
 */
exports.createBooking = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return sendBadRequest(res, 'Validation failed', errors.array());

  const { resourceId, startTime, endTime, title, notes } = req.body;

  const start = new Date(startTime);
  const end = new Date(endTime);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return sendBadRequest(res, 'Invalid date format for startTime or endTime');
  }
  if (end <= start) {
    return sendBadRequest(res, 'endTime must be after startTime');
  }

  const asset = await Asset.findById(resourceId);
  if (!asset || asset.isDeleted) {
    return sendNotFound(res, 'Resource (Asset) not found');
  }

  // Business Rule: Check for time-slot overlap
  const overlap = await checkOverlap(resourceId, start, end);
  if (overlap) {
    return sendBadRequest(
      res,
      `Resource is already booked during this time slot (${overlap.startTime.toISOString()} to ${overlap.endTime.toISOString()})`
    );
  }

  const booking = await Booking.create({
    resourceId,
    bookedBy: req.user._id,
    title: title || `${asset.name} Reservation`,
    startTime: start,
    endTime: end,
    notes: notes || null,
    status: 'Upcoming',
  });

  // Log activity
  await activityLogService.log({
    actorId: req.user._id,
    action: 'BOOKING_CREATED',
    targetModel: 'Booking',
    targetId: booking._id,
    meta: { resourceId, startTime: start, endTime: end, description: `Booked resource "${asset.name}" (${asset.assetTag}) from ${start.toISOString()} to ${end.toISOString()}` },
    ipAddress: activityLogService.getIp(req),
  });

  const populated = await Booking.findById(booking._id)
    .populate('resourceId', 'name assetTag location isBookable status')
    .populate('bookedBy', 'firstName lastName email role');

  return sendCreated(res, { booking: populated }, 'Resource booked successfully');
});

// ─── Get All Bookings ──────────────────────────────────────────────────────────

/**
 * @desc  Get bookings with role-scoping and filters
 * @route GET /api/v1/bookings
 * @access Authenticated (All roles)
 */
exports.getAllBookings = asyncHandler(async (req, res) => {
  // Auto-sync statuses based on current timestamp
  const now = new Date();
  await Booking.updateMany(
    { status: { $in: ['Upcoming', 'Ongoing'] }, endTime: { $lte: now } },
    { $set: { status: 'Completed' } }
  );
  await Booking.updateMany(
    { status: 'Upcoming', startTime: { $lte: now }, endTime: { $gt: now } },
    { $set: { status: 'Ongoing' } }
  );

  const { resourceId, bookedBy, status, startDate, endDate, page = 1, limit = 20 } = req.query;

  const query = {};

  // Role scoping: Employees see their own bookings OR any resource's availability calendar when filtering by resourceId
  if (req.user.role === 'employee' && !resourceId) {
    query.bookedBy = req.user._id;
  } else if (bookedBy) {
    query.bookedBy = bookedBy;
  }

  if (resourceId) query.resourceId = resourceId;
  if (status) query.status = status;

  if (startDate || endDate) {
    query.startTime = {};
    if (startDate) query.startTime.$gte = new Date(startDate);
    if (endDate) query.startTime.$lte = new Date(endDate);
  }

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  const [bookings, total] = await Promise.all([
    Booking.find(query)
      .populate('resourceId', 'name assetTag location isBookable status')
      .populate('bookedBy', 'firstName lastName email role')
      .populate('cancelledBy', 'firstName lastName email')
      .sort({ startTime: 1 })
      .skip(skip)
      .limit(limitNum),
    Booking.countDocuments(query),
  ]);

  return sendSuccess(res, {
    bookings,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum) || 1,
    },
  }, 'Bookings fetched successfully');
});

// ─── Reschedule Booking ────────────────────────────────────────────────────────

/**
 * @desc  Reschedule a booking (check overlap with new time slot)
 * @route PATCH /api/v1/bookings/:id/reschedule
 * @access Authenticated (Owner, Manager, Admin)
 */
exports.rescheduleBooking = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return sendBadRequest(res, 'Validation failed', errors.array());

  const booking = await Booking.findById(req.params.id);
  if (!booking) return sendNotFound(res, 'Booking not found');

  // Verify permission
  const isOwner = booking.bookedBy.toString() === req.user._id.toString();
  const isAdminOrMgr = ['admin', 'asset_manager'].includes(req.user.role);
  if (!isOwner && !isAdminOrMgr) {
    return sendForbidden(res, 'You are not authorized to reschedule this booking');
  }

  if (['Cancelled', 'Completed'].includes(booking.status)) {
    return sendBadRequest(res, `Cannot reschedule a booking that is ${booking.status}`);
  }

  const { startTime, endTime } = req.body;
  const start = new Date(startTime);
  const end = new Date(endTime);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return sendBadRequest(res, 'Invalid date format for startTime or endTime');
  }
  if (end <= start) {
    return sendBadRequest(res, 'endTime must be after startTime');
  }

  // Check overlap excluding this booking ID
  const overlap = await checkOverlap(booking.resourceId, start, end, booking._id);
  if (overlap) {
    return sendBadRequest(
      res,
      `Resource is already booked during the new time slot (${overlap.startTime.toISOString()} to ${overlap.endTime.toISOString()})`
    );
  }

  const oldStart = booking.startTime;
  const oldEnd = booking.endTime;

  booking.startTime = start;
  booking.endTime = end;
  await booking.save();

  await activityLogService.log({
    actorId: req.user._id,
    action: 'BOOKING_RESCHEDULED',
    targetModel: 'Booking',
    targetId: booking._id,
    meta: { oldStart, oldEnd, newStart: start, newEnd: end, description: `Rescheduled booking from (${oldStart.toISOString()}-${oldEnd.toISOString()}) to (${start.toISOString()}-${end.toISOString()})` },
    ipAddress: activityLogService.getIp(req),
  });

  const populated = await Booking.findById(booking._id)
    .populate('resourceId', 'name assetTag location isBookable status')
    .populate('bookedBy', 'firstName lastName email role');

  return sendSuccess(res, { booking: populated }, 'Booking rescheduled successfully');
});

// ─── Cancel Booking ────────────────────────────────────────────────────────────

/**
 * @desc  Cancel a booking
 * @route PATCH /api/v1/bookings/:id/cancel
 * @access Authenticated (Owner, Manager, Admin)
 */
exports.cancelBooking = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return sendBadRequest(res, 'Validation failed', errors.array());

  const booking = await Booking.findById(req.params.id);
  if (!booking) return sendNotFound(res, 'Booking not found');

  const isOwner = booking.bookedBy.toString() === req.user._id.toString();
  const isAdminOrMgr = ['admin', 'asset_manager'].includes(req.user.role);
  if (!isOwner && !isAdminOrMgr) {
    return sendForbidden(res, 'You are not authorized to cancel this booking');
  }

  if (['Cancelled', 'Completed'].includes(booking.status)) {
    return sendBadRequest(res, `Booking is already ${booking.status}`);
  }

  booking.status = 'Cancelled';
  booking.cancelledBy = req.user._id;
  booking.cancelReason = req.body.cancelReason || 'Cancelled by user';
  await booking.save();

  await activityLogService.log({
    actorId: req.user._id,
    action: 'BOOKING_CANCELLED',
    targetModel: 'Booking',
    targetId: booking._id,
    meta: { cancelReason: booking.cancelReason, description: `Cancelled booking for resource (${booking.resourceId})` },
    ipAddress: activityLogService.getIp(req),
  });

  const populated = await Booking.findById(booking._id)
    .populate('resourceId', 'name assetTag location isBookable status')
    .populate('bookedBy', 'firstName lastName email role')
    .populate('cancelledBy', 'firstName lastName email');

  return sendSuccess(res, { booking: populated }, 'Booking cancelled successfully');
});

// ─── Send Booking Reminders ────────────────────────────────────────────────────

/**
 * @desc  Find upcoming bookings within next 60 mins and emit reminders
 * @route POST /api/v1/bookings/send-reminders
 * @access Authenticated (All roles / Background Cron)
 */
exports.sendBookingReminders = asyncHandler(async (req, res) => {
  const now = new Date();
  const nextHour = new Date(now.getTime() + 60 * 60 * 1000);

  const upcomingBookings = await Booking.find({
    status: 'Upcoming',
    reminderSent: false,
    startTime: { $gte: now, $lte: nextHour },
  }).populate('resourceId', 'name assetTag').populate('bookedBy', '_id');

  const io = req.app.get('io') || null;
  let sentCount = 0;

  for (const b of upcomingBookings) {
    await createNotification(io, {
      userId: b.bookedBy._id,
      type: 'Booking_Reminder',
      title: 'Booking Reminder',
      message: `Reminder: Your booking for "${b.resourceId.name}" (${b.resourceId.assetTag}) starts at ${new Date(b.startTime).toLocaleTimeString()}`,
      relatedId: b._id,
      relatedModel: 'Booking',
    });
    b.reminderSent = true;
    await b.save();
    sentCount++;
  }

  return sendSuccess(res, { remindersSent: sentCount }, `Sent ${sentCount} booking reminders successfully`);
});

// ─── Update Booking Status ─────────────────────────────────────────────────────

/**
 * @desc  Manually transition booking status (Check-in / Complete)
 * @route PATCH /api/v1/bookings/:id/status
 * @access Authenticated (Owner, Manager, Admin)
 */
exports.updateBookingStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!['Upcoming', 'Ongoing', 'Completed', 'Cancelled'].includes(status)) {
    return sendBadRequest(res, 'Invalid booking status');
  }

  const booking = await Booking.findById(req.params.id);
  if (!booking) return sendNotFound(res, 'Booking not found');

  const isOwner = booking.bookedBy.toString() === req.user._id.toString();
  const isAdminOrMgr = ['admin', 'asset_manager'].includes(req.user.role);
  if (!isOwner && !isAdminOrMgr) {
    return sendForbidden(res, 'Not authorized to update status of this booking');
  }

  booking.status = status;
  await booking.save();

  await activityLogService.log({
    actorId: req.user._id,
    action: 'BOOKING_STATUS_UPDATED',
    targetModel: 'Booking',
    targetId: booking._id,
    meta: { status, description: `Updated booking status to ${status}` },
    ipAddress: activityLogService.getIp(req),
  });

  const populated = await Booking.findById(booking._id)
    .populate('resourceId', 'name assetTag location isBookable status')
    .populate('bookedBy', 'firstName lastName email role');

  return sendSuccess(res, { booking: populated }, 'Booking status updated successfully');
});
