"use strict";
const { format } = require("util");
const { param, query, body } = require("express-validator");
const { environments } = require("../../shared/environment");
const errorMessages = require("../../assets/error-messages.json");
const { setupValidations } = require("../../middleware/validation-handler");

const environmentNames = environments.map(({ name }) => name.toLowerCase());

const clientAssertionValidator = [
  param("environment")
    .toLowerCase()
    .isIn(environmentNames)
    .withMessage(
      format(errorMessages.environmentOutOfRange, environmentNames.join(", ")),
    ),
];

const accessTokenValidator = [
  param("environment")
    .toLowerCase()
    .isIn(environmentNames)
    .withMessage(
      format(errorMessages.environmentOutOfRange, environmentNames.join(", ")),
    ),
];

const accessTokenV3Validator = [
  param("environment")
    .toLowerCase()
    .isIn(environmentNames)
    .withMessage(
      format(errorMessages.environmentOutOfRange, environmentNames.join(", ")),
    ),
  query("reuse")
    .optional()
    .toLowerCase()
    .isIn(["true", "false"])
    .withMessage(errorMessages.invalidReuseFlag),
];

const decodedTokenValidator = [
  body().isJWT().withMessage(errorMessages.invalidTokenFormat),
];

module.exports = setupValidations({
  clientAssertionValidator,
  accessTokenValidator,
  accessTokenV3Validator,
  decodedTokenValidator,
});
