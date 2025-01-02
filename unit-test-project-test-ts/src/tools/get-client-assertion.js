"use strict";
require("./setup.js");

const { Command, Option } = require("commander");
const { environments } = require(`${appRoot}/modules/configuration.js`);
const { getSignedClientAssertion } = require(`${appRoot}/modules/security.js`);

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
  .action(() => {
    const { environment } = program.opts();
    const assertion = getSignedClientAssertion(environment);
    console.log(assertion);
  })
  .parse();
