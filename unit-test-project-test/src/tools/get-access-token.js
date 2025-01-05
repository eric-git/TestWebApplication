"use strict";
const { Command, Option } = require("commander");
const { environments } = require("../modules/configuration");
const { getClientAccessTokenAsync } = require("../modules/security");

const program = new Command();
program
  .name(__filename)
  .description(
    "Get the access token, based on the specified environment settings.",
  )
  .version("1.0.0")
  .addOption(
    new Option(
      "-e, --environment <environment name>",
      "name of the environment",
    )
      .choices(environments)
      .makeOptionMandatory(),
  )
  .action(async () => {
    const { environment } = program.opts();
    const { data } = await getClientAccessTokenAsync(environment);
    console.log(data);
  })
  .parse();
