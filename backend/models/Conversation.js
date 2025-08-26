const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }],
  
  // Soft delete mechanism - users can "delete" conversation from their view
  deletedFor: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    deletedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  
  // Last message info for quick access
  lastMessage: {
    content: String,
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    sentAt: Date,
  },
  
  // Related appointment (optional)
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
  },
  
  // Conversation metadata
  title: String, // Optional title for the conversation
  isActive: {
    type: Boolean,
    default: true,
  },
  
  // Unread message counts per participant
  unreadCounts: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    count: {
      type: Number,
      default: 0,
    },
  }],
  
}, {
  timestamps: true,
});

// Compound indexes for efficient queries
conversationSchema.index({ participants: 1, isActive: 1 });
conversationSchema.index({ 'lastMessage.sentAt': -1 });
conversationSchema.index({ appointmentId: 1 });

// Ensure exactly 2 participants (for this version)
conversationSchema.pre('save', function(next) {
  if (this.participants.length !== 2) {
    return next(new Error('Conversation must have exactly 2 participants'));
  }
  
  // Remove duplicate participants
  this.participants = [...new Set(this.participants.map(p => p.toString()))];
  
  next();
});

// Static method to find or create conversation between two users
conversationSchema.statics.findOrCreateBetweenUsers = async function(userId1, userId2, appointmentId = null) {
  // Try to find existing conversation
  let conversation = await this.findOne({
    participants: { $all: [userId1, userId2] },
    isActive: true,
  });
  
  if (!conversation) {
    // Create new conversation
    conversation = new this({
      participants: [userId1, userId2],
      appointmentId,
      unreadCounts: [
        { userId: userId1, count: 0 },
        { userId: userId2, count: 0 },
      ],
    });
    
    await conversation.save();
  }
  
  return conversation;
};

// Check if conversation is deleted for a specific user
conversationSchema.methods.isDeletedForUser = function(userId) {
  return this.deletedFor.some(
    deleted => deleted.userId.toString() === userId.toString()
  );
};

// Mark conversation as deleted for a user
conversationSchema.methods.deleteForUser = function(userId) {
  const existingDelete = this.deletedFor.find(
    deleted => deleted.userId.toString() === userId.toString()
  );
  
  if (!existingDelete) {
    this.deletedFor.push({ userId, deletedAt: new Date() });
  } else {
    existingDelete.deletedAt = new Date();
  }
};

// Update last message
conversationSchema.methods.updateLastMessage = function(messageContent, senderId) {
  this.lastMessage = {
    content: messageContent.substring(0, 100), // Truncate for storage
    senderId,
    sentAt: new Date(),
  };
};

// Increment unread count for a user
conversationSchema.methods.incrementUnreadCount = function(userId) {
  const unreadCount = this.unreadCounts.find(
    count => count.userId.toString() === userId.toString()
  );
  
  if (unreadCount) {
    unreadCount.count += 1;
  } else {
    this.unreadCounts.push({ userId, count: 1 });
  }
};

// Reset unread count for a user
conversationSchema.methods.resetUnreadCount = function(userId) {
  const unreadCount = this.unreadCounts.find(
    count => count.userId.toString() === userId.toString()
  );
  
  if (unreadCount) {
    unreadCount.count = 0;
  }
};

module.exports = mongoose.model('Conversation', conversationSchema);
