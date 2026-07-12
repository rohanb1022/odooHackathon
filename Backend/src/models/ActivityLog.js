const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Actor is required'],
    },
    action: {
      type: String,
      required: [true, 'Action is required'],
      trim: true,
      maxlength: [200, 'Action cannot exceed 200 characters'],
      // e.g. "ASSET_CREATED", "ALLOCATION_CREATED", "USER_PROMOTED"
    },
    targetModel: {
      type: String,
      enum: [
        'User', 'Department', 'AssetCategory', 'Asset',
        'Allocation', 'TransferRequest', 'Booking',
        'MaintenanceRequest', 'AuditCycle', 'AuditRecord',
        'Notification', 'System',
      ],
      default: 'System',
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    meta: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
      // Any extra context: { assetTag: 'AF-0001', fromStatus: 'Available', toStatus: 'Allocated' }
    },
    ipAddress: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient actor-based and time-range queries
activityLogSchema.index({ actorId: 1, createdAt: -1 });
activityLogSchema.index({ targetModel: 1, targetId: 1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
