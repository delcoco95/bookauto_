const express = require('express');
const { verifyToken } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

const router = express.Router();

// Apply authentication to all routes
router.use(verifyToken);

// Get all conversations for current user
router.get('/conversations', async (req, res) => {
  try {
    const userId = req.user._id;
    
    const conversations = await Conversation.find({
      participants: userId,
      isActive: true,
      $nor: [{ deletedFor: { $elemMatch: { userId } } }]
    })
    .populate('participants', 'firstName lastName companyName role avatar')
    .populate('appointmentId', 'serviceId scheduledDate')
    .sort({ 'lastMessage.sentAt': -1 });

    res.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ message: 'Erreur lors du chargement des conversations' });
  }
});

// Create or get conversation between two users
router.post('/conversations', [
  body('participantId').isMongoId().withMessage('ID participant invalide'),
  body('appointmentId').optional().isMongoId().withMessage('ID rendez-vous invalide'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { participantId, appointmentId } = req.body;
    const userId = req.user._id;

    if (participantId === userId.toString()) {
      return res.status(400).json({ message: 'Impossible de créer une conversation avec soi-même' });
    }

    const conversation = await Conversation.findOrCreateBetweenUsers(
      userId, 
      participantId, 
      appointmentId
    );

    await conversation.populate('participants', 'firstName lastName companyName role avatar');
    await conversation.populate('appointmentId', 'serviceId scheduledDate');

    res.json(conversation);
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ message: 'Erreur lors de la création de la conversation' });
  }
});

// Get messages for a conversation
router.get('/conversations/:id/messages', async (req, res) => {
  try {
    const conversationId = req.params.id;
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    // Check if user is participant in conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId,
      isActive: true,
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation non trouvée' });
    }

    // Check if conversation is deleted for this user
    if (conversation.isDeletedForUser(userId)) {
      return res.status(404).json({ message: 'Conversation non trouvée' });
    }

    const messages = await Message.find({
      conversationId,
      isDeleted: false,
    })
    .populate('senderId', 'firstName lastName companyName role')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);

    // Mark messages as read for the current user
    await Message.updateMany(
      {
        conversationId,
        receiverId: userId,
        isRead: false,
      },
      {
        isRead: true,
        readAt: new Date(),
      }
    );

    // Reset unread count for this user in conversation
    conversation.resetUnreadCount(userId);
    await conversation.save();

    res.json({
      messages: messages.reverse(), // Send in chronological order
      hasMore: messages.length === limit,
      page,
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Erreur lors du chargement des messages' });
  }
});

// Send a message
router.post('/conversations/:id/messages', [
  body('body').trim().isLength({ min: 1, max: 1000 }).withMessage('Le message doit contenir entre 1 et 1000 caractères'),
  body('replyTo').optional().isMongoId().withMessage('ID message de réponse invalide'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const conversationId = req.params.id;
    const userId = req.user._id;
    const { body: messageBody, replyTo } = req.body;

    // Check if user is participant in conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId,
      isActive: true,
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation non trouvée' });
    }

    // Check if conversation is deleted for this user
    if (conversation.isDeletedForUser(userId)) {
      return res.status(404).json({ message: 'Conversation non trouvée' });
    }

    // Get receiver (the other participant)
    const receiverId = conversation.participants.find(
      p => p.toString() !== userId.toString()
    );

    // Create message
    const message = new Message({
      conversationId,
      senderId: userId,
      receiverId,
      body: messageBody,
      replyTo,
    });

    await message.save();
    await message.populate('senderId', 'firstName lastName companyName role');

    res.status(201).json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Erreur lors de l\'envoi du message' });
  }
});

// Delete conversation for current user (soft delete)
router.delete('/conversations/:id', async (req, res) => {
  try {
    const conversationId = req.params.id;
    const userId = req.user._id;

    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId,
      isActive: true,
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation non trouvée' });
    }

    // Mark conversation as deleted for this user
    conversation.deleteForUser(userId);
    await conversation.save();

    res.json({ message: 'Conversation supprimée' });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression' });
  }
});

// Get unread message count
router.get('/unread-count', async (req, res) => {
  try {
    const userId = req.user._id;

    const unreadCount = await Message.countDocuments({
      receiverId: userId,
      isRead: false,
      isDeleted: false,
    });

    res.json({ unreadCount });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({ message: 'Erreur lors du comptage des messages non lus' });
  }
});

module.exports = router;
