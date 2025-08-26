const express = require('express');
const { verifyToken, requireClient, requirePro } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const Review = require('../models/Review');
const Appointment = require('../models/Appointment');

const router = express.Router();

// Get reviews for a professional
router.get('/pro/:proId', async (req, res) => {
  try {
    const { proId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const reviews = await Review.find({
      proId,
      isPublic: true,
    })
    .populate('clientId', 'firstName lastName')
    .populate('serviceId', 'name')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);

    const total = await Review.countDocuments({ proId, isPublic: true });

    res.json({
      reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasMore: skip + reviews.length < total,
      },
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ message: 'Erreur lors du chargement des avis' });
  }
});

// Create a review (client only)
router.post('/', verifyToken, requireClient, [
  body('appointmentId').isMongoId().withMessage('ID rendez-vous invalide'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Note entre 1 et 5 requise'),
  body('comment').trim().isLength({ min: 10, max: 500 }).withMessage('Commentaire entre 10 et 500 caractères requis'),
  body('detailedRatings.punctuality').optional().isInt({ min: 1, max: 5 }),
  body('detailedRatings.quality').optional().isInt({ min: 1, max: 5 }),
  body('detailedRatings.communication').optional().isInt({ min: 1, max: 5 }),
  body('detailedRatings.value').optional().isInt({ min: 1, max: 5 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { appointmentId, rating, comment, detailedRatings } = req.body;
    const clientId = req.user._id;

    // Check if appointment exists and belongs to client
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      clientId,
      status: 'completed',
    }).populate('serviceId').populate('proId');

    if (!appointment) {
      return res.status(404).json({ 
        message: 'Rendez-vous non trouvé ou non terminé' 
      });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({
      appointmentId,
      clientId,
    });

    if (existingReview) {
      return res.status(400).json({ 
        message: 'Vous avez déjà laissé un avis pour ce rendez-vous' 
      });
    }

    // Create review
    const review = new Review({
      proId: appointment.proId._id,
      clientId,
      appointmentId,
      serviceId: appointment.serviceId._id,
      rating,
      comment,
      detailedRatings,
    });

    await review.save();
    await review.populate('clientId', 'firstName lastName');
    await review.populate('serviceId', 'name');

    res.status(201).json(review);
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ message: 'Erreur lors de la création de l\'avis' });
  }
});

// Reply to a review (pro only)
router.post('/:reviewId/reply', verifyToken, requirePro, [
  body('content').trim().isLength({ min: 10, max: 500 }).withMessage('Réponse entre 10 et 500 caractères requise'),
  body('isPublic').optional().isBoolean(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { reviewId } = req.params;
    const { content, isPublic = true } = req.body;
    const proId = req.user._id;

    const review = await Review.findOne({
      _id: reviewId,
      proId,
    });

    if (!review) {
      return res.status(404).json({ message: 'Avis non trouvé' });
    }

    if (review.reply && review.reply.content) {
      return res.status(400).json({ 
        message: 'Vous avez déjà répondu à cet avis' 
      });
    }

    await review.addReply(content, isPublic);

    res.json({ message: 'Réponse ajoutée avec succès', review });
  } catch (error) {
    console.error('Error replying to review:', error);
    res.status(500).json({ message: 'Erreur lors de l\'ajout de la réponse' });
  }
});

// Get reviews for current user (client)
router.get('/my-reviews', verifyToken, requireClient, async (req, res) => {
  try {
    const clientId = req.user._id;
    
    const reviews = await Review.find({ clientId })
      .populate('proId', 'companyName firstName lastName')
      .populate('serviceId', 'name')
      .populate('appointmentId', 'scheduledDate')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    console.error('Error fetching client reviews:', error);
    res.status(500).json({ message: 'Erreur lors du chargement de vos avis' });
  }
});

// Get reviews received by pro
router.get('/received', verifyToken, requirePro, async (req, res) => {
  try {
    const proId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const reviews = await Review.find({ proId })
      .populate('clientId', 'firstName lastName')
      .populate('serviceId', 'name')
      .populate('appointmentId', 'scheduledDate')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Review.countDocuments({ proId });

    // Calculate average rating
    const ratingStats = await Review.aggregate([
      { $match: { proId: proId, isPublic: true } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          ratings: { $push: '$rating' }
        }
      }
    ]);

    const stats = ratingStats[0] || { averageRating: 0, totalReviews: 0, ratings: [] };
    
    // Count ratings by star
    const ratingDistribution = [1, 2, 3, 4, 5].map(star => ({
      star,
      count: stats.ratings.filter(r => r === star).length
    }));

    res.json({
      reviews,
      stats: {
        averageRating: Math.round(stats.averageRating * 10) / 10,
        totalReviews: stats.totalReviews,
        ratingDistribution,
      },
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasMore: skip + reviews.length < total,
      },
    });
  } catch (error) {
    console.error('Error fetching pro reviews:', error);
    res.status(500).json({ message: 'Erreur lors du chargement des avis reçus' });
  }
});

// Vote helpful on review
router.post('/:reviewId/helpful', verifyToken, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user._id;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Avis non trouvé' });
    }

    if (!review.canUserVote(userId)) {
      return res.status(400).json({ 
        message: 'Vous avez déjà voté pour cet avis' 
      });
    }

    await review.addHelpfulVote(userId);

    res.json({ 
      message: 'Vote enregistré', 
      helpfulVotes: review.helpfulVotes 
    });
  } catch (error) {
    console.error('Error voting on review:', error);
    res.status(500).json({ message: 'Erreur lors du vote' });
  }
});

module.exports = router;
