const express = require('express');
const { verifyToken } = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

router.use(verifyToken);

// GET /api/users/me - Get current user profile
router.get('/me', (req, res) => {
  const user = req.user.toObject();
  delete user.password;
  res.json(user);
});

// PATCH /api/users/me - Update profile (firstName, lastName, phone, password)
router.patch('/me', async (req, res) => {
  try {
    const { firstName, lastName, phone, currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable.' });

    if (firstName) user.firstName = firstName.trim();
    if (lastName) user.lastName = lastName.trim();
    if (phone !== undefined) user.phone = phone.trim();

    if (newPassword) {
      if (!currentPassword) return res.status(400).json({ message: 'Mot de passe actuel requis.' });
      const valid = await user.comparePassword(currentPassword);
      if (!valid) return res.status(400).json({ message: 'Mot de passe actuel incorrect.' });
      if (newPassword.length < 6) return res.status(400).json({ message: 'Nouveau mot de passe trop court (min. 6 caractères).' });
      user.password = newPassword;
    }

    await user.save();
    const updated = user.toObject();
    delete updated.password;
    res.json({ message: 'Profil mis à jour.', user: updated });
  } catch (err) {
    console.error('PATCH /users/me error:', err);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// PUT /api/users/me — alias kept for compatibility
router.put('/me', (req, res) => res.status(405).json({ message: 'Utilisez PATCH /api/users/me' }));

module.exports = router;
