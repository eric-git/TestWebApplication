"user strict";
const { versions } = require("../settings.json");

versions.forEach((x) => {
  if (x.version && x.sunsetDate) {
    x.sunsetDate = new Date(x.sunsetDate);
  }
});

const getSunsetVersions = () => {
  const now = new Date();
  return versions.filter(
    (x) => x.version && x.sunsetDate instanceof Date && x.sunsetDate >= now,
  );
};

const isVersionSunset = (versionInfo) =>
  getSunsetVersions().some((x) => x.version === versionInfo.version);

const getNewVersions = () =>
  versions.filter((x) => x.version && !(x.sunsetDate instanceof Date));

const isVersionNew = (versionInfo) =>
  getNewVersions().some((x) => x.version === versionInfo.version);

const getDeprecatedVersions = () => {
  const now = new Date();
  return versions.filter(
    (x) => x.version && x.sunsetDate instanceof Date && x.sunsetDate < now,
  );
};

const isVersionDeprecated = (versionInfo) =>
  getDeprecatedVersions().some((x) => x.version === versionInfo.version);

const getVersionByNumber = (number) =>
  versions.find(({ version }) => (number ? version === number : !version));

const getStringByVersion = (versionInfo) =>
  versionInfo.version ? `v${versionInfo.version}` : "";

module.exports = {
  versions,
  getSunsetVersions,
  isVersionSunset,
  getNewVersions,
  isVersionNew,
  getDeprecatedVersions,
  isVersionDeprecated,
  getVersionByNumber,
  getStringByVersion,
};
