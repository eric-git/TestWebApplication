"use strict";
const { readFileSync } = require("fs");
const { join } = require("path");
const { useNamespaces } = require("xpath");
const { DOMParser } = require("@xmldom/xmldom");
const { environments } = require("../settings.json");

const xpathSelect = useNamespaces({
  sbr: "http://auth.abr.gov.au/credential/xsd/SBRCredentialStore",
});
const dateTimeFields = ["creationDate", "notBefore", "notAfter"];

environments.forEach((x) => {
  const { machineKeystoreFileName, machineAbn } = x;
  const xml = readFileSync(
    join(__dirname, "../", "assets", machineKeystoreFileName),
    { encoding: "utf8" },
  );
  const document = new DOMParser().parseFromString(xml, "text/xml");
  const rootElement = document.documentElement;
  const credential = xpathSelect(
    `sbr:credentials/sbr:credential[sbr:abn='${machineAbn}']`,
    rootElement,
    true,
  );
  if (!credential) {
    throw new ReferenceError(
      `Machine credential of ABN '${machineAbn}' not found in keystore file.`,
    );
  }
  const data = {};
  const salt = xpathSelect("sbr:salt", rootElement, true);
  if (salt) {
    data[salt.nodeName] = salt.textContent;
  }
  [...credential.attributes, ...credential.childNodes]
    .filter(({ nodeType }) => nodeType === 1 || nodeType === 2)
    .forEach(({ nodeType, nodeName, textContent, name, value }) => {
      const itemData = {
        name: nodeType == 1 ? nodeName : name,
        value: nodeType === 1 ? textContent : value,
      };
      data[itemData.name] =
        dateTimeFields.includes(itemData.name) && itemData.value
          ? new Date(itemData.value)
          : itemData.value;
    });
  x.keystoreData = data;
});

const getEnvironmentByName = (name) => {
  const environmentName = (name || "").toLowerCase();
  const environment = environments.find(
    ({ name }) => name.toLowerCase() === environmentName,
  );
  return environment;
};

module.exports = {
  environments,
  getEnvironmentByName,
};
