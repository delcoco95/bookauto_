const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const nodemailer = require('nodemailer');

const COMMISSION = 0.15;

const getTransporter = () => nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

// GET /api/payouts/balance
router.get('/balance', protect, async (req, res) => {
  try {
    const appointments = await Appointment.find({ proId: req.user._id, status: 'completed', isPaidOut: { $ne: true } });
    const availableBalance = appointments.reduce((sum, a) => {
      return sum + ((a.finalPrice || a.basePrice || 0) * (1 - COMMISSION));
    }, 0);
    const allCompleted = await Appointment.find({ proId: req.user._id, status: 'completed' });
    const totalEarned = allCompleted.reduce((sum, a) => sum + ((a.finalPrice || a.basePrice || 0) * (1 - COMMISSION)), 0);
    res.json({
      availableBalance: Math.round(availableBalance * 100) / 100,
      totalEarned: Math.round(totalEarned * 100) / 100,
      commissionRate: COMMISSION,
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// POST /api/payouts/request
router.post('/request', protect, async (req, res) => {
  try {
    const { iban, bankName, amount } = req.body;
    if (!iban || !bankName || !amount) return res.status(400).json({ message: 'IBAN, nom de banque et montant requis.' });
    if (amount <= 0) return res.status(400).json({ message: 'Montant invalide.' });

    const appointments = await Appointment.find({ proId: req.user._id, status: 'completed', isPaidOut: { $ne: true } });
    const availableBalance = appointments.reduce((sum, a) => sum + ((a.finalPrice || a.basePrice || 0) * (1 - COMMISSION)), 0);

    if (amount > availableBalance) return res.status(400).json({ message: `Solde insuffisant. Disponible: ${availableBalance.toFixed(2)}€` });

    const user = await User.findById(req.user._id);

    // Send email to admin
    try {
      const transporter = getTransporter();
      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: process.env.ADMIN_EMAIL || 'admin@bookauto.fr',
        subject: `[BookAuto] Demande de virement — ${user.firstName} ${user.lastName}`,
        html: `<h2>Demande de virement</h2><p><strong>Professionnel:</strong> ${user.firstName} ${user.lastName} (${user.email})</p><p><strong>Entreprise:</strong> ${user.companyName}</p><p><strong>IBAN:</strong> ${iban}</p><p><strong>Banque:</strong> ${bankName}</p><p><strong>Montant demandé:</strong> ${amount}€</p><p><strong>Date:</strong> ${new Date().toLocaleDateString('fr-FR')}</p>`,
      });
    } catch (mailError) {
      console.error('Email error:', mailError);
    }

    res.json({ message: `Demande de virement de ${amount}€ envoyée. Traitement sous 3-5 jours ouvrés.` });
  } catch (error) {
    console.error('Payout request error:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

module.exports = router;
