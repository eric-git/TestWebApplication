"use strict";
const { versionInfo } = require("../shared/version-info");

const versionHandler = (version) => {
  return (_, response, next) => {
    if (!Array.isArray(versionInfo)) {
      return next();
    }
    const now = new Date();
    const sunsetVersions = versionInfo
      .filter((x) => x.sunsetDate instanceof Date && x.sunsetDate >= now)
      .map((x) => x.version);
    const newVersions = versionInfo
      .filter((x) => !(x.sunsetDate instanceof Date))
      .map((x) => x.version);
    const deprecatedVersions = versionInfo
      .filter((x) => x.sunsetDate instanceof Date && x.sunsetDate < now)
      .map((x) => x.version)
      .sort();
    const supportedVersions = [...sunsetVersions, ...newVersions].sort();
    if (supportedVersions.length > 0) {
      response.set("Api-Supported-Versions", supportedVersions.join(", "));
    }
    if (deprecatedVersions.length > 0) {
      response.set("Api-Deprecated-Versions", deprecatedVersions.join(", "));
    }
    if (deprecatedVersions.includes(version)) {
      const sunsetDate = versionInfo.find(
        (x) => x.version === version,
      ).sunsetDate;
      return response
        .status(410)
        .set("Deprecation", sunsetDate.toUTCString())
        .json({ error_message: "This operation is deprecated." });
    } else if (sunsetVersions.includes(version)) {
      const sunsetDate = versionInfo.find(
        (x) => x.version === version,
      ).sunsetDate;
      response.set("Sunset", sunsetDate.toUTCString());
    }
    next();
  };
};

module.exports = {
  versionHandler,
};
