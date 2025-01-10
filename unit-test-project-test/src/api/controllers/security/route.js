"use strict";
const { versionInfo, toVersionString } = require("../../shared/version-info");

const securityRouters = versionInfo
  .filter((x) => x.version)
  .map(({ version }) => {
    const { securityRouter } = require(`./route.${toVersionString(version)}`);
    return securityRouter(version);
  });

module.exports = {
  securityRouters,
};
