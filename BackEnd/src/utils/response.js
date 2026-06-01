/**
 * Standard HTTP success response formatter
 * @param {object} res Express response object
 * @param {number} statusCode HTTP status code
 * @param {any} data Response payload
 * @param {string} message Optional custom message
 */
export const successResponse = (res, statusCode, data = {}, message = "") => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};
