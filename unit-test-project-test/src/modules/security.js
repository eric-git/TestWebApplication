"use strict";
const axios = require("axios");
const { createPrivateKey, createSign, randomUUID } = require("crypto");
const { getKeystoreDataAsync } = require("./keystore");
const { getConfigurationByEnvironmentName } = require("./configuration");

const jsonToBase64url = (data) => {
  const stringData = JSON.stringify(data);
  const base64UrlData = Buffer.from(stringData, "utf8").toString("base64url");
  return base64UrlData;
};

const base64urlToJson = (data) => {
  const stringData = Buffer.from(data, "base64url").toString("utf8");
  const jsonData = JSON.parse(stringData);
  return jsonData;
};

const base64urlToBase64 = (data) => {
  return Buffer.from(data, "base64url").toString("base64");
};

const getDecodedTokenOrClientAssertion = (encodedData) => {
  const [header, payload, signature] = encodedData.split(".");
  return {
    header: base64urlToJson(header),
    payload: base64urlToJson(payload),
    signature: base64urlToBase64(signature),
  };
};

const getSignedClientAssertionAsync = async (environmentName) => {
  const { machineClientId, ciamTenant, machinePassword } =
    getConfigurationByEnvironmentName(environmentName);
  const { sha1fingerprint, protectedPrivateKey } =
    await getKeystoreDataAsync(environmentName);
  const currentTime = Math.floor(Date.now() / 1000);
  const header = {
    kid: randomUUID(),
    alg: "RS256",
    x5t: sha1fingerprint,
  };
  const payload = {
    iss: machineClientId,
    sub: machineClientId,
    aud: `https://login.microsoftonline.com/${ciamTenant}/oauth2/v2.0/token`,
    iat: currentTime,
    exp: currentTime + 3600,
  };
  const assertionToSign = `${jsonToBase64url(header)}.${jsonToBase64url(payload)}`;
  const sign = createSign("RSA-SHA256");
  sign.update(assertionToSign);
  sign.end();
  const privateKey = createPrivateKey({
    key: `-----BEGIN ENCRYPTED PRIVATE KEY-----\n${protectedPrivateKey}\n-----END ENCRYPTED PRIVATE KEY-----`,
    type: "pkcs8",
    passphrase: machinePassword,
  });
  const signature = sign.sign(privateKey, "base64url");
  return {
    client_assertion: `${assertionToSign}.${signature}`,
    original_data: {
      header: header,
      payload: payload,
      signature: base64urlToBase64(signature),
    },
  };
};

const getClientAccessTokenAsync = async (environmentName) => {
  const { machineClientId, usiApplicationId, ciamTenant } =
    getConfigurationByEnvironmentName(environmentName);
  const { client_assertion } =
    await getSignedClientAssertionAsync(environmentName);
  const formData = new FormData();
  formData.append(
    "client_assertion_type",
    "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
  );
  formData.append("grant_type", "client_credentials");
  formData.append("client_id", machineClientId);
  formData.append("scope", `${usiApplicationId}/.default`);
  formData.append("client_assertion", client_assertion);
  const response = {};
  await axios
    .post(
      `https://login.microsoftonline.com/${ciamTenant}/oauth2/v2.0/token`,
      formData,
    )
    .then((httpResponse) => {
      response.status = httpResponse.status;
      response.data = httpResponse.data;
    })
    .catch((error) => {
      response.status = error.response.status;
      response.data = error.response.data;
    });
  return response;
};

module.exports = {
  getSignedClientAssertionAsync,
  getClientAccessTokenAsync,
  getDecodedTokenOrClientAssertion,
};
