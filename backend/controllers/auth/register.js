const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const { geocodeAddress } = require('../../config/geo');
const { sendEmail } = require('../../config/mailer');

const register = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      email,
      password,
      firstName,
      lastName,
      phone,
      role,
      companyName,
      siret,
      companyAddress,
      businessDescription,
      categories
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        message: 'Un utilisateur avec cet email existe déjà' 
      });
    }

    // For pros, check if SIRET already exists
    if (role === 'pro' && siret) {
      const existingSiret = await User.findOne({ siret });
      if (existingSiret) {
        return res.status(400).json({ 
          message: 'Ce SIRET est déjà utilisé par un autre professionnel' 
        });
      }
    }

    // Create user data
    const userData = {
      email,
      password,
      firstName,
      lastName,
      phone,
      role,
    };

    // Add pro-specific fields
    if (role === 'pro') {
      userData.companyName = companyName;
      userData.siret = siret;
      userData.companyAddress = companyAddress;
      userData.businessDescription = businessDescription;
      userData.categories = categories || [];

      // Geocode company address for pros
      if (companyAddress && companyAddress.street && companyAddress.city) {
        const fullAddress = `${companyAddress.street}, ${companyAddress.city}, ${companyAddress.zipCode}`;
        const geoData = await geocodeAddress(fullAddress);
        
        if (geoData) {
          userData.latitude = geoData.lat;
          userData.longitude = geoData.lng;
        }
      }

      // Set default schedule for pros
      userData.defaultSchedule = {
        monday: { isOpen: true, start: '08:00', end: '18:00' },
        tuesday: { isOpen: true, start: '08:00', end: '18:00' },
        wednesday: { isOpen: true, start: '08:00', end: '18:00' },
        thursday: { isOpen: true, start: '08:00', end: '18:00' },
        friday: { isOpen: true, start: '08:00', end: '18:00' },
        saturday: { isOpen: true, start: '08:00', end: '16:00' },
        sunday: { isOpen: false, start: '', end: '' }
      };
    }

    // Create user
    const user = new User(userData);
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Send welcome email
    const emailSubject = role === 'pro' ? 
      'Bienvenue sur Bookauto - Compte Professionnel' : 
      'Bienvenue sur Bookauto';
    
    const emailContent = `
      <h2>Bienvenue sur Bookauto !</h2>
      <p>Bonjour ${firstName},</p>
      <p>Votre compte ${role === 'pro' ? 'professionnel' : 'client'} a été créé avec succès.</p>
      ${role === 'pro' ? 
        '<p>Vous pouvez maintenant créer vos services et commencer à recevoir des réservations.</p>' :
        '<p>Vous pouvez maintenant rechercher et réserver des services.</p>'
      }
      <p>Merci de faire confiance à Bookauto !</p>
    `;

    await sendEmail(email, emailSubject, emailContent);

    // Return user data (without password) and token
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      message: 'Inscription réussie',
      user: userResponse,
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      message: 'Erreur lors de l\'inscription',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

module.exports = register;
