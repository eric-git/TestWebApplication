"use strict";
const {
  getSunsetVersions,
  getNewVersions,
  getDeprecatedVersions,
  isVersionSunset,
  isVersionDeprecated,
} = require("../shared/version");

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
const versionHandler = (versionInfo) => (_, response, next) => {
  const deprecatedVersions = getDeprecatedVersions();
  const supportedVersions = [...getSunsetVersions(), ...getNewVersions()];
  if (supportedVersions.length) {
    response.set(
      "Api-Supported-Versions",
      supportedVersions
        .map(({ version }) => version)
        .sort()
        .join(", "),
    );
  }
  if (deprecatedVersions.length) {
    response.set(
      "Api-Deprecated-Versions",
      deprecatedVersions
        .map(({ version }) => version)
        .sort()
        .join(", "),
    );
  }
  if (isVersionDeprecated(versionInfo)) {
    return response
      .status(410)
      .set("Deprecation", versionInfo.sunsetDate.toUTCString())
      .json({ error_message: "This operation is deprecated." });
  } else if (isVersionSunset(versionInfo)) {
    response.set("Sunset", versionInfo.sunsetDate.toUTCString());
  }
  next();
};

module.exports = {
  versionHandler,
};
