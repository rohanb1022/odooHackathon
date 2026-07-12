/**
 * Standard API response helpers
 */

const sendSuccess = (res, data = {}, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    ...data,
  });
};

const sendError = (res, message = 'Server Error', statusCode = 500, errors = null) => {
  const response = { success: false, message };
  if (errors) response.errors = errors;
  return res.status(statusCode).json(response);
};

const sendCreated = (res, data = {}, message = 'Created successfully') => {
  return sendSuccess(res, data, message, 201);
};

const sendNotFound = (res, message = 'Resource not found') => {
  return sendError(res, message, 404);
};

const sendUnauthorized = (res, message = 'Unauthorized') => {
  return sendError(res, message, 401);
};

const sendForbidden = (res, message = 'Forbidden') => {
  return sendError(res, message, 403);
};

const sendBadRequest = (res, message = 'Bad request', errors = null) => {
  return sendError(res, message, 400, errors);
};

const sendNotImplemented = (res) => {
  return sendError(res, 'This feature is not yet implemented', 501);
};

module.exports = {
  sendSuccess,
  sendError,
  sendCreated,
  sendNotFound,
  sendUnauthorized,
  sendForbidden,
  sendBadRequest,
  sendNotImplemented,
};
