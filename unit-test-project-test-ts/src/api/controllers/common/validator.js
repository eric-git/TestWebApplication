"use strict";
const { validationHandler } = require(
  `${appRoot}/api/middleware/validation-handler.js`,
);

const healthCheckValidator = [];

module.exports = {
  healthCheckValidator: [...healthCheckValidator, validationHandler],
};
