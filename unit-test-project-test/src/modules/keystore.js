"use strict";
const { readFileSync } = require("fs");
const { join } = require("path");
const { useNamespaces } = require("xpath");
const { DOMParser } = require("@xmldom/xmldom");
const { getConfigurationByEnvironmentName } = require("./configuration");
const { cache, getKeystoreDataCacheKey } = require("./caching");

const xpathSelect = useNamespaces({
  sbr: "http://auth.abr.gov.au/credential/xsd/SBRCredentialStore",
});

const dateTimeFields = ["creationDate", "notBefore", "notAfter"];

const getKeystoreDataAsync = async (environmentName) => {
  const { machineKeystoreFileName, machineAbn } =
    getConfigurationByEnvironmentName(environmentName);
  const cacheKey = getKeystoreDataCacheKey(environmentName, machineAbn);
  const cachedData = await cache.get(cacheKey);
  if (cachedData) {
    return cachedData;
  }
  const xml = readFileSync(
    join(__dirname, "../", "assets", "keystores", machineKeystoreFileName),
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
  [...credential.attributes, ...credential.childNodes].forEach((x) => {
    let name;
    let value;
    if (x.nodeType === 1) {
      name = x.nodeName;
      value = x.textContent;
    } else if (x.nodeType === 2) {
      name = x.name;
      value = x.value;
    } else {
      return;
    }
    data[name] =
      dateTimeFields.includes(name) && value ? new Date(value) : value;
  });
  const recordData = Object.freeze(data);
  await cache.set(cacheKey, recordData);
  return recordData;
};

module.exports = {
  getKeystoreDataAsync,
};
