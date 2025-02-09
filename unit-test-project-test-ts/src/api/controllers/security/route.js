"use strict";
const express = require("express");
const { getAccessTokenAsync, getClientAssertion, getDecodedToken } = require(
  `${appRoot}/api/controllers/security/controller.js`,
);
const {
  clientAssertionValidator,
  accessTokenValidator,
  decodedTokenValidator,
} = require(`${appRoot}/api/controllers/security/validator.js`);
const { versionHandler } = require(
  `${appRoot}/api/middleware/version-handler.js`,
);

const year = new Date().getFullYear();
const versionInfo = [
  { version: 1, sunsetDate: new Date(year - 1, 0, 1) },
  { version: 2, sunsetDate: new Date(year + 1, 0, 1) },
  { version: 3 },
];
const securityRouters = versionInfo.map((x) => {
  const securityRouter = express.Router();
  const prefix = `/v${x.version}/security`;
  const versionMiddleware = versionHandler(versionInfo, x.version);
  switch (x.version) {
    case 1:
      securityRouter.get(
        `${prefix}/token/:environment`,
        versionMiddleware,
        accessTokenValidator,
        getAccessTokenAsync,
      );
      securityRouter.get(
        `${prefix}/assertion/:environment`,
        versionMiddleware,
        clientAssertionValidator,
        getClientAssertion,
      );
      securityRouter.post(
        `${prefix}/decode`,
        versionMiddleware,
        decodedTokenValidator,
        getDecodedToken,
      );
      break;
    case 2:
      securityRouter.get(
        `${prefix}/token/:environment`,
        versionMiddleware,
        accessTokenValidator,
        getAccessTokenAsync,
      );
      securityRouter.get(
        `${prefix}/assertion/:environment`,
        versionMiddleware,
        clientAssertionValidator,
        getClientAssertion,
      );
      securityRouter.post(
        `${prefix}/decode`,
        versionMiddleware,
        decodedTokenValidator,
        getDecodedToken,
      );
      break;
    case 3:
      securityRouter.get(
        `${prefix}/token/:environment`,
        versionMiddleware,
        accessTokenValidator,
        getAccessTokenAsync,
      );
      securityRouter.get(
        `${prefix}/assertion/:environment`,
        versionMiddleware,
        clientAssertionValidator,
        getClientAssertion,
      );
      securityRouter.post(
        `${prefix}/decode`,
        versionMiddleware,
        decodedTokenValidator,
        getDecodedToken,
      );
      break;
  }
  return securityRouter;
});

module.exports = securityRouters;
