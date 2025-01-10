"user strict";
const year = new Date().getFullYear();
const versionInfo = [
  {
    title: "Management API operations",
    description: "Provides management related operations.",
    controllers: ["management"],
  },
  {
    version: 1,
    sunsetDate: new Date(year - 1, 0, 1),
    title: "Main API operations",
    description: "Provides main operations.",
    controllers: ["security"],
  },
  {
    version: 2,
    sunsetDate: new Date(year + 1, 0, 1),
    title: "Main API operations",
    description: "Provides main operations.",
    controllers: ["security"],
  },
  {
    version: 3,
    title: "Main API operations",
    description: "Provides main operations.",
    controllers: ["security"],
  },
];

const getSunsetVersions = () => {
  const now = new Date();
  return versionInfo
    .filter(
      (x) => x.version && x.sunsetDate instanceof Date && x.sunsetDate >= now,
    )
    .map(({ version }) => version)
    .sort();
};

const getNewVersions = () => {
  return versionInfo
    .filter((x) => x.version && !(x.sunsetDate instanceof Date))
    .map(({ version }) => version)
    .sort();
};

const getDeprecatedVersions = () => {
  const now = new Date();
  return versionInfo
    .filter(
      (x) => x.version && x.sunsetDate instanceof Date && x.sunsetDate < now,
    )
    .map(({ version }) => version)
    .sort();
};

const getVersionInfoByVersionNumber = (versionNumber) => {
  return versionInfo.find(({ version }) =>
    versionNumber ? version === versionNumber : !version,
  );
};

const toVersionString = (version) => {
  return version ? `v${version}` : "";
};

const getVersionFromVersionString = (versionString) => {
  const match = (versionString || "").match(/\d+/);
  return match ? parseInt(match[0], 10) : null;
};

module.exports = {
  versionInfo: versionInfo,
  getSunsetVersions,
  getNewVersions,
  getDeprecatedVersions,
  getVersionInfoByVersionNumber,
  toVersionString,
  getVersionFromVersionString,
};
