"use strict";
const express = require("express");
const { URL } = require("url");
const { sharedSettings } = require(`${appRoot}/modules/configuration.js`);
const { notFoundHandler, serverErrorHandler } = require(
  `${appRoot}/api/middleware/error-handlers.js`,
);
const commonRouter = require(`${appRoot}/api/controllers/common/route.js`);
const securityRouters = require(`${appRoot}/api/controllers/security/route.js`);

const app = express();
app.use(express.text());
app.use(express.urlencoded());
app.use(express.json());
app.use("/api", commonRouter, securityRouters);
app.use(notFoundHandler, serverErrorHandler);

const helperApiBaseUrl = new URL(sharedSettings.helperApiBaseUrl);
const port =
  helperApiBaseUrl.port || (helperApiBaseUrl.protocol === "http:" ? 80 : 443);
const server = app.listen(port, () => {
  console.log(`Server is listening on port: ${port}`);
});

const shutDown = () => {
  console.log("Received signal to terminate. Shutting down the API server...");
  server.close(() => {
    console.log("Closed out remaining connections for the API server.");
    process.exit(0);
  });
  setTimeout(() => {
    console.error(
      "Could not close connections in time, forcefully shutting down the API server...",
    );
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", shutDown);
process.on("SIGINT", shutDown);
