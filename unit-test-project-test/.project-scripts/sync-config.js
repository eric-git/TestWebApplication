"use strict";
/**
 * Description: Sync app settings data to test projects
 * Usage: node ./sync-config.js --quiet
 */
const { resolve } = require("path");
const { writeFileSync } = require("fs");
const { parseArgs, clone, formatData } = require("./util");
const { environments } = require(resolve("./src/apps/api/settings.json"));
const { host } = require(resolve("./src/settings.json"));

const writeData = (targetFileName, data, targetFieldName = null) => {
  const filePath = resolve(targetFileName);
  if (!quiet) {
    console.info(`Syncing config to "${targetFileName}"...`);
  }
  if (targetFieldName) {
    const fileData = require(filePath);
    fileData[targetFieldName] = data;
    writeFileSync(filePath, formatData(fileData));
  } else {
    writeFileSync(filePath, formatData(data));
  }
};

const { quiet } = parseArgs();
const helperApiBaseUrl = `${host}/api/v3`;
const settingsData = {};
environments.forEach(
  ({
    name,
    machineClientId,
    usiApiBaseUrl,
    usiApplicationId,
    apimSubscriptionKey,
    ciamTenant,
  }) => {
    settingsData[name] = {
      environmentName: name,
      machineClientId,
      usiApiBaseUrl,
      usiApplicationId,
      apimSubscriptionKey,
      ciamTenant,
    };
  },
);
const restClientSettings = {
  $shared: { helperApiBaseUrl },
  ...clone(settingsData),
};
writeData(
  "./.vscode/settings.json",
  restClientSettings,
  "rest-client.environmentVariables",
);
const httpTestSettings = clone(settingsData);
for (let [, environment] of Object.entries(httpTestSettings)) {
  environment["helperApiBaseUrl"] = helperApiBaseUrl;
}
writeData("./.project-tests/http-client.env.json", httpTestSettings);
if (!quiet) {
  console.info("Done.");
}
