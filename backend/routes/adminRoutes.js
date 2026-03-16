const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');
const Appointment = require('../models/Appointment');

const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Accès réservé à l\'administrateur.' });
  next();
};

// GET /api/admin/users — list all users
router.get('/users', protect, isAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// GET /api/admin/stats — global platform stats
router.get('/stats', protect, isAdmin, async (req, res) => {
  try {
    const [totalUsers, totalPros, totalClients, totalAppointments] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'pro' }),
      User.countDocuments({ role: 'client' }),
      Appointment.countDocuments(),
    ]);
    const activeSubs = await User.countDocuments({ role: 'pro', subscriptionStatus: { $in: ['active', 'trialing'] } });
    res.json({ totalUsers, totalPros, totalClients, totalAppointments, activeSubs });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// PATCH /api/admin/users/:id/exempt — grant/revoke exemption
router.patch('/users/:id/exempt', protect, isAdmin, async (req, res) => {
  try {
    const { exempt } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        isExempt: exempt,
        subscriptionStatus: exempt ? 'exempt' : 'inactive',
      },
      { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable.' });
    res.json({ message: exempt ? 'Exemption accordée.' : 'Exemption retirée.', user });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// PATCH /api/admin/users/:id/status — activate/deactivate account
router.patch('/users/:id/status', protect, isAdmin, async (req, res) => {
  try {
    const { isActive } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { isActive }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable.' });
    res.json({ message: `Compte ${isActive ? 'activé' : 'désactivé'}.`, user });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', protect, isAdmin, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Utilisateur supprimé.' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

module.exports = router;
