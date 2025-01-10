"use strict";
/**
 * @openapi
 * components:
 *   schemas:
 *     NotFound:
 *       type: object
 *       properties:
 *         error_message:
 *           type: string
 *           example: Not found.
 *   responses:
 *     NotFound:
 *       description: Resource not found
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/NotFound"
 *     NotFound-Management:
 *       description: Resource not found
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/NotFound"
 */
// eslint-disable-next-line no-unused-vars
const notFoundHandler = (_, response, next) => {
  response.status(404).json({ error_message: "Not found." });
};

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
const serverErrorHandler = (error, _, response, next) => {
  response.status(response.statusCode || 500).json({
    error_message: error.message,
    stack_trace: error.stack,
  });
};

module.exports = {
  notFoundHandler,
  serverErrorHandler,
};
