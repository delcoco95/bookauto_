const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  proId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true,
  },
  
  // Timing
  scheduledDate: {
    type: Date,
    required: true,
  },
  startTime: {
    type: String, // HH:MM format
    required: true,
  },
  endTime: {
    type: String, // HH:MM format
    required: true,
  },
  durationMinutes: {
    type: Number,
    required: true,
  },
  
  // Location (for displacement services)
  serviceAddress: {
    street: String,
    city: String,
    zipCode: String,
    country: { type: String, default: 'France' },
    latitude: Number,
    longitude: Number,
    additionalInfo: String, // building code, floor, etc.
  },
  
  // Status tracking
  status: {
    type: String,
    enum: ['pending', 'accepted', 'refused', 'cancelled', 'completed', 'no_show'],
    default: 'pending',
  },
  statusHistory: [{
    status: String,
    changedAt: { type: Date, default: Date.now },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reason: String,
  }],
  
  // Pricing
  basePrice: {
    type: Number,
    required: true,
  },
  emergencyFee: {
    type: Number,
    default: 0,
  },
  weekendFee: {
    type: Number,
    default: 0,
  },
  finalPrice: {
    type: Number,
    required: true,
  },
  
  // Payment tracking
  depositAmount: {
    type: Number,
    required: true, // 20% of finalPrice
  },
  depositPaid: {
    type: Boolean,
    default: false,
  },
  depositPaymentIntentId: String,
  depositChargeId: String,
  
  // Refund tracking
  refundAmount: Number,
  refundReason: String,
  refundProcessedAt: Date,
  refundId: String,
  
  // Communication
  clientNotes: String,
  proNotes: String,
  internalNotes: String,
  
  // Emergency flags
  isEmergency: {
    type: Boolean,
    default: false,
  },
  isWeekend: {
    type: Boolean,
    default: false,
  },
  
  // Cancellation tracking
  cancelledAt: Date,
  cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  cancellationReason: String,
  cancellationFee: {
    type: Number,
    default: 0,
  },
  
}, {
  timestamps: true,
});

// Indexes for efficient queries
appointmentSchema.index({ proId: 1, scheduledDate: 1 });
appointmentSchema.index({ clientId: 1, scheduledDate: -1 });
appointmentSchema.index({ status: 1, scheduledDate: 1 });
appointmentSchema.index({ scheduledDate: 1, startTime: 1 });

// Pre-save middleware to calculate pricing
appointmentSchema.pre('save', function(next) {
  // Calculate deposit (20% of finalPrice)
  if (this.isModified('finalPrice') || this.isNew) {
    this.depositAmount = Math.round(this.finalPrice * 0.20 * 100) / 100;
  }
  
  // Check if it's weekend
  if (this.scheduledDate) {
    const dayOfWeek = this.scheduledDate.getDay();
    this.isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // Sunday = 0, Saturday = 6
  }
  
  next();
});

// Calculate cancellation fee based on timing
appointmentSchema.methods.calculateCancellationFee = function() {
  if (!this.scheduledDate) return 0;
  
  const now = new Date();
  const appointment = new Date(this.scheduledDate);
  const hoursUntilAppointment = (appointment - now) / (1000 * 60 * 60);
  
  // If >= 24 hours: no fee (full refund)
  if (hoursUntilAppointment >= 24) {
    return 0;
  }
  
  // If < 24 hours: 15% of service price (not deposit)
  return Math.round(this.finalPrice * 0.15 * 100) / 100;
};

// Check if appointment can be cancelled
appointmentSchema.methods.canBeCancelled = function() {
  return ['pending', 'accepted'].includes(this.status) && 
         this.scheduledDate > new Date();
};

// Add status change to history
appointmentSchema.methods.addStatusChange = function(newStatus, userId, reason = '') {
  this.statusHistory.push({
    status: newStatus,
    changedBy: userId,
    reason: reason,
  });
  this.status = newStatus;
};

module.exports = mongoose.model('Appointment', appointmentSchema);
