"use strict";
const { Command, Option } = require("commander");
const { environments } = require("../modules/configuration");
const { getSignedClientAssertionAsync } = require("../modules/security");

const program = new Command();
program
  .name(__filename)
  .description(
    "Get the client_assertion for access token requests, based on the specified environment settings.",
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
    const assertion = await getSignedClientAssertionAsync(environment);
    console.log(assertion);
  })
  .parse();
