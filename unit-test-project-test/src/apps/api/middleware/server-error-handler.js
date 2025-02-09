"use strict";
/**
 * @openapi
 * components:
 *   schemas:
 *     ServerError:
 *       type: object
 *       properties:
 *         error_message:
 *           type: string
 *           example: error message...
 *         stack_trace:
 *           type: string
 *           example: stack trace of the error...
 *   responses:
 *     ServerError:
 *       description: Server error
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/ServerError"
 *     ServerError-Management:
 *       description: Server error
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/ServerError"
 */
// eslint-disable-next-line no-unused-vars
const serverErrorHandler = (error, _, response, next) =>
  response.status(response.statusCode || 500).json({
    error_message: error.message,
    stack_trace: error.stack,
  });

module.exports = {
  serverErrorHandler,
};
