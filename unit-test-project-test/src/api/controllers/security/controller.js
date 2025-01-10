"use strict";
/**
 * @openapi
 * components:
 *   parameters:
 *     Environment:
 *       name: environment
 *       description: The target environment
 *       in: path
 *       required: true
 *       schema:
 *         type: string
 *         example: test
 */
const {
  getSignedClientAssertionAsync,
  getClientAccessTokenAsync,
  getDecodedTokenOrClientAssertion,
} = require("../../../modules/security");
const { cache, getAccessTokenCacheKey } = require("../../../modules/caching");
const {
  getConfigurationByEnvironmentName,
} = require("../../../modules/configuration");

/**
 * @openapi
 * components:
 *   schemas:
 *     ClientAssertion:
 *       type: object
 *       properties:
 *         client_assertion:
 *           type: string
 *           example: the base64url encoded client assertion...
 *         original_data:
 *           $ref: '#/components/schemas/DecodedToken'
 *   responses:
 *     ClientAssertion:
 *       description: The client assertion for the specified environment
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/ClientAssertion"
 */
const getClientAssertionAsync = async (
  { params: { environment } },
  response,
) => {
  const clientAssertion = await getSignedClientAssertionAsync(environment);
  response.send(clientAssertion);
};

/**
 * @openapi
 * components:
 *   schemas:
 *     AccessToken:
 *       type: object
 *       properties:
 *         token_type:
 *           type: string
 *           example: Bearer
 *         expires_in:
 *           type: integer
 *           example: 3599
 *         ext_expires_in:
 *           type: integer
 *           example: 3599
 *         access_token:
 *           type: string
 *           example: the base64url encoded access token...
 *   responses:
 *     AccessToken:
 *       description: The access token for the specified environment
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/AccessToken"
 */
const getAccessTokenAsync = async ({ params: { environment } }, response) => {
  const { status, data } = await getClientAccessTokenAsync(environment);
  response.status(status).json(data);
};

const getAccessTokenV3Async = async (
  { params: { environment }, query: { reuse } },
  response,
) => {
  if ((reuse || "true") === "false") {
    return getAccessTokenAsync({ params: { environment } }, response);
  }
  const { machineAbn } = getConfigurationByEnvironmentName(environment);
  const cacheKey = getAccessTokenCacheKey(environment, machineAbn);
  let accessTokenResponse = await cache.get(cacheKey);
  if (!accessTokenResponse) {
    accessTokenResponse = await getClientAccessTokenAsync(environment);
    const tokenData = accessTokenResponse.data;
    if (tokenData && tokenData.access_token) {
      await cache.set(
        cacheKey,
        Object.freeze(accessTokenResponse),
        (tokenData.expires_in - 59) * 1000,
      );
    }
  }
  response.status(accessTokenResponse.status).json(accessTokenResponse.data);
};

/**
 * @openapi
 * components:
 *   schemas:
 *     GenericObject:
 *       type: object
 *       additionalProperties: true
 *       example:
 *         key1: value one
 *         key2: value two
 *         key3: value three
 *         key4: value four
 *     DecodedToken:
 *       type: object
 *       properties:
 *         header:
 *           $ref: '#/components/schemas/GenericObject'
 *         payload:
 *           $ref: '#/components/schemas/GenericObject'
 *         signature:
 *           type: string
 *           example: the base64 encoded signature...
 *   responses:
 *     DecodedToken:
 *       description: The decoded token
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/DecodedToken"
 */
const getDecodedToken = ({ body }, response) => {
  const decodedData = getDecodedTokenOrClientAssertion(body);
  response.send(decodedData);
};

module.exports = {
  getClientAssertionAsync,
  getAccessTokenAsync,
  getAccessTokenV3Async,
  getDecodedToken,
};
