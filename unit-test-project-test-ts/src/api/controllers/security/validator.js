"use strict";
const { param, body } = require("express-validator");
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

const decodedTokenValidator = [
  body().isJWT().withMessage(errorMessages.invalidTokenFormat),
];

module.exports = {
  clientAssertionValidator: [...clientAssertionValidator, validationHandler],
  accessTokenValidator: [...accessTokenValidator, validationHandler],
  decodedTokenValidator: [...decodedTokenValidator, validationHandler],
};
