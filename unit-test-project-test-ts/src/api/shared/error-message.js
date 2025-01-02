"use strict";
const { environments } = require(`${appRoot}/modules/configuration.js`);

const errorMessages = {
  environmentOutOfRange: `The environment name for the client assertion should be one of ${environments.map((x) => `'${x}'`).join(", ")}.`,
  invalidTokenFormat:
    "The content of token or client assertion must consists of a header, a payload and a signature delimited by dots.",
};

module.exports = { errorMessages };
