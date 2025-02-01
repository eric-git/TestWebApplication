"use strict";
const { createCache } = require("cache-manager");

const cache = createCache();

const getAccessTokenCacheKey = ({ name, machineAbn }) =>
  `access-token:${name.toLowerCase()}:${machineAbn}`;

const getKeystoreDataCacheKey = ({ name, machineAbn }) =>
  `keystore:${name.toLowerCase()}:${machineAbn}`;

module.exports = {
  cache,
  getAccessTokenCacheKey,
  getKeystoreDataCacheKey,
};
