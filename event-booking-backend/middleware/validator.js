const { body, validationResult } = require('express-validator');

// Validation rules for user registration
const registerValidator = [
    body('username').notEmpty().withMessage('Username is required'),
    body('email').isEmail().withMessage('Email is not valid'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
];

// Validation rules for event creation
const eventValidator = [
    body('title').notEmpty().withMessage('Title is required'),
    body('date').isISO8601().withMessage('Date must be a valid ISO 8601 date'),
    body('location').notEmpty().withMessage('Location is required'),
];

// Middleware to handle validation results
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

module.exports = {
    registerValidator,
    eventValidator,
    validate,
};