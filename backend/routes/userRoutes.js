const express = require('express');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Apply authentication to all user routes
router.use(verifyToken);

// GET /api/users/me - Get current user profile
router.get('/me', (req, res) => {
  const user = req.user.toObject();
  delete user.password;
  res.json(user);
});

// PUT /api/users/me - Update current user profile
router.put('/me', (req, res) => {
  res.status(501).json({ message: 'Not implemented yet' });
});

// GET /api/users/me/export - Export user data (GDPR)
router.get('/me/export', (req, res) => {
  res.status(501).json({ message: 'Not implemented yet' });
});

// DELETE /api/users/me - Delete user account (GDPR)
router.delete('/me', (req, res) => {
  res.status(501).json({ message: 'Not implemented yet' });
});

module.exports = router;
