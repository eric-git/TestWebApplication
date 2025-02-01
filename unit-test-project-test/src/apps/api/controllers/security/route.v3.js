"use strict";
const {
  getAccessTokenV3Async,
  getClientAssertionAsync,
  getDecodedToken,
} = require("./controller");
const {
  accessTokenValidator,
  clientAssertionValidator,
  decodedTokenValidator,
} = require("./validator");

const setupRouter = (router, prefix) => {
  /**
   * @openapi
   * /security/token/{environment}:
   *   get:
   *     description: Get the access token for the specified environment
   *     parameters:
   *       - $ref: "#/components/parameters/Environment"
   *       - name: reuse
   *         description: A boolean value indicating whether reusing the access token until expiry, true if omitted
   *         in: query
   *         required: false
   *         schema:
   *           type: boolean
   *           example: false
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
    getAccessTokenV3Async,
  );

  /**
   * @openapi
   * /security/assertion/{environment}:
   *   get:
   *     description: Get the client assertion for the specified environment
   *     parameters:
   *       - $ref: "#/components/parameters/Environment"
   *     responses:
   *       "200":
   *         $ref: "#/components/responses/ClientAssertion"
   *       "400":
   *         $ref: "#/components/responses/BadRequest"
   *     tags:
   *       - Security
   */
  router.get(
    `${prefix}/assertion/:environment`,
    clientAssertionValidator,
    getClientAssertionAsync,
  );

  /**
   * @openapi
   * /security/decode:
   *   post:
   *     description: Get the decoded access token or client assertion for the encoded data
   *     requestBody:
   *       required: true
   *       content:
   *         text/plain:
   *           schema:
   *             type: string
   *             example: the base64url encoded access token or client assertion...
   *     responses:
   *       "200":
   *         $ref: "#/components/responses/DecodedToken"
   *       "400":
   *         $ref: "#/components/responses/BadRequest"
   *     tags:
   *       - Security
   */
  router.post(`${prefix}/decode`, decodedTokenValidator, getDecodedToken);
  return router;
};

module.exports = {
  setupRouter,
};
