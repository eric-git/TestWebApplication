"use strict";
const { param, query, body } = require("express-validator");
const { environments } = require("../../../modules/configuration");
const { errorMessages } = require("../../../api/shared/error-message");

const clientAssertionValidator = param("environment")
  .isIn(environments)
  .withMessage(errorMessages.environmentOutOfRange);

const accessTokenValidator = param("environment")
  .isIn(environments)
  .withMessage(errorMessages.environmentOutOfRange);

const accessTokenV3Validator = [
  param("environment")
    .isIn(environments)
    .withMessage(errorMessages.environmentOutOfRange),
  query("reuse")
    .optional()
    .isIn(["true", "false"])
    .withMessage(errorMessages.invalidReuseFlag),
];

const decodedTokenValidator = body()
  .isJWT()
  .withMessage(errorMessages.invalidTokenFormat);

module.exports = {
  clientAssertionValidator,
  accessTokenValidator,
  accessTokenV3Validator,
  decodedTokenValidator,
};
