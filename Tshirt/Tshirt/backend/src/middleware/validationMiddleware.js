import { validationResult } from 'express-validator';
import Joi from 'joi';
import { orderValidation, authValidation, userValidation, productValidation } from '../utils/validation.js';

/**
 * Middleware factory that creates a validation middleware using Joi schemas
 * @param {Joi.Schema} schema - Joi validation schema
 * @param {string} property - Request property to validate (body, params, query)
 * @returns {Function} Express middleware function
 */
export const validateRequest = (schema, property = 'body') => {
  return async (req, res, next) => {
    try {
      console.log('Validation - Request body:', JSON.stringify(req.body, null, 2));
      const { error, value } = schema.validate(req[property], { 
        abortEarly: false,
        stripUnknown: true,
        allowUnknown: true
      });
      
      if (error) {
        console.log('Validation errors:', JSON.stringify(error.details, null, 2));
      }

      if (error) {
        console.log('Validation errors:', error.details);
        const errors = error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message.replace(/\"/g, ''),
          type: detail.type,
          context: detail.context
        }));
        
        return res.status(400).json({ 
          success: false, 
          message: 'Validation failed',
          error: 'ValidationError',
          details: errors,
          receivedData: req.body
        });
      }

      // Replace the request data with the validated and sanitized data
      req[property] = value;
      next();
    } catch (err) {
      console.error('Validation error:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Internal server error during validation' 
      });
    }
  };
};

// Authentication validations
export const validateAuth = {
  register: validateRequest(authValidation.register),
  login: validateRequest(authValidation.login),
  sendOtp: validateRequest(authValidation.sendOtp),
  verifyOtp: validateRequest(authValidation.verifyOtp),
  forgotPassword: validateRequest(authValidation.forgotPassword),
  resetPassword: validateRequest(authValidation.resetPassword)
};

// Order validations
export const validateOrder = {
  create: validateRequest(orderValidation.createOrder),
  updateStatus: validateRequest(orderValidation.updateStatus, 'params'),
};

// User validations
export const validateUser = {
  updateProfile: validateRequest(userValidation.updateProfile),
};

// Product validations
export const validateProduct = {
  create: validateRequest(productValidation.createProduct),
  update: validateRequest(productValidation.updateProduct),
  review: validateRequest({
    rating: Joi.number().min(1).max(5).required(),
    comment: Joi.string().required(),
  }),
  updateStock: validateRequest({
    countInStock: Joi.number().integer().min(0).required(),
  }),
  toggleActive: validateRequest({
    isActive: Joi.boolean().required(),
  })
};

// Backward compatibility
export const validate = validateRequest;

/**
 * Error formatter for express-validator
 * @param {object} error - The error object from express-validator
 * @returns {object} Formatted error object
 */
export const formatValidationError = (error) => ({
  field: error.param,
  message: error.msg,
});

/**
 * Middleware to handle validation errors from express-validator
 */
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(formatValidationError)
    });
  }
  next();
};
