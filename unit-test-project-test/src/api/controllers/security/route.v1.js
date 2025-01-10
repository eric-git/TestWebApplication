"use strict";
const { Router } = require("express");
const { getAccessTokenAsync } = require("./controller");
const { accessTokenValidator } = require("./validator");
const { validationHandler } = require("../../middleware/validation-handler");
const { versionHandler } = require("../../middleware/version-handler");
const { toVersionString } = require("../../shared/version-info");

/**
 * @openapi
 * tags:
 *   - name: Security
 *     description: Operations related to security
 */
const securityRouter = (version) => {
  const prefix = `/${toVersionString(version)}/security`;
  const versionMiddleware = versionHandler(version);
  const router = Router();

  /**
   * @openapi
   * /security/token/{environment}:
   *   get:
   *     description: Get the access token for the specified environment
   *     parameters:
   *       - $ref: "#/components/parameters/Environment"
   *     responses:
   *       "200":
   *         $ref: "#/components/responses/AccessToken"
   *       "400":
   *         $ref: "#/components/responses/BadRequest"
   *     tags:
   *       - Security
   */
  router.get(
    `${prefix}/token/:environment`,
    versionMiddleware,
    accessTokenValidator,
    validationHandler,
    getAccessTokenAsync,
  );
  return router;
};

module.exports = {
  securityRouter,
};
