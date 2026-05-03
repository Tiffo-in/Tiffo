/**
 * validate.js
 * Express-validator based request validation middleware factory.
 * 
 * Usage:
 *   const { validate, registerValidator } = require('../middlewares/validate');
 *   router.post('/register', registerValidator, validate, controller);
 */
const { body, validationResult } = require('express-validator');

/**
 * Runs express-validator's result check and returns a 422 with field errors
 * if any validation rule failed.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

// ── Validators ────────────────────────────────────────────────────────────────

const registerValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 60 }).withMessage('Name must be between 2 and 60 characters'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/\d/).withMessage('Password must contain at least one number'),

  body('phone')
    .trim()
    .notEmpty().withMessage('Phone number is required')
    .matches(/^[6-9]\d{9}$/).withMessage('Please enter a valid 10-digit Indian mobile number'),
];

const loginValidator = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required'),
];

const changePasswordValidator = [
  body('currentPassword')
    .notEmpty().withMessage('Current password is required'),

  body('newPassword')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
    .matches(/\d/).withMessage('New password must contain at least one number'),
];

const tiffinValidator = [
  body('title')
    .trim()
    .notEmpty().withMessage('Tiffin title is required')
    .isLength({ max: 100 }).withMessage('Title cannot exceed 100 characters'),

  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),

  body('price.daily')
    .notEmpty().withMessage('Daily price is required')
    .isFloat({ min: 1 }).withMessage('Daily price must be a positive number'),

  body('mealType')
    .notEmpty().withMessage('Meal type is required')
    .isIn(['breakfast', 'lunch', 'dinner', 'snacks']).withMessage('Invalid meal type'),

  body('cuisine')
    .trim()
    .notEmpty().withMessage('Cuisine type is required'),
];

const reviewValidator = [
  body('rating')
    .notEmpty().withMessage('Rating is required')
    .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),

  body('comment')
    .trim()
    .notEmpty().withMessage('Review comment is required')
    .isLength({ max: 500 }).withMessage('Comment cannot exceed 500 characters'),

  body('subscriptionId')
    .notEmpty().withMessage('Subscription ID is required')
    .isMongoId().withMessage('Invalid subscription ID'),
];

module.exports = {
  validate,
  registerValidator,
  loginValidator,
  changePasswordValidator,
  tiffinValidator,
  reviewValidator,
};
