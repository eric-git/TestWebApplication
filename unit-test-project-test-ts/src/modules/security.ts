import { createSign, createPrivateKey } from "crypto";
import axios from "axios";
import FormData from "form-data";
import {
  EnvironmentData,
  getConfigurationByEnvironmentName,
} from "@/modules/configuration";
import { getKeystoreData } from "@/modules/keystore";

interface Header {
  alg: string;
  typ: string;
}

interface Payload {
  iss: string;
  sub: string;
  aud: string;
  exp: number;
  jti: string;
}

const base64url = (input: string): string => {
  return Buffer.from(input, "base64").toString("base64url");
};

export const getSignedClientAssertion = (
  environmentName: string,
): { client_assertion: string; original_data: any } => {
  const configuration = getConfigurationByEnvironmentName(environmentName);
  if (!configuration) {
    throw new Error(
      `Configuration not found for environment: ${environmentName}`,
    );
  }
  const header: Header = {
    alg: "RS256",
    typ: "JWT",
  };
  const payload: Payload = {
    iss: configuration.machineClientId,
    sub: configuration.machineClientId,
    aud: `https://login.microsoftonline.com/${configuration.ciamTenant}/oauth2/v2.0/token`,
    exp: Math.floor(Date.now() / 1000) + 60 * 10, // 10 minutes expiration
    jti: "unique-jwt-id",
  };
  const encodedHeader = base64url(JSON.stringify(header));
  const encodedPayload = base64url(JSON.stringify(payload));
  const assertionToSign = `${encodedHeader}.${encodedPayload}`;
  const sign = createSign("RSA-SHA256");
  sign.update(assertionToSign);
  sign.end();

  const keystoreData = getKeystoreData(configuration);

  const privateKey = createPrivateKey({
    key: `-----BEGIN ENCRYPTED PRIVATE KEY-----\n${keystoreData.protectedPrivateKey}\n-----END ENCRYPTED PRIVATE KEY-----`,
    type: "pkcs8",
    passphrase: configuration.machinePassword,
  });
  const signature = sign.sign(privateKey, "base64url");
  const client_assertion = `${assertionToSign}.${signature}`;
  return {
    client_assertion: client_assertion,
    original_data: {
      header: header,
      payload: payload,
      signature: Buffer.from(signature, "base64url").toString("base64"),
    },
  };
};

export const getClientAccessTokenAsync = async (
  environmentName: string,
): Promise<{ status: number; data: any }> => {
  const configuration = getConfigurationByEnvironmentName(environmentName);
  if (!configuration) {
    throw new Error(
      `Configuration not found for environment: ${environmentName}`,
    );
  }
  const clientAssertion = getSignedClientAssertion(environmentName);
  const formData = new FormData();
  formData.append(
    "client_assertion_type",
    "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
  );
  formData.append("grant_type", "client_credentials");
  formData.append("client_id", configuration.machineClientId);
  formData.append("scope", `${configuration.usiApplicationId}/.default`);
  formData.append("client_assertion", clientAssertion.client_assertion);
  const response = {
    status: 500,
    data: null,
  };
  await axios
    .post(
      `https://login.microsoftonline.com/${configuration.ciamTenant}/oauth2/v2.0/token`,
      formData,
    )
    .then((httpResponse) => {
      response.status = httpResponse.status;
      response.data = httpResponse.data;
    });
  return response;
};
