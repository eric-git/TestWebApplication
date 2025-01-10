"use strict";
const { environments } = require("../../modules/configuration");

const errorMessages = {
  environmentOutOfRange: `The environment name for the client assertion must be one of ${environments.map((x) => `'${x}'`).join(", ")}.`,
  invalidTokenFormat:
    "The content of token or client assertion must contain a header, a payload and a signature delimited by dots.",
  invalidReuseFlag:
    "The optional reuse flag must be a boolean value, e.g. true or false, if provided. The default value is true.",
};

module.exports = {
  errorMessages: Object.freeze(errorMessages),
};
