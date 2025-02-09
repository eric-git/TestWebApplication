"use strict";
/**
 * Description: Renew the SSL certificate
 * Usage: node ./cert-renewal.js --quiet
 */
const { pki, md, random, util } = require("node-forge");
const { existsSync, readFileSync, writeFileSync } = require("fs");
const { resolve } = require("path");
const { parseArgs } = require("./util");

const generateCertificate = () => {
  const keyPair = pki.rsa.generateKeyPair(2048);
  const certificate = pki.createCertificate();
  certificate.publicKey = keyPair.publicKey;
  const bytes = random.getBytesSync(20);
  const hex = util.bytesToHex(bytes);
  certificate.serialNumber = hex;
  certificate.validity.notBefore = new Date();
  certificate.validity.notAfter = new Date();
  certificate.validity.notAfter.setFullYear(
    certificate.validity.notBefore.getFullYear() + 1,
  );
  const attributes = [
    { name: "commonName", value: "School" },
    { name: "countryName", value: "AU" },
    { shortName: "ST", value: "ACT" },
    { name: "localityName", value: "CBR" },
    { name: "organizationName", value: "DEWR" },
    { shortName: "OU", value: "USI" },
  ];
  certificate.setSubject(attributes);
  certificate.setIssuer(attributes);
  certificate.setExtensions([
    {
      name: "subjectAltName",
      altNames: [
        {
          type: 2,
          value: "localhost",
        },
      ],
    },
    {
      name: "basicConstraints",
      cA: true,
    },
    {
      name: "subjectKeyIdentifier",
    },
  ]);
  certificate.sign(keyPair.privateKey, md.sha256.create());
  return {
    privateKey: pki.privateKeyToPem(keyPair.privateKey),
    certificate: pki.certificateToPem(certificate),
  };
};

const { quiet } = parseArgs();
const certPath = resolve("./src/assets/server.cert");
const keyPath = resolve("./src/assets/server.key");
const exists = existsSync(certPath) && existsSync(keyPath);
let valid = false;
if (exists) {
  const certificatePem = readFileSync(certPath, "utf-8");
  const certificate = pki.certificateFromPem(certificatePem);
  const now = new Date();
  valid =
    now >= certificate.validity.notBefore &&
    now <= certificate.validity.notAfter;
}
if (!exists || !valid) {
  const { privateKey, certificate } = generateCertificate();
  writeFileSync(certPath, certificate);
  writeFileSync(keyPath, privateKey);
  console.info("New SSL certificate generated and saved.");
} else {
  if (!quiet) {
    console.info("The SSL certificate is still valid.");
  }
}
