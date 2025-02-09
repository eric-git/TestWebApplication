"use strict";
const express = require("express");
const compression = require("compression");
const { URL } = require("url");
const { readFileSync } = require("fs");
const { createServer } = require("https");
const { host, apps } = require("./settings.json");

const app = express();
app.use(compression());
apps.forEach(({ path }) => {
  const { createApp } = require(`./apps${path}/index`);
  app.use(path, createApp());
});
const { port } = new URL(host);
const server = createServer(
  {
    key: readFileSync("./src/assets/server.key"),
    cert: readFileSync("./src/assets/server.cert"),
  },
  app,
).listen(port, () => {
  console.info("Node.js:", process.version);
  console.info("Host:", host);
  apps.forEach(({ type, path }) => {
    console.info(`  - ${type}:`, `${host}${path}`);
  });
});

const shutDown = () => {
  console.info("Received signal to terminate. Shutting down the server...");
  server.close(() => {
    console.info("Closed out remaining connections for the server.");
    process.exit(0);
  });
  setTimeout(() => {
    console.warn(
      "Could not close connections in time, forcefully shutting down the server...",
    );
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", shutDown);
process.on("SIGINT", shutDown);
