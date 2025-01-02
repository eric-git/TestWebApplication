# Unit test for USI school external Web API

This is an alternative unit testing for USI school external Web API, which is using CIAM M2M authentication via APIM. The audience is mainly developers.

This project can be used on both Windows and Linux systems. MacOS and iOS have not been tested.

## Prerequisites

- The testing machine credential must be valid and registered on CIAM;
- A valid APIM subscription key must be created on APIM;
- `VS Code` is required to manage this testing project;
- `Node.js` is required to run this project;
- `VS Code REST Client Extension` is required to run the `.http` files in this project.

## How to start

1. Open this folder using VS Code;

2. Run the following command to spin up a local Node.js Web API (powered by `Express.js`) for helper services;

```console
npm start
```

3. The following helper operations are provided:

- `GET http://localhost:2025/api` - Health check;
- `GET http://localhost:2025/api/:version/security/assertion/:environment` - Get the client assertion that can be used for access token request;
- `GET http://localhost:2025/api/:version/security/token/:environment` - Get the access token directly;
- `POST http://localhost:2025/api/:version/security/decode` - Get the decoded access token or client assertion;

where the :version for testing:

- `v1`: deprecated;
- `v2`: to be replaced;
- `v3`: new.

the :environment for testing is defined in the section `rest-client.environmentVariables` in the [VS Code settings.json file](./.vscode/settings.json) and/or [http-client.env.json](./src/http-tests/http-client.env.json).

4. Open the relevant `.http` files under folder `http-tests` to test the requests.

## Other features

- Run the following command to get the client assertion that can be used for access token request without running the server;

```console
node ./src/tools/get-client-assertion.js -e <the environment name>
```

- Run the following command to get the access token directly without running the server;

```console
node ./src/tools/get-access-token.js -e <the environment name>
```

- Run the following command to get the decoded access token or client assertion without running the server;

```console
node ./src/tools/get-decoded-token.js -d <the access token or client assertion>
```

- If installing `Postman Desktop` is not possible, e.g. running this project on a Linux system, then please install `VS Code Postman Extension` and import [the collection template](./src/assets/Testing%20Node.js%20APIs.postman_collection.json) for testing the Node.js Web APIs;
- Use the [.http file template](./src/assets/template.http) to create new `.http` files.

## Contribute

- Run the following command to format code;

```console
npm run prettier
```

- Run the following command to identify spelling issues;

```console
npm run spell
```

- Run the following command to identify code issues;

```console
npm run lint
```

- Linux systems treat files and/or folders without filenames, such as file .gitignore, or folder .vscode, as hidden objects. If such files and/or folders are not shown, please enable `Show Hidden Files` option in the system.

## Limitations

Prettier sets `LF` (Unix) as the default end of line character, rather than `CRLF` (Windows) or Auto (OS dependent). There might be an issue that VS Code reports EOL rule violations. In this case, please run the following command to fix the errors by reformatting code:

```console
npm run prettier
```

The VS Code REST Client Extension is not available on Visual Studio, and Microsoft is still working to improve its `.http` file support on Visual Studio.

If running the `.http` files in Visual Studio:

- Some of the features from REST Client will not work. The `.http` files must be updated to cope with Visual Studio;
- The Visual Studio environment configuration file [http-client.env.json](./src/http-tests/http-client.env.json) must be in sync with the section `rest-client.environmentVariables` in the [VS Code settings.json file](./.vscode/settings.json).

Please refer to the following resource `Microsoft .http files` for details.

## Resources

- [Microsoft .http Files](https://learn.microsoft.com/en-us/aspnet/core/test/http-files?view=aspnetcore-9.0)
- [Node.js](https://nodejs.org/en)
- [Express.js](https://expressjs.com)
- [VS Code REST Client Extension](https://github.com/Huachao/vscode-restclient)
- [VS Code Postman Extension](https://learning.postman.com/docs/getting-started/basics/about-vs-code-extension)

## Notes

The information provided is as of 03/01/2025. Please update this document if any changes.
