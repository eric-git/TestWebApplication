"use strict";
const axios = require("axios");
const { Agent } = require("https");
const { generateHTML } = require("swagger-ui-express");
const { apiSpecificationUrl } = require("./settings.json");
const { themes, initialTheme } = require("./theme");

const getSwaggerOptionsAsync = async (
  { protocol, headers: { host }, app: { mountpath } },
  response,
) => {
  let specificationResponse = {};
  await axios
    .get(`${protocol}://${host}${apiSpecificationUrl}`, {
      httpsAgent: new Agent({ rejectUnauthorized: false }),
    })
    .then((httpResponse) => {
      specificationResponse = httpResponse.data;
    });
  const specificationUrls = specificationResponse
    .sort((a, b) => (b.version || 0) - (a.version || 0))
    .map(({ urls }) => urls)
    .flat();
  const options = {
    ...initialTheme,
    customSiteTitle: "USI School Helper Web API Documentation",
    customCssUrl: ["usi-swagger-ui.css"],
    customJs: ["usi-swagger-ui.js"],
    customJsStr: `window.themes = ${JSON.stringify({
      ...themes,
      baseUrl: `${mountpath}${themes.baseUrl}`,
    })};`,
    customfavIcon: "favicon.ico",
    swaggerOptions: {
      urls: specificationUrls,
      displayRequestDuration: true,
      defaultModelsExpandDepth: 0,
      requestSnippetsEnabled: true,
    },
  };
  response.type("html").send(generateHTML(null, options));
};

module.exports = {
  getSwaggerOptionsAsync,
};
