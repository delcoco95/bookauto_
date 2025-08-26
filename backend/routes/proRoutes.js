const express = require('express');
const router = express.Router();

router.post('/verify-siret', (req, res) => {
  res.status(501).json({ message: 'Not implemented yet' });
});

module.exports = router;
