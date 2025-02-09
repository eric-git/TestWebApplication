"use strict";
const {
  getSignedClientAssertion,
  getClientAccessTokenAsync,
  getDecodedTokenOrClientAssertion,
} = require(`${appRoot}/modules/security.js`);

const getClientAssertion = ({ params: { environment } }, response) => {
  const clientAssertion = getSignedClientAssertion(environment);
  response.send(clientAssertion);
};

const getAccessTokenAsync = async ({ params: { environment } }, response) => {
  const accessTokenResponse = await getClientAccessTokenAsync(environment);
  response.status(accessTokenResponse.status).json(accessTokenResponse.data);
};

const getDecodedToken = ({ body }, response) => {
  const decodedData = getDecodedTokenOrClientAssertion(body);
  response.send(decodedData);
};

module.exports = {
  getClientAssertion,
  getAccessTokenAsync,
  getDecodedToken,
};
