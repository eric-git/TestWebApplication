"use strict";
const { format } = require("util");
const { param, body } = require("express-validator");
const { environments } = require("../../shared/environment");
const errorMessages = require("../../assets/error-messages.json");
const { setupValidations } = require("../../middleware/validation-handler");

const environmentNames = environments.map(({ name }) => name.toLowerCase());

const certificateByEnvironmentValidator = [
  param("environment")
    .toLowerCase()
    .isIn(environmentNames)
    .withMessage(
      format(errorMessages.environmentOutOfRange, environmentNames.join(", ")),
    ),
];

const privateKeyByEnvironmentValidator = [
  param("environment")
    .toLowerCase()
    .isIn(environmentNames)
    .withMessage(
      format(errorMessages.environmentOutOfRange, environmentNames.join(", ")),
    ),
];

const certificateValidator = [
  body().isBase64().withMessage(errorMessages.invalidBase64Format),
];

const privateKeyValidator = [
  body("password").notEmpty().withMessage(errorMessages.invalidBase64Format),
  body("data").isBase64().withMessage(errorMessages.invalidBase64Format),
];

module.exports = setupValidations({
  certificateByEnvironmentValidator,
  privateKeyByEnvironmentValidator,
  certificateValidator,
  privateKeyValidator,
});
