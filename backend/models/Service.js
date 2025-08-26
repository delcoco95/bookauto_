const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  proId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  description: {
    type: String,
    maxlength: 500,
  },
  category: {
    type: String,
    required: true,
    enum: ['auto', 'plomberie', 'serrurerie'],
  },
  subCategory: {
    type: String,
    required: true,
  },
  durationMinutes: {
    type: Number,
    required: true,
    min: 15,
    max: 480, // 8 hours max
  },
  priceTTC: {
    type: Number,
    required: true,
    min: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isEmergency: {
    type: Boolean,
    default: false,
  },
  requiresDisplacement: {
    type: Boolean,
    default: true,
  },
  images: [String], // URLs to service images
  
  // Availability rules
  availabilityRules: {
    advanceBookingHours: {
      type: Number,
      default: 2, // minimum 2 hours advance booking
    },
    maxAdvanceBookingDays: {
      type: Number,
      default: 30, // maximum 30 days advance booking
    },
  },
  
  // Pricing rules
  emergencyMultiplier: {
    type: Number,
    default: 1.5, // 50% surcharge for emergency
  },
  weekendMultiplier: {
    type: Number,
    default: 1.2, // 20% surcharge for weekends
  },
  
  // Stats
  totalBookings: {
    type: Number,
    default: 0,
  },
  totalRevenue: {
    type: Number,
    default: 0,
  },
  averageRating: {
    type: Number,
    default: 0,
  },
  totalReviews: {
    type: Number,
    default: 0,
  },
  
}, {
  timestamps: true,
});

// Indexes for efficient queries
serviceSchema.index({ proId: 1, isActive: 1 });
serviceSchema.index({ category: 1, subCategory: 1, isActive: 1 });
serviceSchema.index({ priceTTC: 1 });
serviceSchema.index({ averageRating: -1 });

// Calculate final price based on conditions
serviceSchema.methods.calculatePrice = function(isEmergency = false, isWeekend = false) {
  let finalPrice = this.priceTTC;
  
  if (isEmergency && this.isEmergency) {
    finalPrice *= this.emergencyMultiplier;
  }
  
  if (isWeekend) {
    finalPrice *= this.weekendMultiplier;
  }
  
  return Math.round(finalPrice * 100) / 100; // Round to 2 decimals
};

// Update service stats
serviceSchema.methods.updateStats = async function() {
  const Appointment = require('./Appointment');
  const Review = require('./Review');
  
  const stats = await Appointment.aggregate([
    { $match: { serviceId: this._id, status: 'completed' } },
    {
      $group: {
        _id: null,
        totalBookings: { $sum: 1 },
        totalRevenue: { $sum: '$finalPrice' }
      }
    }
  ]);
  
  const reviewStats = await Review.aggregate([
    { $match: { serviceId: this._id } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);
  
  if (stats.length > 0) {
    this.totalBookings = stats[0].totalBookings;
    this.totalRevenue = stats[0].totalRevenue;
  }
  
  if (reviewStats.length > 0) {
    this.averageRating = Math.round(reviewStats[0].averageRating * 10) / 10;
    this.totalReviews = reviewStats[0].totalReviews;
  }
  
  await this.save();
};

module.exports = mongoose.model('Service', serviceSchema);
