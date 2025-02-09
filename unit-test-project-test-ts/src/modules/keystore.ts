"use strict";
import { readFileSync } from "fs";
import { useNamespaces } from "xpath";
import { DOMParser, Document } from "@xmldom/xmldom";
import { EnvironmentData } from "./configuration";

export type Credential = {
  integrityValue: string;
  credentialType: string;
  id: string;
  credentialSalt: string;
  name1: string;
  name2: string | null;
  abn: string;
  legalName: string;
  personId: string | null;
  serialNumber: string;
  creationDate: Date;
  notBefore: Date;
  notAfter: Date;
  sha1fingerprint: string;
  publicCertificate: string;
  protectedPrivateKey: string;
};

const xpathSelect = useNamespaces({
  sbr: "http://auth.abr.gov.au/credential/xsd/SBRCredentialStore",
});

const appRoot = process.cwd();

export const getKeystoreData = (configuration: EnvironmentData): Credential => {
  const xml = readFileSync(
    `${appRoot}/assets/${configuration.machineKeystoreFileName}`,
    { encoding: "utf8" },
  );
  const document: Document = new DOMParser().parseFromString(xml, "text/xml");
  const rootElement: Node | null = document.documentElement as unknown as Node;
  if (!rootElement) {
    throw new ReferenceError("Document root element is null.");
  }
  const credential:Node =
    xpathSelect(
      `sbr:credentials/sbr:credential[sbr:abn='${configuration.machineAbn}']`,
      rootElement,
      true
    ) as unknown as Node;
  if (!credential) {
    throw new ReferenceError(
      `Credential of ABN '${configuration.machineAbn}' not found in keystore file.`,
    );
  }
  const salt: Node = xpathSelect("sbr:salt", rootElement, true) as unknown as Node;
  const data = {};
      data[salt.nodeName] = salt.textContent;
  const dateTimeFields = ["creationDate", "notBefore", "notAfter"];
  credential.childNodes.forEach((x) => {
    
    if (x.nodeType === 1) {
      data[x.nodeName] = dateTimeFields.includes(x.nodeName)
        ? new Date(x.textContent)
        : x.textContent;
    } else if (x.nodeType === 2) {
      data[x.name] = x.value;
    }
  });
  return data as Credential;
};
