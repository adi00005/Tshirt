// src/utils/responseHandler.js

/**
 * Success Response Handler
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {any} data - Response data
 * @param {string} message - Success message
 */
const successResponse = (res, statusCode = 200, data = null, message = 'Success') => {
  const response = {
    success: true,
    message,
  };

  if (data !== null) {
    // Handle pagination data if present
    if (data.docs) {
      response.pagination = {
        total: data.totalDocs || 0,
        limit: data.limit || 0,
        page: data.page || 1,
        pages: data.totalPages || 1,
        hasNextPage: data.hasNextPage || false,
        hasPrevPage: data.hasPrevPage || false,
      };
      response.data = data.docs;
    } else {
      response.data = data;
    }
  }

  return res.status(statusCode).json(response);
};

/**
 * Error Response Handler
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 * @param {Array} errors - Array of validation errors (optional)
 */
const errorResponse = (res, statusCode = 500, message = 'Internal Server Error', errors = []) => {
  const response = {
    success: false,
    message,
  };

  if (errors.length > 0) {
    response.errors = errors;
  }

  // Log server errors (500)
  if (statusCode === 500) {
    console.error(message);
  }

  return res.status(statusCode).json(response);
};

/**
 * Validation Error Response
 * @param {Object} res - Express response object
 * @param {Array} errors - Array of validation errors
 * @param {string} message - Error message
 */
const validationError = (res, errors, message = 'Validation Failed') => {
  return errorResponse(
    res,
    400,
    message,
    Array.isArray(errors) ? errors : [errors]
  );
};

/**
 * Not Found Response
 * @param {Object} res - Express response object
 * @param {string} resource - Name of the resource not found
 */
const notFound = (res, resource = 'Resource') => {
  return errorResponse(res, 404, `${resource} not found`);
};

/**
 * Unauthorized Response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 */
const unauthorized = (res, message = 'Unauthorized') => {
  return errorResponse(res, 401, message);
};

/**
 * Forbidden Response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 */
const forbidden = (res, message = 'Forbidden') => {
  return errorResponse(res, 403, message);
};

/**
 * Bad Request Response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 */
const badRequest = (res, message = 'Bad Request') => {
  return errorResponse(res, 400, message);
};

export {
  successResponse,
  errorResponse,
  validationError,
  notFound,
  unauthorized,
  forbidden,
  badRequest,
};
