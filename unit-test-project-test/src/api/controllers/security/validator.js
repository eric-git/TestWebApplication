"use strict";
const { param, query, body } = require("express-validator");
const { environments } = require(`${appRoot}/modules/configuration.js`);
const { errorMessages } = require(`${appRoot}/api/shared/error-message.js`);
const { validationHandler } = require(
  `${appRoot}/api/middleware/validation-handler.js`,
);

const clientAssertionValidator = [
  param("environment")
    .isIn(environments)
    .withMessage(errorMessages.environmentOutOfRange),
];

const accessTokenValidator = [
  param("environment")
    .isIn(environments)
    .withMessage(errorMessages.environmentOutOfRange),
];

const accessTokenV3Validator = [
  param("environment")
    .isIn(environments)
    .withMessage(errorMessages.environmentOutOfRange),
  query("reuse")
    .optional()
    .isIn(["true", "false"])
    .withMessage(errorMessages.invalidReuseFlag),
];

const decodedTokenValidator = [
  body().isJWT().withMessage(errorMessages.invalidTokenFormat),
];

module.exports = {
  clientAssertionValidator: [...clientAssertionValidator, validationHandler],
  accessTokenValidator: [...accessTokenValidator, validationHandler],
  accessTokenV3Validator: [...accessTokenV3Validator, validationHandler],
  decodedTokenValidator: [...decodedTokenValidator, validationHandler],
};
