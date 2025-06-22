
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['SMS', 'EMAIL', 'PUSH', 'IN_APP'],
    required: true
  },
  channel: {
    type: String,
    enum: ['OTP', 'TRANSACTION', 'MARKETING', 'SYSTEM'],
    required: true
  },
  recipient: {
    type: String,
    required: true // phone number or email
  },
  subject: String,
  content: {
    type: String,
    required: true
  },
  templateId: String,
  templateData: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  status: {
    type: String,
    enum: ['PENDING', 'SENT', 'DELIVERED', 'FAILED', 'CLICKED', 'OPENED'],
    default: 'PENDING'
  },
  provider: {
    type: String,
    enum: ['TWILIO', 'AWS_SES', 'SENDGRID', 'FCM']
  },
  providerMessageId: String,
  priority: {
    type: String,
    enum: ['LOW', 'NORMAL', 'HIGH', 'URGENT'],
    default: 'NORMAL'
  },
  scheduledAt: Date,
  sentAt: Date,
  deliveredAt: Date,
  failureReason: String,
  retryCount: {
    type: Number,
    default: 0
  },
  maxRetries: {
    type: Number,
    default: 3
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true,
  collection: 'notifications'
});

// Indexes
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ status: 1, scheduledAt: 1 });
notificationSchema.index({ type: 1, channel: 1 });
notificationSchema.index({ providerMessageId: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
