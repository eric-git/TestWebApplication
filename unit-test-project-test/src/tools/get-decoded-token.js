"use strict";
const { Command, Option } = require("commander");
const { getDecodedTokenOrClientAssertion } = require("../modules/security");

const command = new Command();
command
  .name(__filename)
  .description("Get the decoded access token or client credential.")
  .version("1.0.0")
  .addOption(
    new Option("-d, --data <token>", "the encode token").makeOptionMandatory(),
  )
  .action(() => {
    const { data } = command.opts();
    const decodedToken = getDecodedTokenOrClientAssertion(data);
    console.log(decodedToken);
  })
  .parse();
