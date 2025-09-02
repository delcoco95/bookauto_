const express = require('express');
const { body, validationResult } = require('express-validator');
const { verifyToken, requirePro } = require('../middleware/auth');
const { requireProActive } = require('../middleware/proAccess');
const Service = require('../models/Service');

const router = express.Router();

router.use(verifyToken, requirePro); // pro auth

// List my services
router.get('/mine', async (req, res) => {
  const services = await Service.find({ proId: req.user._id }).sort({ createdAt: -1 });
  res.json(services);
});

const validators = [
  body('name').trim().isLength({ min: 2, max: 100 }),
  body('category').isIn(['auto', 'plomberie', 'serrurerie']),
  body('subCategory').trim().isLength({ min: 2 }),
  body('durationMinutes').isInt({ min: 15, max: 480 }),
  body('priceTTC').isFloat({ min: 0 }),
  body('isActive').optional().isBoolean(),
  body('isEmergency').optional().isBoolean(),
  body('requiresDisplacement').optional().isBoolean(),
];

// Create service (requires active subscription)
router.post('/', requireProActive, validators, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const service = await Service.create({ ...req.body, proId: req.user._id });
  res.status(201).json(service);
});

// Update service
router.put('/:id', requireProActive, validators, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const service = await Service.findOneAndUpdate(
    { _id: req.params.id, proId: req.user._id },
    { $set: req.body },
    { new: true }
  );
  if (!service) return res.status(404).json({ message: 'Service non trouvé' });
  res.json(service);
});

// Delete service
router.delete('/:id', requireProActive, async (req, res) => {
  const result = await Service.deleteOne({ _id: req.params.id, proId: req.user._id });
  if (!result.deletedCount) return res.status(404).json({ message: 'Service non trouvé' });
  res.json({ message: 'Supprimé' });
});

module.exports = router;
