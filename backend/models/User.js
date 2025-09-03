const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  role: {
    type: String,
    enum: ['client', 'pro'],
    required: true,
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  avatar: {
    type: String, // URL to avatar image
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  
  // Pro-specific fields
  companyName: {
    type: String,
    trim: true,
    required: function() { return this.role === 'pro'; }
  },
  siret: {
    type: String,
    unique: true,
    sparse: true,
    required: function() { return this.role === 'pro'; }
  },
  companyAddress: {
    street: String,
    city: String,
    zipCode: String,
    country: { type: String, default: 'France' }
  },
  businessDescription: {
    type: String,
    maxlength: 500,
  },
  categories: [{
    type: String,
    enum: ['auto', 'plomberie', 'serrurerie'],
  }],
  subCategories: [String],
  
  // Geolocation
  latitude: Number,
  longitude: Number,
  serviceRadius: {
    type: Number,
    default: 30, // km
  },
  
  // Subscription
  subscriptionStatus: {
    type: String,
    enum: ['inactive', 'trialing', 'active', 'past_due', 'canceled', 'unpaid'],
    default: 'inactive',
  },
  subscriptionId: String,
  subscriptionEndsAt: Date,
  
  // Schedule (pro only)
  defaultSchedule: {
    monday: { isOpen: Boolean, start: String, end: String },
    tuesday: { isOpen: Boolean, start: String, end: String },
    wednesday: { isOpen: Boolean, start: String, end: String },
    thursday: { isOpen: Boolean, start: String, end: String },
    friday: { isOpen: Boolean, start: String, end: String },
    saturday: { isOpen: Boolean, start: String, end: String },
    sunday: { isOpen: Boolean, start: String, end: String },
  },
  
  // Stats
  totalRatings: { type: Number, default: 0 },
  averageRating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
  
  // Verification
  isEmailVerified: { type: Boolean, default: false },
  isSiretVerified: { type: Boolean, default: false },

  // Password reset
  passwordResetToken: String,
  passwordResetExpires: Date,

}, {
  timestamps: true,
});

// Index for geospatial queries
userSchema.index({ latitude: 1, longitude: 1 });
userSchema.index({ categories: 1 });
userSchema.index({ role: 1, isActive: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};


module.exports = mongoose.model('User', userSchema);
