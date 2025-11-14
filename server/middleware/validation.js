const { body, validationResult } = require('express-validator');

// Validation middleware
const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    res.status(400).json({ 
      error: 'Validation failed',
      details: errors.array()
    });
  };
};

// Common validation rules
const validationRules = {
  // User registration
  register: [
    body('email')
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage('Must be a valid email address'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    body('name')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Name must be between 2 and 50 characters')
      .escape()
  ],

  // User login
  login: [
    body('email')
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage('Must be a valid email address'),
    body('password')
      .notEmpty()
      .withMessage('Password is required')
  ],

  // Tattoo generation
  generate: [
    body('prompt')
      .trim()
      .isLength({ min: 3, max: 500 })
      .withMessage('Prompt must be between 3 and 500 characters')
      .escape()
  ],

  // SEO audit
  seoAudit: [
    body('url')
      .optional()
      .trim()
      .isURL()
      .withMessage('Must be a valid URL'),
    body('content.title')
      .optional()
      .trim()
      .isLength({ max: 200 })
      .withMessage('Title must not exceed 200 characters'),
    body('content.description')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Description must not exceed 500 characters')
  ],

  // Troubleshooting fix
  troubleshootFix: [
    body('issue')
      .trim()
      .isIn(['missing-env', 'clear-cache', 'reset-rate-limit', 'check-dependencies'])
      .withMessage('Invalid issue type')
  ],

  // Troubleshooting suggestions
  troubleshootSuggest: [
    body('error')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Error message too long'),
    body('context')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Context too long')
  ]
};

module.exports = { validate, validationRules };
