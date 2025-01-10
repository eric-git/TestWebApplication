"use strict";
const express = require("express");
const favicon = require("serve-favicon");
const { URL } = require("url");
const { join } = require("path");
const { createServer } = require("https");
const { readFileSync } = require("fs");
const { createSwaggerHost } = require("./swagger/hosting");
const { sharedSettings } = require("../modules/configuration");
const {
  notFoundHandler,
  serverErrorHandler,
} = require("./middleware/error-handlers");
const { managementRouter } = require("./controllers/management/route");
const { securityRouters } = require("./controllers/security/route");

const publicFolder = join(__dirname, "public");
const app = express();
app.use(express.static(publicFolder));
app.use(favicon(join(publicFolder, "favicon.ico")));
app.use(express.text());
app.use(express.urlencoded());
app.use(express.json());
createSwaggerHost(app);
app.use("/api", managementRouter, securityRouters);
app.use(notFoundHandler, serverErrorHandler);

const { protocol, host, port } = new URL(sharedSettings.helperApiBaseUrl);
const certPath = join(__dirname, "assets");
const server = createServer(
  {
    key: readFileSync(join(certPath, "server.key")),
    cert: readFileSync(join(certPath, "server.cert")),
  },
  app,
).listen(port, () => {
  console.log("The API server is running on:", `${protocol}//${host}.`);
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
