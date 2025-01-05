"user strict";
const year = new Date().getFullYear();
const versionInfo = [
  { version: 1, sunsetDate: new Date(year - 1, 0, 1) },
  { version: 2, sunsetDate: new Date(year + 1, 0, 1) },
  { version: 3 },
];

module.exports = {
  versionInfo: Object.freeze(versionInfo),
};
