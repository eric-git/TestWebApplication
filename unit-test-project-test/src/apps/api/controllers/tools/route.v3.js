"use strict";
const {
  getCertificates,
  getPrivateKey,
  resolveCertificates,
  resolvePrivateKey,
} = require("./controller");
const {
  certificateByEnvironmentValidator,
  privateKeyByEnvironmentValidator,
  certificateValidator,
  privateKeyValidator,
} = require("./validator");

const setupRouter = (router, prefix) => {
  /**
   * @openapi
   * /tools/certificates/{environment}:
   *   get:
   *     description: Get info of the public certificates for the specified environment
   *     parameters:
   *       - $ref: "#/components/parameters/Environment"
   *     responses:
   *       "200":
   *         $ref: "#/components/responses/CertificateDetailsList"
   *       "400":
   *         $ref: "#/components/responses/BadRequest"
   *     tags:
   *       - Tools
   */
  router.get(
    `${prefix}/certificates/:environment`,
    certificateByEnvironmentValidator,
    getCertificates,
  );

  /**
   * @openapi
   * /tools/certificates:
   *   post:
   *     description: Get info of the certificates for the provided data
   *     requestBody:
   *       required: true
   *       content:
   *         text/plain:
   *           schema:
   *             $ref: "#/components/schemas/Base64Certificate"
   *     responses:
   *       "200":
   *         $ref: "#/components/responses/CertificateDetailsList"
   *       "400":
   *         $ref: "#/components/responses/BadRequest"
   *     tags:
   *       - Tools
   */
  router.post(
    `${prefix}/certificates`,
    certificateValidator,
    resolveCertificates,
  );

  /**
   * @openapi
   * /tools/private-key/{environment}:
   *   get:
   *     description: Get info of the private key for the specified environment
   *     parameters:
   *       - $ref: "#/components/parameters/Environment"
   *     responses:
   *       "200":
   *         $ref: "#/components/responses/PrivateKeyDetails"
   *       "400":
   *         $ref: "#/components/responses/BadRequest"
   *     tags:
   *       - Tools
   */
  router.get(
    `${prefix}/private-key/:environment`,
    privateKeyByEnvironmentValidator,
    getPrivateKey,
  );

  /**
   * @openapi
   * /tools/private-key:
   *   post:
   *     description: Get info of the private key for the provided data
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: "#/components/schemas/Base64EncryptedPrivateKey"
   *     responses:
   *       "200":
   *         $ref: "#/components/responses/PrivateKeyDetails"
   *       "400":
   *         $ref: "#/components/responses/BadRequest"
   *     tags:
   *       - Tools
   */
  router.post(`${prefix}/private-key`, privateKeyValidator, resolvePrivateKey);
};

module.exports = {
  setupRouter,
};
