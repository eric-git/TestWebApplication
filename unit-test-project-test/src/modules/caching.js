"use strict";
const { createCache } = require("cache-manager");

const cache = createCache();

const getAccessTokenCacheKey = (environmentName, abn) => {
  return `access-token:${environmentName.toLowerCase()}:${abn}`;
};

const getKeystoreDataCacheKey = (environmentName, abn) => {
  return `keystore:${environmentName.toLowerCase()}:${abn}`;
};

module.exports = {
  cache,
  getAccessTokenCacheKey,
  getKeystoreDataCacheKey,
};
