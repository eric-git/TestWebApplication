"use strict";
const { Router } = require("express");
const {
  getAccessTokenAsync,
  getAccessTokenV3Async,
  getClientAssertionAsync,
  getDecodedToken,
} = require("./controller");
const {
  clientAssertionValidator,
  accessTokenValidator,
  accessTokenV3Validator,
  decodedTokenValidator,
} = require("./validator");
const { versionHandler } = require("../../middleware/version-handler");
const { validationHandler } = require("../../middleware/validation-handler");
const { versionInfo } = require("../../shared/version-info");

const securityRouters = versionInfo.map((x) => {
  const securityRouter = Router();
  const prefix = `/v${x.version}/security`;
  const versionMiddleware = versionHandler(x.version);
  switch (x.version) {
    case 1:
      securityRouter.get(
        `${prefix}/token/:environment`,
        versionMiddleware,
        accessTokenValidator,
        validationHandler,
        getAccessTokenAsync,
      );
      securityRouter.get(
        `${prefix}/assertion/:environment`,
        versionMiddleware,
        clientAssertionValidator,
        validationHandler,
        getClientAssertionAsync,
      );
      securityRouter.post(
        `${prefix}/decode`,
        versionMiddleware,
        decodedTokenValidator,
        validationHandler,
        getDecodedToken,
      );
      break;
    case 2:
      securityRouter.get(
        `${prefix}/token/:environment`,
        versionMiddleware,
        accessTokenValidator,
        validationHandler,
        getAccessTokenAsync,
      );
      securityRouter.get(
        `${prefix}/assertion/:environment`,
        versionMiddleware,
        clientAssertionValidator,
        validationHandler,
        getClientAssertionAsync,
      );
      securityRouter.post(
        `${prefix}/decode`,
        versionMiddleware,
        decodedTokenValidator,
        validationHandler,
        getDecodedToken,
      );
      break;
    case 3:
      securityRouter.get(
        `${prefix}/token/:environment`,
        versionMiddleware,
        accessTokenV3Validator,
        validationHandler,
        getAccessTokenV3Async,
      );
      securityRouter.get(
        `${prefix}/assertion/:environment`,
        versionMiddleware,
        clientAssertionValidator,
        validationHandler,
        getClientAssertionAsync,
      );
      securityRouter.post(
        `${prefix}/decode`,
        versionMiddleware,
        decodedTokenValidator,
        validationHandler,
        getDecodedToken,
      );
      break;
  }
  return securityRouter;
});

module.exports = {
  securityRouters,
};
