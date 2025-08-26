const express = require('express');
const { verifyToken, requirePro } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const verifySiret = require('../controllers/pro/verifySiret');
const { geocodeAddress } = require('../config/geo');

const router = express.Router();

// SIRET verification endpoint (public)
router.post('/verify-siret', [
  body('siret')
    .trim()
    .isLength({ min: 14, max: 14 })
    .withMessage('SIRET doit contenir exactement 14 chiffres')
    .isNumeric()
    .withMessage('SIRET ne doit contenir que des chiffres'),
], verifySiret);

// Update pro profile (protected)
router.put('/profile', verifyToken, requirePro, [
  body('companyName').optional().trim().isLength({ min: 2 }).withMessage('Nom de l\'entreprise requis'),
  body('businessDescription').optional().trim().isLength({ max: 500 }).withMessage('Description trop longue'),
  body('phone').optional().trim(),
  body('companyAddress.street').optional().trim(),
  body('companyAddress.city').optional().trim(),
  body('companyAddress.zipCode').optional().trim().isLength({ min: 5, max: 5 }),
  body('categories').optional().isArray(),
  body('serviceRadius').optional().isInt({ min: 5, max: 100 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const User = require('../models/User');
    const userId = req.user._id;
    const updateData = req.body;

    // If address is updated, geocode it
    if (updateData.companyAddress) {
      const { street, city, zipCode } = updateData.companyAddress;
      if (street && city && zipCode) {
        const fullAddress = `${street}, ${city}, ${zipCode}`;
        const geoData = await geocodeAddress(fullAddress);
        
        if (geoData) {
          updateData.latitude = geoData.lat;
          updateData.longitude = geoData.lng;
        }
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, select: '-password' }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.json({
      message: 'Profil mis à jour avec succès',
      user: updatedUser,
    });

  } catch (error) {
    console.error('Error updating pro profile:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour du profil' });
  }
});

// Update pro schedule
router.put('/schedule', verifyToken, requirePro, [
  body('defaultSchedule').isObject().withMessage('Planning par défaut requis'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const User = require('../models/User');
    const userId = req.user._id;
    const { defaultSchedule } = req.body;

    // Validate schedule format
    const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    for (const day of daysOfWeek) {
      if (!defaultSchedule[day]) {
        return res.status(400).json({ 
          message: `Planning manquant pour ${day}` 
        });
      }
      
      const daySchedule = defaultSchedule[day];
      if (typeof daySchedule.isOpen !== 'boolean') {
        return res.status(400).json({ 
          message: `Statut d'ouverture invalide pour ${day}` 
        });
      }
      
      if (daySchedule.isOpen) {
        if (!daySchedule.start || !daySchedule.end) {
          return res.status(400).json({ 
            message: `Heures d'ouverture manquantes pour ${day}` 
          });
        }
        
        // Validate time format (HH:MM)
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(daySchedule.start) || !timeRegex.test(daySchedule.end)) {
          return res.status(400).json({ 
            message: `Format d'heure invalide pour ${day} (HH:MM attendu)` 
          });
        }
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { defaultSchedule } },
      { new: true, select: '-password' }
    );

    res.json({
      message: 'Planning mis à jour avec succès',
      schedule: updatedUser.defaultSchedule,
    });

  } catch (error) {
    console.error('Error updating pro schedule:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour du planning' });
  }
});

// Get pro statistics
router.get('/stats', verifyToken, requirePro, async (req, res) => {
  try {
    const Appointment = require('../models/Appointment');
    const Service = require('../models/Service');
    const Review = require('../models/Review');
    const proId = req.user._id;

    // Get basic stats
    const [appointmentStats, serviceStats, reviewStats] = await Promise.all([
      Appointment.aggregate([
        { $match: { proId } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalRevenue: { $sum: '$finalPrice' }
          }
        }
      ]),
      Service.countDocuments({ proId, isActive: true }),
      Review.aggregate([
        { $match: { proId, isPublic: true } },
        {
          $group: {
            _id: null,
            averageRating: { $avg: '$rating' },
            totalReviews: { $sum: 1 }
          }
        }
      ])
    ]);

    // Process appointment stats
    const processedStats = {
      totalAppointments: 0,
      completedAppointments: 0,
      pendingAppointments: 0,
      totalRevenue: 0,
      activeServices: serviceStats,
      averageRating: 0,
      totalReviews: 0,
    };

    appointmentStats.forEach(stat => {
      processedStats.totalAppointments += stat.count;
      if (stat._id === 'completed') {
        processedStats.completedAppointments = stat.count;
        processedStats.totalRevenue = stat.totalRevenue || 0;
      } else if (stat._id === 'pending') {
        processedStats.pendingAppointments = stat.count;
      }
    });

    if (reviewStats.length > 0) {
      processedStats.averageRating = Math.round(reviewStats[0].averageRating * 10) / 10;
      processedStats.totalReviews = reviewStats[0].totalReviews;
    }

    // Get monthly revenue for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyRevenue = await Appointment.aggregate([
      {
        $match: {
          proId,
          status: 'completed',
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$finalPrice' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({
      ...processedStats,
      monthlyRevenue,
    });

  } catch (error) {
    console.error('Error fetching pro stats:', error);
    res.status(500).json({ message: 'Erreur lors du chargement des statistiques' });
  }
});

module.exports = router;
