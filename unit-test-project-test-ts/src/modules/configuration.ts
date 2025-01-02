import * as vsCodeSettings from "@/../.vscode/settings.json";

const shared: string = "$shared";
const settings: { [key: string]: any } =
  vsCodeSettings["rest-client.environmentVariables"];

export type EnvironmentData = {
  environmentName: string;
  machineKeystoreFileName: string;
  machineAbn: string;
  machinePassword: string;
  machineClientId: string;
  usiApiBaseUrl: string;
  usiApplicationId: string;
  apimSubscriptionKey: string;
  ciamTenant: string;
};

export const environments: string[] = Object.keys(settings).filter(
  (x) => x !== shared,
);
export const sharedSettings: any = settings[shared];
export const getConfigurationByEnvironmentName = (
  environmentName: string,
): EnvironmentData | null => {
  const envName = environmentName.toLowerCase();
  const result = environments.filter((x) => x.toLowerCase() === envName);
  return result.length !== 1 ? null : settings[result[0]];
};
