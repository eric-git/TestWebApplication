"use strict";
const {
  getSignedClientAssertionAsync,
  getClientAccessTokenAsync,
  getDecodedTokenOrClientAssertion,
} = require("../../../modules/security");
const { cache, getAccessTokenCacheKey } = require("../../../modules/caching");
const {
  getConfigurationByEnvironmentName,
} = require("../../../modules/configuration");

const getClientAssertionAsync = async (
  { params: { environment } },
  response,
) => {
  const clientAssertion = await getSignedClientAssertionAsync(environment);
  response.send(clientAssertion);
};

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
