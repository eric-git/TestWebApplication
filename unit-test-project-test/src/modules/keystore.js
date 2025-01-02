"use strict";
const { readFileSync } = require("fs");
const { useNamespaces } = require("xpath");
const { DOMParser } = require("@xmldom/xmldom");
const { getConfigurationByEnvironmentName } = require(
  `${appRoot}/modules/configuration.js`,
);
const { cache, getKeystoreDataCacheKey } = require(
  `${appRoot}/modules/caching.js`,
);

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
  const xml = readFileSync(`${appRoot}/assets/${machineKeystoreFileName}`, {
    encoding: "utf8",
  });
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
    if (x.nodeType === 1) {
      data[x.nodeName] = dateTimeFields.includes(x.nodeName)
        ? new Date(x.textContent)
        : x.textContent;
    } else if (x.nodeType === 2) {
      data[x.name] = x.value;
    }
  });
  await cache.set(cacheKey, data);
  return data;
};

module.exports = {
  getKeystoreDataAsync,
};
