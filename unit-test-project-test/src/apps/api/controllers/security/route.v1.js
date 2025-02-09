"use strict";
const { getAccessTokenAsync } = require("./controller");
const { accessTokenValidator } = require("./validator");

const setupRouter = (router, prefix) => {
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
    accessTokenValidator,
    getAccessTokenAsync,
  );
};

module.exports = {
  setupRouter,
};
