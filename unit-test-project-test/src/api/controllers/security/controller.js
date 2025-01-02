"use strict";
const {
  getSignedClientAssertionAsync,
  getClientAccessTokenAsync,
  getDecodedTokenOrClientAssertion,
} = require(`${appRoot}/modules/security.js`);
const { cache, getAccessTokenCacheKey } = require(
  `${appRoot}/modules/caching.js`,
);
const { getConfigurationByEnvironmentName } = require(
  `${appRoot}/modules/configuration.js`,
);

const getClientAssertionAsync = async (
  { params: { environment } },
  response,
) => {
  const clientAssertion = await getSignedClientAssertionAsync(environment);
  response.send(clientAssertion);
};

const getAccessTokenAsync = async ({ params: { environment } }, response) => {
  const accessTokenResponse = await getClientAccessTokenAsync(environment);
  response.status(accessTokenResponse.status).json(accessTokenResponse.data);
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
        accessTokenResponse,
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
