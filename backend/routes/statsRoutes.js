const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');
const Appointment = require('../models/Appointment');

const COMMISSION = 0.15;

// GET /api/stats/pro — pro dashboard stats
router.get('/pro', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const appointments = await Appointment.find({ proId: userId });

    const completed = appointments.filter(a => a.status === 'completed');
    const pending = appointments.filter(a => a.status === 'pending');
    const cancelled = appointments.filter(a => a.status === 'cancelled');

    const totalEarned = completed.reduce((sum, a) => {
      const price = a.finalPrice || a.basePrice || 0;
      return sum + (price * (1 - COMMISSION));
    }, 0);

    const availableBalance = completed
      .filter(a => !a.isPaidOut)
      .reduce((sum, a) => {
        const price = a.finalPrice || a.basePrice || 0;
        return sum + (price * (1 - COMMISSION));
      }, 0);

    // Monthly revenue (last 6 months)
    const now = new Date();
    const monthlyRevenue = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleString('fr-FR', { month: 'short' });
      const monthCompleted = completed.filter(a => {
        const ad = new Date(a.updatedAt);
        return ad.getMonth() === d.getMonth() && ad.getFullYear() === d.getFullYear();
      });
      const revenue = monthCompleted.reduce((sum, a) => sum + ((a.finalPrice || a.basePrice || 0) * (1 - COMMISSION)), 0);
      monthlyRevenue.push({ month: label, revenue: Math.round(revenue * 100) / 100 });
    }

    res.json({
      total: appointments.length,
      completed: completed.length,
      pending: pending.length,
      cancelled: cancelled.length,
      totalEarned: Math.round(totalEarned * 100) / 100,
      availableBalance: Math.round(availableBalance * 100) / 100,
      commissionRate: COMMISSION,
      monthlyRevenue,
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

module.exports = router;
