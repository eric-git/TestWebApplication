"use strict";
const { format } = require("util");
const { param } = require("express-validator");
const { specificationSettings } = require("../../shared/specification");
const { versions } = require("../../shared/version");
const errorMessages = require("../../assets/error-messages.json");
const { setupValidations } = require("../../middleware/validation-handler");

const supportedFormats = specificationSettings.supportedFormats.map((x) =>
  x.toLowerCase(),
);
const supportedVersions = versions
  .filter(({ version }) => version)
  .map(({ version }) => version);

const specificationByVersionValidator = [
  param("format")
    .toLowerCase()
    .isIn(supportedFormats)
    .withMessage(
      format(
        errorMessages.invalidSpecificationFormat,
        supportedFormats.join(", "),
      ),
    ),
  param("version")
    .optional({ nullable: true, checkFalsy: true })
    .isInt()
    .withMessage(
      format(errorMessages.invalidVersion, supportedVersions.join(", ")),
    )
    .toInt()
    .isIn(supportedVersions)
    .withMessage(
      format(errorMessages.invalidVersion, supportedVersions.join(", ")),
    ),
];

module.exports = setupValidations({
  specificationByVersionValidator,
});
