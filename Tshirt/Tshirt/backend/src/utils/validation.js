import Joi from 'joi';

// Common validation schemas
const objectId = Joi.string().pattern(/^[0-9a-fA-F]{24}$/, 'valid ObjectId');
const email = Joi.string().email().lowercase().trim();

// Authentication validations
export const authValidation = {
  register: Joi.object({
    name: Joi.string().min(2).max(50).required().messages({
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name cannot be longer than 50 characters',
      'any.required': 'Name is required',
      'string.empty': 'Name is required'
    }),
    email: email.required().messages({
      'string.email': 'Please enter a valid email address',
      'any.required': 'Email is required',
      'string.empty': 'Email is required'
    }),
    password: Joi.string().min(8).required().messages({
      'string.min': 'Password must be at least 8 characters long',
      'any.required': 'Password is required',
      'string.empty': 'Password is required'
    })
  }),

  login: Joi.object({
    email: Joi.string().required().messages({
      'string.empty': 'Email or username is required',
      'any.required': 'Email or username is required'
    }),
    password: Joi.string().required().messages({
      'string.empty': 'Password is required',
      'any.required': 'Password is required'
    })
  })
};

// User validations
export const userValidation = {
  updateProfile: Joi.object({
    name: Joi.string().min(2).max(50).trim().messages({
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name cannot be longer than 50 characters',
      'string.empty': 'Name cannot be empty'
    }),
    email: email.messages({
      'string.email': 'Please enter a valid email address',
      'string.empty': 'Email cannot be empty'
    })
  }).min(1)
};

// Product validations
export const productValidation = {
  create: Joi.object({
    name: Joi.string().min(3).max(100).required().messages({
      'string.min': 'Product name must be at least 3 characters long',
      'string.max': 'Product name cannot be longer than 100 characters',
      'any.required': 'Product name is required',
      'string.empty': 'Product name is required'
    }),
    description: Joi.string().min(10).max(1000).required().messages({
      'string.min': 'Description must be at least 10 characters long',
      'string.max': 'Description cannot be longer than 1000 characters',
      'any.required': 'Description is required',
      'string.empty': 'Description is required'
    }),
    price: Joi.number().min(0).precision(2).required().messages({
      'number.base': 'Price must be a number',
      'number.min': 'Price must be a positive number',
      'any.required': 'Price is required'
    }),
    stock: Joi.number().integer().min(0).required().messages({
      'number.base': 'Stock must be a number',
      'number.integer': 'Stock must be an integer',
      'number.min': 'Stock cannot be negative',
      'any.required': 'Stock is required'
    })
  })
};

// Order validations
export const orderValidation = {
  create: Joi.object({
    orderItems: Joi.array().items(
      Joi.object({
        product: objectId.required().messages({
          'string.pattern.name': 'Invalid product ID format',
          'any.required': 'Product ID is required',
          'string.empty': 'Product ID is required'
        }),
        quantity: Joi.number().integer().min(1).required().messages({
          'number.base': 'Quantity must be a number',
          'number.integer': 'Quantity must be an integer',
          'number.min': 'Quantity must be at least 1',
          'any.required': 'Quantity is required'
        })
      })
    ).min(1).required().messages({
      'array.min': 'At least one order item is required',
      'any.required': 'Order items are required'
    })
  })
};
