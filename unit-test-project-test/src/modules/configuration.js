"use strict";
const settings = require("../http-tests/http-client.env.json");

const shared = "$shared";
const environments = Object.keys(settings).filter((x) => x !== shared);
const sharedSettings = settings[shared];

const getConfigurationByEnvironmentName = (environmentName) => {
  const envName = (environmentName || "").toLowerCase();
  const result = environments.filter((x) => x.toLowerCase() === envName);
  return result.length !== 1 ? null : Object.freeze(settings[result[0]]);
};

module.exports = {
  getConfigurationByEnvironmentName,
  sharedSettings: Object.freeze(sharedSettings),
  environments: Object.freeze(environments),
};
