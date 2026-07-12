const mongoose = require('mongoose');

const NOTIFICATION_TYPES = [
  'Asset_Assigned',
  'Asset_Returned',
  'Asset_Overdue',
  'Transfer_Requested',
  'Transfer_Approved',
  'Transfer_Rejected',
  'Booking_Confirmed',
  'Booking_Cancelled',
  'Booking_Reminder',
  'Maintenance_Raised',
  'Maintenance_Approved',
  'Maintenance_Rejected',
  'Maintenance_Resolved',
  'Audit_Assigned',
  'Audit_Discrepancy',
  'System',
];

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    type: {
      type: String,
      enum: NOTIFICATION_TYPES,
      required: [true, 'Notification type is required'],
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
      maxlength: [1000, 'Message cannot exceed 1000 characters'],
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    relatedModel: {
      type: String,
      enum: ['Asset', 'Allocation', 'TransferRequest', 'Booking', 'MaintenanceRequest', 'AuditCycle', null],
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for fast unread notification queries per user
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
