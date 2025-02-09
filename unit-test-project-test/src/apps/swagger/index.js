"use strict";
const express = require("express");
const favicon = require("serve-favicon");
const { join } = require("path");
const { serve } = require("swagger-ui-express");
const { getThemeByName, themes } = require("./theme");
const { getSwaggerOptionsAsync } = require("./options");

const createApp = () => {
  const publicFolder = join(__dirname, "public");
  const app = express();
  app.use(express.static(publicFolder));
  app.use(favicon(join(publicFolder, "favicon.ico")));
  app.get(`${themes.baseUrl}/:theme`, getThemeByName);
  app.use("/", serve, getSwaggerOptionsAsync);
  return app;
};

module.exports = {
  createApp,
};
