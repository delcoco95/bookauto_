const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Appointment = require('../models/Appointment');
const User = require('../models/User');

// POST /api/invoices/generate/:appointmentId
router.post('/generate/:appointmentId', protect, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.appointmentId)
      .populate('pro', 'firstName lastName companyName companyAddress email phone siret')
      .populate('client', 'firstName lastName email');

    if (!appointment) return res.status(404).json({ message: 'Rendez-vous introuvable.' });
    if (appointment.pro._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Accès refusé.' });
    }

    const pro = appointment.pro;
    const client = appointment.client;
    const invoiceNumber = `INV-${Date.now()}`;
    const date = new Date().toLocaleDateString('fr-FR');
    const amount = appointment.finalPrice || appointment.price || 0;

    // Generate HTML invoice (lightweight, no pdfkit dependency needed for basic version)
    const html = `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><title>Facture ${invoiceNumber}</title>
<style>body{font-family:Arial,sans-serif;max-width:800px;margin:40px auto;color:#333}
.header{display:flex;justify-content:space-between;margin-bottom:40px}
.company h2{color:#3b82f6}table{width:100%;border-collapse:collapse;margin:20px 0}
th{background:#3b82f6;color:white;padding:10px;text-align:left}
td{padding:10px;border-bottom:1px solid #eee}.total{font-size:1.3em;font-weight:bold;text-align:right;margin-top:20px;color:#3b82f6}
.footer{margin-top:60px;font-size:0.8em;color:#888;text-align:center}</style>
</head>
<body>
<div class="header">
  <div class="company">
    <h2>${pro.companyName || `${pro.firstName} ${pro.lastName}`}</h2>
    <p>${pro.companyAddress?.street || ''}<br>${pro.companyAddress?.zipCode || ''} ${pro.companyAddress?.city || ''}<br>SIRET: ${pro.siret || 'N/A'}<br>${pro.email}</p>
  </div>
  <div><h1 style="color:#3b82f6">FACTURE</h1><p><strong>N°:</strong> ${invoiceNumber}<br><strong>Date:</strong> ${date}</p></div>
</div>
<h3>Client</h3>
<p>${client.firstName} ${client.lastName}<br>${client.email}</p>
<table>
  <thead><tr><th>Service</th><th>Date</th><th>Montant</th></tr></thead>
  <tbody>
    <tr><td>${appointment.serviceDescription || 'Service automobile'}</td><td>${new Date(appointment.date).toLocaleDateString('fr-FR')}</td><td>${amount.toFixed(2)} €</td></tr>
  </tbody>
</table>
<div class="total">Total TTC: ${amount.toFixed(2)} €</div>
<div class="footer"><p>BookAuto — Plateforme de réservation de services<br>Merci de votre confiance !</p></div>
</body></html>`;

    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Content-Disposition', `attachment; filename="facture-${invoiceNumber}.html"`);
    res.send(html);
  } catch (error) {
    console.error('Invoice error:', error);
    res.status(500).json({ message: 'Erreur lors de la génération de la facture.', error: error.message });
  }
});

// GET /api/invoices/pro — list appointments eligible for invoice
router.get('/pro', protect, async (req, res) => {
  try {
    const appointments = await Appointment.find({ pro: req.user.id, status: 'completed' })
      .populate('client', 'firstName lastName email')
      .sort({ updatedAt: -1 });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

module.exports = router;
