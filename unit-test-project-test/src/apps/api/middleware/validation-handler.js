"use strict";
const { validationResult } = require("express-validator");

/**
 * @openapi
 * components:
 *   schemas:
 *     ValidationError:
 *       type: object
 *       properties:
 *         type:
 *           type: string
 *           example: field
 *         value:
 *           type: string
 *           example: an invalid value...
 *         msg:
 *           type: string
 *           example: The value is invalid...
 *         path:
 *           type: string
 *           example: parameter name...
 *         location:
 *           type: string
 *           example: params
 *     ValidationErrorList:
 *       type: array
 *       items:
 *         $ref: "#/components/schemas/ValidationError"
 *   responses:
 *     BadRequest:
 *       description: Bad request
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/ValidationErrorList"
 *     BadRequest-Management:
 *       description: Bad request
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/ValidationErrorList"
 */
const validationHandler = (request, response, next) => {
  const errors = validationResult(request);
  if (!errors.isEmpty()) {
    return response.status(400).json(errors);
  }
  next();
};

const setupValidations = (validators) => {
  Object.keys(validators).forEach((x) => {
    validators[x] = [...validators[x], validationHandler];
  });
  return validators;
};

module.exports = {
  validationHandler,
  setupValidations,
};
