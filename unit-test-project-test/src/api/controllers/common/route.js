"use strict";
const { Router } = require("express");
const { healthCheck } = require("./controller");

const commonRouter = Router();
commonRouter.get("/", healthCheck);

module.exports = {
  commonRouter,
};
