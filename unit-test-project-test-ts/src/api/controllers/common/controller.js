"use strict";
const healthCheck = (_, response) => {
  response.setHeader("content-type", "text/plain").send("Healthy");
};

module.exports = {
  healthCheck,
};
