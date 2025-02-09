"use strict";
const express = require("express");
const { versions, getStringByVersion } = require("./shared/version");
const { versionHandler } = require("./middleware/version-handler");
const { notFoundHandler } = require("./middleware/not-found-error-handler");
const { serverErrorHandler } = require("./middleware/server-error-handler");

const createApp = () => {
  const app = express();
  app.use(express.text());
  app.use(express.urlencoded());
  app.use(express.json());
  versions.forEach((x) => {
    const router = express.Router();
    const versionString = getStringByVersion(x);
    const path = `${versionString ? `/${versionString}` : ""}`;
    if (versionString) {
      router.use(versionHandler(x));
    }
    x.controllers.forEach((y) => {
      const { setupRouter } = require(
        `./controllers/${y}/route${versionString ? `.${versionString}` : ""}`,
      );
      setupRouter(router, `/${y}`);
    });
    app.use(path, router);
  });
  app.use(notFoundHandler, serverErrorHandler);
  return app;
};

module.exports = {
  createApp,
};
