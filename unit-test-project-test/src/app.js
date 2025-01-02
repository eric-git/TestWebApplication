"use strict";
const path = require("path");
global.appRoot = path.resolve(__dirname);

require(`${appRoot}/api/index.js`);
