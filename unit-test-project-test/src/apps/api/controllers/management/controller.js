"use strict";
/**
 * @openapi
 * tags:
 *   - name: Management
 *     description: Operations related to management
 */
const { Document } = require("yaml");
const {
  getStringByVersion,
  getVersionByNumber,
  versions,
} = require("../../shared/version");
const {
  specificationSettings,
  getJsonSpecificationsByVersion,
} = require("../../shared/specification");

/**
 * @openapi
 * components:
 *   parameters:
 *     SpecificationFormat:
 *       name: format
 *       description: The format of the specification data
 *       in: path
 *       required: true
 *       schema:
 *         type: string
 *         example: json
 *     ApiVersion:
 *       name: version
 *       description: The version of the API
 *       in: path
 *       required: false
 *       schema:
 *         type: integer
 *         minimum: 1
 *         example: 1
 *   responses:
 *     SpecificationData:
 *       description: The file contains API specification data
 *       content:
 *         text/plain:
 *           schema:
 *             type: string
 *             format: binary
 *             example: "The specification data that conforms to the format provided..."
 */
const getSpecificationByVersion = (
  { params: { format, version }, app: { mountpath } },
  response,
) => {
  const versionInfo = getVersionByNumber(version);
  const specification = getJsonSpecificationsByVersion(versionInfo, mountpath);
  const versionString = getStringByVersion(versionInfo);
  const fileName = `specification${versionString ? `.${versionString}` : ""}.${format}`;
  response.set("content-disposition", `attachment;filename=${fileName}`);
  if (format === "json") {
    response.type("json").send(JSON.stringify(specification, null, 2));
  } else {
    const document = new Document();
    document.contents = specification;
    response.type("text/yaml").send(document.toString());
  }
};

/**
 * @openapi
 * components:
 *   schemas:
 *     ApiInfo:
 *       type: array
 *       items:
 *         $ref: "#/components/schemas/ApiVersionInfo"
 *     ApiVersionInfo:
 *       type: object
 *       properties:
 *         version:
 *           type: integer
 *           example: 1
 *         sunsetDate:
 *           type: string
 *           format: date-time
 *           example: 2024-12-01T00:00:00.000Z
 *         title:
 *           type: string
 *           example: Main API operations
 *         description:
 *           type: string
 *           example: Provides main operations.
 *         urls:
 *           type: array
 *           items:
 *             $ref: "#/components/schemas/SpecUrl"
 *     SpecUrl:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: Main API operations YAML spec - V1
 *         url:
 *           type: string
 *           example: /api/management/specifications/yaml/1
 *   responses:
 *     ApiInfo:
 *       description: The API app info
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/ApiInfo"
 */
const getApiInfo = ({ route: { path }, app: { mountpath } }, response) => {
  const basePath = `${mountpath}${path}`;
  const data = versions.map((x) => {
    const versionString = getStringByVersion(x);
    const displayNamePart = versionString
      ? ` - ${versionString.toUpperCase()}`
      : "";
    return {
      version: x.version,
      sunsetDate: x.sunsetDate,
      title: x.title,
      description: x.description,
      urls: specificationSettings.supportedFormats.map((y) => {
        return {
          name: `${x.title} ${y.toUpperCase()} spec${displayNamePart}`,
          url: `${basePath}/${y}${x.version ? `/${x.version}` : ""}`,
        };
      }),
    };
  });
  response.json(data);
};

module.exports = {
  getApiInfo,
  getSpecificationByVersion,
};
