"use strict";
const {
  versionInfo,
  getSunsetVersions,
  getNewVersions,
  getDeprecatedVersions,
} = require("../shared/version-info");

/**
 * @openapi
 * components:
 *   schemas:
 *     Gone:
 *       type: object
 *       properties:
 *         error_message:
 *           type: string
 *           example: This operation is deprecated.
 *   responses:
 *     Gone:
 *       description: This operation is deprecated.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/Gone"
 *   headers:
 *     Sunset:
 *       description: The sunset time of the version
 *       schema:
 *         type: string
 *         format: date-time
 *         example: 2025-06-01T00:0.0:00Z
 *     Deprecation:
 *       description: The deprecated time of the version
 *       schema:
 *         type: string
 *         format: date-time
 *         example: 2024-06-01T00:0.0:00Z
 *     Api-Supported-Versions:
 *       description: The supported versions
 *       schema:
 *         type: string
 *         example: 2, 3
 *     Api-Deprecated-Versions:
 *       description: The deprecated versions
 *       schema:
 *         type: string
 *         example: 1
 */
const versionHandler = (version) => {
  return (_, response, next) => {
    if (!version) {
      return next();
    }
    const sunsetVersions = getSunsetVersions();
    const newVersions = getNewVersions();
    const deprecatedVersions = getDeprecatedVersions();
    const supportedVersions = [...sunsetVersions, ...newVersions].sort();
    if (supportedVersions.length > 0) {
      response.set("Api-Supported-Versions", supportedVersions.join(", "));
    }
    if (deprecatedVersions.length > 0) {
      response.set("Api-Deprecated-Versions", deprecatedVersions.join(", "));
    }
    if (deprecatedVersions.includes(version)) {
      const { sunsetDate } = versionInfo.find((x) => x.version === version);
      return response
        .status(410)
        .set("Deprecation", sunsetDate.toUTCString())
        .json({ error_message: "This operation is deprecated." });
    } else if (sunsetVersions.includes(version)) {
      const { sunsetDate } = versionInfo.find((x) => x.version === version);
      response.set("Sunset", sunsetDate.toUTCString());
    }
    next();
  };
};

module.exports = {
  versionHandler,
};
