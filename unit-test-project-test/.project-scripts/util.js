"use strict";
const parseArgs = () => {
  const args = process.argv.slice(2);
  const parsedArgs = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith("--")) {
      const key = args[i].substring(2);
      parsedArgs[key] = true;
    }
  }
  return parsedArgs;
};

const clone = (original) => JSON.parse(JSON.stringify(original));

const formatData = (data) => `${JSON.stringify(data, null, 2)}\n`;

module.exports = {
  parseArgs,
  clone,
  formatData,
};
