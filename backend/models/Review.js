const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
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
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true,
    unique: true, // One review per appointment
  },
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true,
  },
  
  // Review content
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    required: true,
    maxlength: 500,
    trim: true,
  },
  
  // Pro response
  reply: {
    content: {
      type: String,
      maxlength: 500,
      trim: true,
    },
    repliedAt: Date,
    isPublic: {
      type: Boolean,
      default: true,
    },
  },
  
  // Review categories (optional detailed ratings)
  detailedRatings: {
    punctuality: {
      type: Number,
      min: 1,
      max: 5,
    },
    quality: {
      type: Number,
      min: 1,
      max: 5,
    },
    communication: {
      type: Number,
      min: 1,
      max: 5,
    },
    value: {
      type: Number,
      min: 1,
      max: 5,
    },
  },
  
  // Verification
  isVerified: {
    type: Boolean,
    default: true, // True if linked to a completed appointment
  },
  
  // Moderation
  isPublic: {
    type: Boolean,
    default: true,
  },
  isReported: {
    type: Boolean,
    default: false,
  },
  reportReason: String,
  reportedAt: Date,
  
  // Helpful votes from other users
  helpfulVotes: {
    type: Number,
    default: 0,
  },
  votedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  
}, {
  timestamps: true,
});

// Indexes for efficient queries
reviewSchema.index({ proId: 1, isPublic: 1, createdAt: -1 });
reviewSchema.index({ serviceId: 1, isPublic: 1 });
reviewSchema.index({ rating: -1 });
reviewSchema.index({ appointmentId: 1 });
reviewSchema.index({ clientId: 1 });

// Compound index for preventing duplicate reviews
reviewSchema.index({ clientId: 1, appointmentId: 1 }, { unique: true });

// Pre-save validation
reviewSchema.pre('save', async function(next) {
  // Verify appointment exists and is completed
  if (this.isNew) {
    const Appointment = require('./Appointment');
    const appointment = await Appointment.findById(this.appointmentId);
    
    if (!appointment) {
      return next(new Error('Appointment not found'));
    }
    
    if (appointment.status !== 'completed') {
      return next(new Error('Can only review completed appointments'));
    }
    
    if (appointment.clientId.toString() !== this.clientId.toString()) {
      return next(new Error('Only the client who booked can review'));
    }
  }
  
  next();
});

// Post-save middleware to update pro and service ratings
reviewSchema.post('save', async function(doc) {
  try {
    await doc.updateProRating();
    await doc.updateServiceRating();
  } catch (error) {
    console.error('Error updating ratings after review save:', error);
  }
});

// Update professional's overall rating
reviewSchema.methods.updateProRating = async function() {
  const stats = await this.constructor.aggregate([
    { $match: { proId: this.proId, isPublic: true } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
      }
    }
  ]);
  
  if (stats.length > 0) {
    const User = require('./User');
    await User.findByIdAndUpdate(this.proId, {
      averageRating: Math.round(stats[0].averageRating * 10) / 10,
      totalReviews: stats[0].totalReviews,
      totalRatings: stats[0].totalReviews,
    });
  }
};

// Update service's rating
reviewSchema.methods.updateServiceRating = async function() {
  const stats = await this.constructor.aggregate([
    { $match: { serviceId: this.serviceId, isPublic: true } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
      }
    }
  ]);
  
  if (stats.length > 0) {
    const Service = require('./Service');
    await Service.findByIdAndUpdate(this.serviceId, {
      averageRating: Math.round(stats[0].averageRating * 10) / 10,
      totalReviews: stats[0].totalReviews,
    });
  }
};

// Add pro reply
reviewSchema.methods.addReply = function(replyContent, isPublic = true) {
  this.reply = {
    content: replyContent,
    repliedAt: new Date(),
    isPublic,
  };
  return this.save();
};

// Check if user can vote
reviewSchema.methods.canUserVote = function(userId) {
  return !this.votedBy.includes(userId);
};

// Add helpful vote
reviewSchema.methods.addHelpfulVote = function(userId) {
  if (this.canUserVote(userId)) {
    this.helpfulVotes += 1;
    this.votedBy.push(userId);
    return this.save();
  }
  throw new Error('User has already voted');
};

module.exports = mongoose.model('Review', reviewSchema);
