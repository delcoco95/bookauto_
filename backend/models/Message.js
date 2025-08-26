const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true,
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  
  // Message content
  body: {
    type: String,
    required: true,
    maxlength: 1000,
    trim: true,
  },
  
  // File attachments
  attachments: [{
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  
  // Message status
  isRead: {
    type: Boolean,
    default: false,
  },
  readAt: Date,
  
  // Message type
  type: {
    type: String,
    enum: ['text', 'system', 'appointment_update'],
    default: 'text',
  },
  
  // System message data (for appointment updates, etc.)
  systemData: {
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
    },
    action: String, // 'appointment_created', 'appointment_accepted', etc.
    oldStatus: String,
    newStatus: String,
  },
  
  // Soft delete
  isDeleted: {
    type: Boolean,
    default: false,
  },
  deletedAt: Date,
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  
  // Reply to another message (optional)
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
  },
  
}, {
  timestamps: true,
});

// Indexes for efficient queries
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1, createdAt: -1 });
messageSchema.index({ receiverId: 1, isRead: 1 });
messageSchema.index({ type: 1 });

// Pre-save middleware
messageSchema.pre('save', function(next) {
  // Set readAt when message is marked as read
  if (this.isModified('isRead') && this.isRead && !this.readAt) {
    this.readAt = new Date();
  }
  
  // Set deletedAt when message is marked as deleted
  if (this.isModified('isDeleted') && this.isDeleted && !this.deletedAt) {
    this.deletedAt = new Date();
  }
  
  next();
});

// Post-save middleware to update conversation
messageSchema.post('save', async function(doc) {
  if (!doc.isDeleted && doc.type !== 'system') {
    try {
      const Conversation = require('./Conversation');
      const conversation = await Conversation.findById(doc.conversationId);
      
      if (conversation) {
        // Update last message
        conversation.updateLastMessage(doc.body, doc.senderId);
        
        // Increment unread count for receiver
        conversation.incrementUnreadCount(doc.receiverId);
        
        await conversation.save();
      }
    } catch (error) {
      console.error('Error updating conversation after message save:', error);
    }
  }
});

// Static method to create system message
messageSchema.statics.createSystemMessage = async function(conversationId, senderId, receiverId, action, appointmentId = null, additionalData = {}) {
  const systemMessage = new this({
    conversationId,
    senderId,
    receiverId,
    body: this.generateSystemMessageText(action, additionalData),
    type: 'system',
    systemData: {
      appointmentId,
      action,
      ...additionalData,
    },
  });
  
  return systemMessage.save();
};

// Generate human-readable text for system messages
messageSchema.statics.generateSystemMessageText = function(action, data = {}) {
  const messages = {
    'appointment_created': 'Un nouveau rendez-vous a été créé',
    'appointment_accepted': 'Le rendez-vous a été accepté',
    'appointment_refused': 'Le rendez-vous a été refusé',
    'appointment_cancelled': 'Le rendez-vous a été annulé',
    'appointment_completed': 'Le rendez-vous a été marqué comme terminé',
    'payment_received': 'Le paiement a été reçu',
    'refund_processed': 'Le remboursement a été traité',
  };
  
  return messages[action] || 'Mise à jour du système';
};

// Mark message as read
messageSchema.methods.markAsRead = async function() {
  if (!this.isRead) {
    this.isRead = true;
    this.readAt = new Date();
    
    // Also update conversation unread count
    const Conversation = require('./Conversation');
    const conversation = await Conversation.findById(this.conversationId);
    
    if (conversation) {
      conversation.resetUnreadCount(this.receiverId);
      await conversation.save();
    }
    
    await this.save();
  }
};

// Soft delete message
messageSchema.methods.softDelete = function(deletedBy) {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.deletedBy = deletedBy;
  return this.save();
};

module.exports = mongoose.model('Message', messageSchema);
