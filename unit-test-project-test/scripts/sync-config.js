"use strict";
const { resolve, basename } = require("path");
const { writeFileSync } = require("fs");

const source = resolve("./.vscode/settings.json");
const vsCodeSettings = require(source);
const target = resolve("./src/http-tests/http-client.env.json");
const data = vsCodeSettings["rest-client.environmentVariables"];
console.log(
  "Synchronizing environment configurations from",
  `"${basename(source)}"`,
  "to",
  `"${basename(target)}"...`,
);
writeFileSync(target, JSON.stringify(data, null, 2));
const environments = Object.values(data)
  .map(({ environmentName }) =>
    environmentName ? `  ${environmentName}` : null,
  )
  .filter((x) => x);
console.log(
  `The following environment configurations have been copied:\n${environments.join("\n")}`,
);
