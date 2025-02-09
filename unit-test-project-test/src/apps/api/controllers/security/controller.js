"use strict";
/**
 * @openapi
 * tags:
 *   - name: Security
 *     description: Operations related to security
 */
const axios = require("axios");
const { createPrivateKey, createSign, randomUUID } = require("crypto");
const { getEnvironmentByName } = require("../../shared/environment");
const { cache, getAccessTokenCacheKey } = require("../../shared/caching");

const jsonToBase64url = (data) => {
  const stringData = JSON.stringify(data);
  const base64UrlData = Buffer.from(stringData, "utf8").toString("base64url");
  return base64UrlData;
};

const base64urlToJson = (data) => {
  const stringData = Buffer.from(data, "base64url").toString("utf8");
  const jsonData = JSON.parse(stringData);
  return jsonData;
};

const base64urlToBase64 = (data) =>
  Buffer.from(data, "base64url").toString("base64");

const getDecodedTokenOrClientAssertion = (encodedData) => {
  const [header, payload, signature] = encodedData.split(".");
  return {
    header: base64urlToJson(header),
    payload: base64urlToJson(payload),
    signature: base64urlToBase64(signature),
  };
};

const getSignedClientAssertionAsync = async ({
  machineClientId,
  ciamTenant,
  machinePassword,
  keystoreData,
}) => {
  const { sha1fingerprint, protectedPrivateKey } = keystoreData;
  const currentTime = Math.floor(Date.now() / 1000);
  const header = {
    kid: randomUUID(),
    alg: "RS256",
    x5t: sha1fingerprint,
  };
  const payload = {
    iss: machineClientId,
    sub: machineClientId,
    aud: `https://login.microsoftonline.com/${ciamTenant}/oauth2/v2.0/token`,
    iat: currentTime,
    exp: currentTime + 3600,
  };
  const assertionToSign = `${jsonToBase64url(header)}.${jsonToBase64url(payload)}`;
  const sign = createSign("RSA-SHA256");
  sign.update(assertionToSign);
  sign.end();
  const privateKey = createPrivateKey({
    key: `-----BEGIN ENCRYPTED PRIVATE KEY-----\n${protectedPrivateKey}\n-----END ENCRYPTED PRIVATE KEY-----`,
    type: "pkcs8",
    passphrase: machinePassword,
  });
  const signature = sign.sign(privateKey, "base64url");
  return {
    client_assertion: `${assertionToSign}.${signature}`,
    original_data: {
      header: header,
      payload: payload,
      signature: base64urlToBase64(signature),
    },
  };
};

const getClientAccessTokenAsync = async (environment) => {
  const { client_assertion } = await getSignedClientAssertionAsync(environment);
  const formData = new FormData();
  formData.append(
    "client_assertion_type",
    "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
  );
  formData.append("grant_type", "client_credentials");
  const { machineClientId, usiApplicationId, ciamTenant } = environment;
  formData.append("client_id", machineClientId);
  formData.append("scope", `${usiApplicationId}/.default`);
  formData.append("client_assertion", client_assertion);
  const response = {};
  await axios
    .post(
      `https://login.microsoftonline.com/${ciamTenant}/oauth2/v2.0/token`,
      formData,
    )
    .then((httpResponse) => {
      response.status = httpResponse.status;
      response.data = httpResponse.data;
    })
    .catch((error) => {
      response.status = error.response.status;
      response.data = error.response.data;
    });
  return response;
};

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
  const objEnvironment = getEnvironmentByName(environment);
  const clientAssertion = await getSignedClientAssertionAsync(objEnvironment);
  response.json(clientAssertion);
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
  const objEnvironment = getEnvironmentByName(environment);
  const { status, data } = await getClientAccessTokenAsync(objEnvironment);
  response.status(status).json(data);
};

const getAccessTokenV3Async = async (
  { params: { environment }, query: { reuse } },
  response,
) => {
  if ((reuse || "true") === "false") {
    return await getAccessTokenAsync({ params: { environment } }, response);
  }
  const objEnvironment = getEnvironmentByName(environment);
  const cacheKey = getAccessTokenCacheKey(objEnvironment);
  let accessTokenResponse = await cache.get(cacheKey);
  if (!accessTokenResponse) {
    accessTokenResponse = await getClientAccessTokenAsync(objEnvironment);
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
  response.json(decodedData);
};

module.exports = {
  getClientAssertionAsync,
  getAccessTokenAsync,
  getAccessTokenV3Async,
  getDecodedToken,
};
