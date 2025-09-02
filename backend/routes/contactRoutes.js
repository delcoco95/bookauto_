const express = require('express');
const { body, validationResult } = require('express-validator');
const { sendEmail } = require('../config/mailer');

const router = express.Router();

router.post('/', [
  body('name').trim().isLength({ min: 2 }),
  body('email').isEmail().normalizeEmail(),
  body('subject').trim().isLength({ min: 3, max: 150 }),
  body('message').trim().isLength({ min: 10, max: 2000 }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { name, email, subject, message } = req.body;
  const html = `
    <p><strong>De:</strong> ${name} &lt;${email}&gt;</p>
    <p><strong>Sujet:</strong> ${subject}</p>
    <p>${message.replace(/\n/g, '<br/>')}</p>
  `;

  const to = process.env.SMTP_USER || 'contact@example.com';
  const result = await sendEmail(to, `Contact Bookauto - ${subject}`, html);
  if (!result.success) return res.status(500).json({ message: 'Envoi impossible' });
  res.json({ message: 'Message envoyé' });
});

module.exports = router;
