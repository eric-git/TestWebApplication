"use strict";
/**
 * @openapi
 * tags:
 *   - name: Tools
 *     description: Operations related to tools for development
 */
const { getEnvironmentByName } = require("../../shared/environment");
const { createPrivateKey } = require("crypto");
const { asn1, pki, pkcs7, md, util } = require("node-forge");

const oidMapper = [{ oid: "2.5.4.46", name: "dnQualifier" }];

const getAttributes = (attributes) =>
  attributes
    .map(({ shortName, name, type, value }) => {
      let attributeName = shortName || name;
      if (!attributeName) {
        const oid = oidMapper.find((x) => x.oid === type);
        attributeName = oid ? oid.name : `OID:${type}`;
      }
      return `${attributeName}=${value}`;
    })
    .join(", ");

const formatEndOfLine = (text) => text.replace(/\r\n/g, "\n");

const getCertificatesFromBase64 = (data) => {
  const buffer = Buffer.from(data, "base64").toString("binary");
  const { certificates } = pkcs7.messageFromAsn1(asn1.fromDer(buffer));
  return certificates.map((certificate) => {
    const sha1 = md.sha1.create();
    sha1.update(asn1.toDer(pki.certificateToAsn1(certificate)).getBytes());
    const thumbprint = sha1.digest().toHex();
    return {
      subject: getAttributes(certificate.subject.attributes),
      issuer: getAttributes(certificate.issuer.attributes),
      not_before: certificate.validity.notBefore,
      not_after: certificate.validity.notAfter,
      serial_number: certificate.serialNumber,
      thumbprint: thumbprint,
      sha1_fingerprint: util.encode64(util.hexToBytes(thumbprint)),
      pem: formatEndOfLine(pki.certificateToPem(certificate)),
    };
  });
};

const getPrivateKeyFromBase64 = (password, data) => {
  const privateKey = createPrivateKey({
    key: `-----BEGIN ENCRYPTED PRIVATE KEY-----\n${data}\n-----END ENCRYPTED PRIVATE KEY-----`,
    type: "pkcs8",
    passphrase: password,
  });
  return formatEndOfLine(
    privateKey.export({
      type: "pkcs8",
      format: "pem",
    }),
  );
};

/**
 * @openapi
 * components:
 *   schemas:
 *     CertificateDetails:
 *       type: object
 *       properties:
 *         subject:
 *           type: string
 *           example: OU=USI, O=DEWR, L=CBR, S=ACT, C=AU, CN=School
 *         issuer:
 *           type: string
 *           example: OU=USI, O=DEWR, L=CBR, S=ACT, C=AU, CN=School
 *         not_before:
 *           type: string
 *           format: date-time
 *           example: 2023-08-24T01:33:24.000Z
 *         not_after:
 *           type: string
 *           format: date-time
 *           example: 2024-08-24T01:33:24.000Z
 *         serial_number:
 *           type: string
 *           example: 224930422055843348379110993363445171858234173891
 *         thumbprint:
 *           type: string
 *           example: 3E0365E45995977517F92709CA60C70A4BDF1DE9
 *         sha1_fingerprint:
 *           type: string
 *           example: the thumbprint in base64 format...
 *         pem:
 *           type: string
 *           example: The content of the certificate in PEM format...
 *   responses:
 *     CertificateDetailsList:
 *       description: The list of certificate info in a combined certificate
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               $ref: "#/components/schemas/CertificateDetails"
 */
const getCertificates = ({ params: { environment } }, response) => {
  const {
    keystoreData: { publicCertificate },
  } = getEnvironmentByName(environment);
  const certificates = getCertificatesFromBase64(publicCertificate);
  response.json(certificates);
};

/**
 * @openapi
 * components:
 *   schemas:
 *     DecryptedPrivateKeyDetails:
 *       type: string
 *       example: The decrypted private key in PEM format...
 *   responses:
 *     PrivateKeyDetails:
 *       description: The decrypted private key in PEM format
 *       content:
 *         text/plain:
 *           schema:
 *             $ref: "#/components/schemas/DecryptedPrivateKeyDetails"
 */
const getPrivateKey = ({ params: { environment } }, response) => {
  const {
    keystoreData: { protectedPrivateKey },
    machinePassword,
  } = getEnvironmentByName(environment);
  const privateKey = getPrivateKeyFromBase64(
    machinePassword,
    protectedPrivateKey,
  );
  response.type("text/plain").send(privateKey);
};

/**
 * @openapi
 * components:
 *   schemas:
 *     Base64Certificate:
 *       type: string
 *       format: byte
 *       example: The combined certificate in base64 format...
 */
const resolveCertificates = ({ body }, response) => {
  const certificates = getCertificatesFromBase64(body);
  response.json(certificates);
};

/**
 * @openapi
 * components:
 *   schemas:
 *     Base64EncryptedPrivateKey:
 *       type: object
 *       properties:
 *         password:
 *           type: string
 *           format: password
 *         data:
 *           type: string
 *           format: byte
 *           example: The encrypted private key in base64 format...
 *       required:
 *         - password
 *         - data
 */
const resolvePrivateKey = ({ body: { password, data } }, response) => {
  const privateKey = getPrivateKeyFromBase64(password, data);
  response.type("text/plain").send(privateKey);
};

module.exports = {
  getCertificates,
  getPrivateKey,
  resolveCertificates,
  resolvePrivateKey,
};
