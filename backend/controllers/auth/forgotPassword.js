const crypto = require('crypto');
const { body, validationResult } = require('express-validator');
const User = require('../../models/User');
const { sendEmail } = require('../../config/mailer');

exports.validate = [
  body('email').isEmail().normalizeEmail().withMessage('Email invalide'),
];

exports.handler = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation échouée', errors: errors.array() });
    }

    const { email } = req.body;

    // Always respond success to avoid user enumeration
    const genericResponse = {
      message: 'Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.'
    };

    const user = await User.findOne({ email });
    if (!user) {
      return res.json(genericResponse);
    }

    // Generate token
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1h

    user.passwordResetToken = token;
    user.passwordResetExpires = expires;
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;

    const html = `
      <h2>Réinitialisation de mot de passe</h2>
      <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
      <p>Cliquez sur le lien ci-dessous pour définir un nouveau mot de passe (valide 1 heure):</p>
      <p><a href="${resetUrl}">Réinitialiser mon mot de passe</a></p>
      <p>Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>
    `;

    await sendEmail(user.email, 'Réinitialisation de mot de passe', html);

    return res.json(genericResponse);
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};
