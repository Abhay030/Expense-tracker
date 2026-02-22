const Joi = require('joi');

/**
 * Validation schemas for API request payloads.
 * Used by the validate() middleware to reject bad input
 * before it reaches the controller.
 */

const schemas = {
    // Auth
    register: Joi.object({
        fullname: Joi.string().trim().min(2).max(50).required()
            .messages({ 'string.min': 'Name must be at least 2 characters' }),
        email: Joi.string().email().trim().lowercase().required()
            .messages({ 'string.email': 'Please provide a valid email address' }),
        password: Joi.string().min(8).max(128).required()
            .messages({ 'string.min': 'Password must be at least 8 characters' }),
        profileImageUrl: Joi.string().uri().allow(null, '').optional(),
    }),

    login: Joi.object({
        email: Joi.string().email().trim().lowercase().required(),
        password: Joi.string().required(),
    }),

    // Income
    addIncome: Joi.object({
        icon: Joi.string().allow(null, '').optional(),
        source: Joi.string().trim().min(1).max(100).required()
            .messages({ 'string.empty': 'Income source is required' }),
        amount: Joi.number().positive().max(999999999).required()
            .messages({ 'number.positive': 'Amount must be positive' }),
        date: Joi.date().iso().required()
            .messages({ 'date.format': 'Please provide a valid date' }),
    }),

    // Expense
    addExpense: Joi.object({
        icon: Joi.string().allow(null, '').optional(),
        category: Joi.string().trim().min(1).max(100).required()
            .messages({ 'string.empty': 'Category is required' }),
        amount: Joi.number().positive().max(999999999).required()
            .messages({ 'number.positive': 'Amount must be positive' }),
        description: Joi.string().trim().max(500).allow(null, '').optional(),
        date: Joi.date().iso().required()
            .messages({ 'date.format': 'Please provide a valid date' }),
    }),

    // AI suggestion
    suggestCategory: Joi.object({
        description: Joi.string().trim().min(1).max(500).required()
            .messages({ 'string.empty': 'Description is required for AI categorization' }),
        amount: Joi.number().positive().allow(null).optional(),
    }),

    // Currency
    updateCurrency: Joi.object({
        currency: Joi.string().length(3).uppercase().required()
            .messages({ 'string.length': 'Currency must be a 3-letter code' }),
    }),
};

/**
 * Validate middleware factory.
 * Usage: router.post('/add', protect, validate('addIncome'), addIncome)
 */
const validate = (schemaName) => {
    return (req, res, next) => {
        const schema = schemas[schemaName];
        if (!schema) {
            return next(new Error(`Validation schema '${schemaName}' not found`));
        }

        const { error, value } = schema.validate(req.body, {
            abortEarly: false,       // Return all errors, not just the first
            stripUnknown: true,      // Remove fields not in the schema
        });

        if (error) {
            const messages = error.details.map(d => d.message);
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: messages,
            });
        }

        // Replace body with validated + sanitized data
        req.body = value;
        next();
    };
};

module.exports = { validate, schemas };
