"use strict";
const { SwaggerTheme, SwaggerThemeNameEnum } = require("swagger-themes");
const { themeBasePath, defaultTheme } = require("./settings.json");

const swaggerTheme = new SwaggerTheme();

const getThemeByName = ({ params: { theme } }, response) => {
  const selectedTheme = swaggerTheme.getBuffer(theme);
  response.type("html").send(selectedTheme);
};

const themes = {
  baseUrl: themeBasePath,
  default: defaultTheme,
  list: Object.entries(SwaggerThemeNameEnum).map(([, value]) => value),
};

const initialTheme = swaggerTheme.getDefaultConfig(themes.default);

module.exports = {
  initialTheme,
  themes,
  getThemeByName,
};
