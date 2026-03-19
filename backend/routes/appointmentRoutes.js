const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { protect } = require('../middleware/auth');
const Appointment = require('../models/Appointment');
const User = require('../models/User');

// GET /api/appointments — list appointments for current user (client or pro)
router.get('/', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const role = req.user.role;

    let query = {};
    if (role === 'client') query.clientId = userId;
    else if (role === 'pro') query.proId = userId;
    // admin sees all

    const appointments = await Appointment.find(query)
      .populate('clientId', 'firstName lastName email phone')
      .populate('proId', 'firstName lastName companyName phone businessDescription')
      .sort({ scheduledDate: -1 })
      .lean();

    res.json({ appointments, total: appointments.length });
  } catch (error) {
    console.error('GET /appointments error:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// GET /api/appointments/:id — get single appointment
router.get('/:id', protect, async (req, res) => {
  try {
    const appt = await Appointment.findById(req.params.id)
      .populate('clientId', 'firstName lastName email phone')
      .populate('proId', 'firstName lastName companyName phone');

    if (!appt) return res.status(404).json({ message: 'Rendez-vous introuvable.' });

    // Check access
    const userId = req.user._id.toString();
    if (
      req.user.role !== 'admin' &&
      appt.clientId?._id?.toString() !== userId &&
      appt.proId?._id?.toString() !== userId
    ) {
      return res.status(403).json({ message: 'Accès refusé.' });
    }

    res.json(appt);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// POST /api/appointments — create appointment (client)
router.post('/', protect, async (req, res) => {
  try {
    if (req.user.role !== 'client' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Seuls les clients peuvent créer des réservations.' });
    }

    const {
      proId, scheduledDate, startTime, endTime, durationMinutes,
      basePrice, finalPrice, clientNotes, serviceAddress,
      serviceName, paymentMode
    } = req.body;

    if (!proId || !scheduledDate || !startTime || !basePrice) {
      return res.status(400).json({ message: 'Données manquantes (proId, scheduledDate, startTime, basePrice requis).' });
    }

    const pro = await User.findById(proId);
    if (!pro || pro.role !== 'pro') {
      return res.status(404).json({ message: 'Professionnel introuvable.' });
    }

    const price = finalPrice || basePrice;
    const deposit = Math.round(price * 0.15 * 100) / 100;

    const appointment = await Appointment.create({
      clientId: req.user._id,
      proId,
      // Use a placeholder ObjectId if no serviceId provided
      serviceId: new mongoose.Types.ObjectId(),
      scheduledDate: new Date(scheduledDate),
      startTime: startTime || '09:00',
      endTime: endTime || '10:00',
      durationMinutes: durationMinutes || 60,
      basePrice: parseFloat(basePrice),
      finalPrice: parseFloat(price),
      depositAmount: deposit,
      depositPaid: paymentMode === 'full' || paymentMode === 'deposit',
      clientNotes,
      serviceAddress,
      serviceName,
      paymentMode,
      status: 'pending',
    });

    res.status(201).json({ message: 'Réservation créée.', appointment });
  } catch (error) {
    console.error('POST /appointments error:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// PATCH /api/appointments/:id/status — update status (cancel, accept, refuse, complete)
router.patch('/:id/status', protect, async (req, res) => {
  try {
    const { status, reason } = req.body;
    const validStatuses = ['pending', 'accepted', 'refused', 'cancelled', 'completed', 'no_show'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Statut invalide.' });
    }

    const appt = await Appointment.findById(req.params.id);
    if (!appt) return res.status(404).json({ message: 'Rendez-vous introuvable.' });

    const userId = req.user._id.toString();
    const isClient = appt.clientId?.toString() === userId;
    const isPro = appt.proId?.toString() === userId;
    const isAdmin = req.user.role === 'admin';

    if (!isClient && !isPro && !isAdmin) {
      return res.status(403).json({ message: 'Accès refusé.' });
    }

    // Clients can only cancel
    if (isClient && status !== 'cancelled') {
      return res.status(403).json({ message: 'Les clients ne peuvent qu\'annuler.' });
    }

    appt.status = status;
    if (status === 'cancelled') {
      appt.cancelledAt = new Date();
      appt.cancelledBy = req.user._id;
      appt.cancellationReason = reason || '';
    }

    appt.statusHistory = appt.statusHistory || [];
    appt.statusHistory.push({ status, changedBy: req.user._id, reason: reason || '' });

    await appt.save();
    res.json({ message: 'Statut mis à jour.', appointment: appt });
  } catch (error) {
    console.error('PATCH /appointments/:id/status error:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

module.exports = router;

