const { body, validationResult } = require('express-validator');
const User = require('../../models/User');

exports.validate = [
  body('token').isString().withMessage('Token requis'),
  body('password').isLength({ min: 6 }).withMessage('Mot de passe trop court'),
];

exports.handler = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.length === 0 && !errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation échouée', errors: errors.array() });
    }

    const { token, password } = req.body;

    const user = await User.findOne({ passwordResetToken: token, passwordResetExpires: { $gt: new Date() } }).select('+password');
    if (!user) {
      return res.status(400).json({ message: 'Lien invalide ou expiré' });
    }

    user.password = password; // will be hashed by pre-save hook
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    return res.json({ message: 'Mot de passe mis à jour avec succès' });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};
