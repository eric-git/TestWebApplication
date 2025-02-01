"use strict";
const swaggerJsdoc = require("swagger-jsdoc");
const { globSync } = require("glob");
const {
  getDeprecatedVersions,
  getSunsetVersions,
  getNewVersions,
  getStringByVersion,
  isVersionDeprecated,
  isVersionSunset,
} = require("./version");
const { specifications } = require("../settings.json");

const pathRegEx = /#\/components\/(\w+)\/(.+)/;
const rootPath = "./src/apps/api";
const sharedFiles = globSync(`${rootPath}/middleware/**/*.js`);

const getComponentByPath = (path, specification) => {
  const match = path.match(pathRegEx);
  if (!match) {
    return null;
  }
  const [, type, component] = match;
  const typeObject = specification.components[type];
  if (!typeObject) {
    return null;
  }
  const componentObject = typeObject[component];
  if (!componentObject) {
    return null;
  }
  return {
    type: {
      name: type,
      value: typeObject,
    },
    component: {
      name: component,
      value: componentObject,
    },
  };
};

const findAllReferences = (obj, references = new Set()) => {
  if (typeof obj === "object") {
    for (let [key, value] of Object.entries(obj)) {
      if (key === "$ref") {
        references.add(value);
      } else {
        findAllReferences(value, references);
      }
    }
  }
  return references;
};

const removeUnusedComponents = (specification) => {
  const allReferences = findAllReferences(specification);
  const usedComponents = [];
  allReferences.forEach((path) => {
    const result = getComponentByPath(path, specification);
    if (result) {
      usedComponents.push(`${result.type.name}/${result.component.name}`);
    }
  });

  let componentDeleted = false;
  Object.keys(specification.components).forEach((type) => {
    Object.keys(specification.components[type]).forEach((component) => {
      if (!usedComponents.some((x) => x === `${type}/${component}`)) {
        delete specification.components[type][component];
        componentDeleted = true;
      }
    });
  });
  if (componentDeleted) {
    removeUnusedComponents(specification);
  }
};

const ensureResponses = (specification, responses) => {
  const responsesToHandle = Object.entries(responses);
  for (let [, path] of Object.entries(specification.paths)) {
    for (let [, operation] of Object.entries(path)) {
      for (let [key, value] of responsesToHandle) {
        operation.responses[key] = value;
      }
    }
  }
};

const ensureResponseHeaders = (response, headersToHandle) => {
  response.headers = response.headers || {};
  for (let [key, value] of headersToHandle) {
    response.headers[key] = value;
  }
};

const ensureHeaders = (specification, headers) => {
  const headersToHandle = Object.entries(headers);
  for (let [, response] of Object.entries(specification.components.responses)) {
    ensureResponseHeaders(response, headersToHandle);
  }
  for (let [, path] of Object.entries(specification.paths)) {
    for (let [, operation] of Object.entries(path)) {
      for (let [, response] of Object.entries(operation.responses)) {
        if (!response.$ref) {
          ensureResponseHeaders(response, headersToHandle);
        }
      }
    }
  }
};

const getJsonSpecificationsByVersion = (versionInfo, baseUrl) => {
  const { version, title, description, controllers } = versionInfo;
  const versionString = getStringByVersion(versionInfo);
  const patterns = controllers.map(
    (x) =>
      `${rootPath}/controllers/${x}/*(controller|route${versionString ? `.${versionString}` : ""}).js`,
  );
  const specification = swaggerJsdoc({
    definition: {
      openapi: "3.0.0",
      info: {
        title: title,
        version: `${version || 1}.0.0`,
        description: description,
      },
      servers: [
        {
          url: `${baseUrl}${versionString ? `/${versionString}` : ""}`,
          description: `Web API server${version ? ` - Version ${version}` : ""}`,
        },
      ],
    },
    apis: [...sharedFiles, ...globSync(patterns)],
  });
  ensureResponses(specification, {
    500: { $ref: "#/components/responses/ServerError" },
  });
  if (version) {
    const sunsetVersions = getSunsetVersions();
    const newVersions = getNewVersions();
    const deprecatedVersions = getDeprecatedVersions();
    if ([...sunsetVersions, ...newVersions].length) {
      ensureHeaders(specification, {
        "Api-Supported-Versions": {
          $ref: "#/components/headers/Api-Supported-Versions",
        },
      });
    }
    if (deprecatedVersions.length) {
      ensureHeaders(specification, {
        "Api-Deprecated-Versions": {
          $ref: "#/components/headers/Api-Deprecated-Versions",
        },
      });
    }
    if (isVersionDeprecated(versionInfo)) {
      ensureHeaders(specification, {
        Deprecation: { $ref: "#/components/headers/Deprecation" },
      });
      for (let [, path] of Object.entries(specification.paths)) {
        for (let [, operation] of Object.entries(path)) {
          operation.responses = {
            410: { $ref: "#/components/responses/Gone" },
            500: { $ref: "#/components/responses/ServerError" },
          };
          operation["deprecated"] = true;
        }
      }
    } else if (isVersionSunset(versionInfo)) {
      ensureHeaders(specification, {
        Sunset: { $ref: "#/components/headers/Sunset" },
      });
    }
  }
  removeUnusedComponents(specification);
  return specification;
};

module.exports = {
  specificationSettings: specifications,
  getJsonSpecificationsByVersion,
};
