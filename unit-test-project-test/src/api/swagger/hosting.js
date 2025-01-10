"use strict";
const { parse } = require("path");
const { serve, setup } = require("swagger-ui-express");
const { Document } = require("yaml");
const { SwaggerTheme, SwaggerThemeNameEnum } = require("swagger-themes");
const {
  versionInfo,
  getVersionInfoByVersionNumber,
  toVersionString,
  getVersionFromVersionString,
} = require("../shared/version-info");
const { getJsonSpecificationsByVersionDetails } = require("./open-api");

const basePath = "/swagger";

const createSwaggerHost = (app) => {
  const specificationUrls = versionInfo
    .map(({ version, title }) => {
      const versionPart = toVersionString(version);
      const fileNamePart = versionPart ? `.${versionPart}` : "";
      const displayNamePart = versionPart
        ? ` - ${versionPart.toUpperCase()}`
        : "";
      return [
        {
          name: `${title} JSON spec${displayNamePart}`,
          url: `${basePath}/specification${fileNamePart}.json`,
        },
        {
          name: `${title} YAML spec${displayNamePart}`,
          url: `${basePath}/specification${fileNamePart}.yaml`,
        },
      ];
    })
    .flat();
  specificationUrls.forEach(({ url }) => {
    app.get(url, (request, response) => {
      const { name, ext, base } = parse(request.url.toLowerCase());
      const [, versionString] = name.split(".");
      const version = getVersionFromVersionString(versionString);
      const type = ext.slice(1);
      const versionDetails = getVersionInfoByVersionNumber(version);
      const json = getJsonSpecificationsByVersionDetails(versionDetails);
      let data = "";
      if (type === "json") {
        data = JSON.stringify(json, null, 2);
      } else {
        const document = new Document();
        document.contents = json;
        data = document.toString();
      }
      response
        .set({
          "content-disposition": `attachment; filename=${base}`,
          "content-type": `${type === "json" ? "application" : "text"}/${type}`,
        })
        .send(data);
    });
  });
  const swaggerTheme = new SwaggerTheme();
  const themes = {
    baseUrl: `${basePath}/themes`,
    default: SwaggerThemeNameEnum.CLASSIC,
    list: Object.entries(SwaggerThemeNameEnum).map(([, value]) => {
      return value;
    }),
  };
  app.get(`${themes.baseUrl}/:theme`, ({ params: { theme } }, response) => {
    response.send(swaggerTheme.getBuffer(theme));
  });
  const options = {
    ...swaggerTheme.getDefaultConfig(themes.default),
    customSiteTitle: "USI School Helper Web API Documentation",
    customCssUrl: ["/usi-swagger-ui.css"],
    customJs: ["/usi-swagger-ui.js"],
    customJsStr: `window.themes = ${JSON.stringify(themes)};`,
    customfavIcon: "/favicon.ico",
    swaggerOptions: {
      urls: specificationUrls.reverse(),
      displayRequestDuration: true,
      defaultModelsExpandDepth: 0,
      requestSnippetsEnabled: true,
    },
  };
  app.use(basePath, serve, setup(null, options));
};

module.exports = {
  createSwaggerHost,
};
