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
const notFoundHandler = (_, response, next) =>
  response.status(404).json({ error_message: "Not found." });

module.exports = {
  notFoundHandler,
};
