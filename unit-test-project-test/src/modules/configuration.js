"use strict";
const vsCodeSettings = require(`${appRoot}/../.vscode/settings.json`);

const shared = "$shared";
const settings = vsCodeSettings["rest-client.environmentVariables"];
const environments = Object.keys(settings).filter((x) => x !== shared);
const sharedSettings = settings[shared];

const getConfigurationByEnvironmentName = (environmentName) => {
  const envName = (environmentName || "").toLowerCase();
  const result = environments.filter((x) => x.toLowerCase() === envName);
  return result.length !== 1 ? null : settings[result[0]];
};

module.exports = {
  getConfigurationByEnvironmentName,
  sharedSettings,
  environments,
};
