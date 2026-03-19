const express = require('express');
const { body } = require('express-validator');
const register = require('../controllers/auth/register');
const login = require('../controllers/auth/login');
const { authLimiter } = require('../middleware/rate');
const forgotPassword = require('../controllers/auth/forgotPassword');
const resetPassword = require('../controllers/auth/resetPassword');

const router = express.Router();

// Apply rate limiting to all auth routes
router.use(authLimiter);

// Validation rules
const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('firstName')
    .trim()
    .isLength({ min: 2 })
    .withMessage('First name must be at least 2 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Last name must be at least 2 characters'),
  body('role')
    .isIn(['client', 'pro'])
    .withMessage('Role must be either client or pro'),
];

const proRegisterValidation = [
  ...registerValidation,
  body('companyName')
    .if(body('role').equals('pro'))
    .trim()
    .isLength({ min: 2 })
    .withMessage('La raison sociale est requise'),
  body('siret')
    .if(body('role').equals('pro'))
    .trim()
    .matches(/^\d{14}$/)
    .withMessage('Le SIRET doit contenir exactement 14 chiffres'),
  body('companyAddress.street')
    .if(body('role').equals('pro'))
    .trim()
    .isLength({ min: 3 })
    .withMessage('L\'adresse est requise (min. 3 caractères)'),
  body('companyAddress.city')
    .if(body('role').equals('pro'))
    .trim()
    .isLength({ min: 2 })
    .withMessage('La ville est requise'),
  body('companyAddress.zipCode')
    .if(body('role').equals('pro'))
    .trim()
    .isLength({ min: 5, max: 5 })
    .withMessage('Le code postal doit contenir 5 chiffres'),
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
];

// Routes
router.post('/register', proRegisterValidation, register);
router.post('/login', loginValidation, login);

// Password reset
router.post(
  '/forgot-password',
  forgotPassword.validate,
  forgotPassword.handler
);
router.post('/reset-password', resetPassword.validate, resetPassword.handler);

module.exports = router;
