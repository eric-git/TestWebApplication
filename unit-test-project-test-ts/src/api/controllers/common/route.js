"use strict";
const express = require("express");
const { healthCheck } = require(
  `${appRoot}/api/controllers/common/controller.js`,
);
const { healthCheckValidator } = require(
  `${appRoot}/api/controllers/common/validator.js`,
);

const commonRouter = express.Router();
commonRouter.get("/", healthCheckValidator, healthCheck);

module.exports = commonRouter;
