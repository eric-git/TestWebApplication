"use strict";
const { getSpecificationByVersion, getApiInfo } = require("./controller");
const { specificationByVersionValidator } = require("./validator");

const setupRouter = (router, prefix) => {
  /**
   * @openapi
   * /management/specifications/{format}/{version}:
   *   get:
   *     description: Get the access token for the specified environment
   *     parameters:
   *       - $ref: "#/components/parameters/SpecificationFormat"
   *       - $ref: "#/components/parameters/ApiVersion"
   *     responses:
   *       "200":
   *         $ref: "#/components/responses/SpecificationData"
   *       "400":
   *         $ref: "#/components/responses/BadRequest"
   *     tags:
   *       - Management
   */
  router.get(
    `${prefix}/specifications/:format{/:version}`,
    specificationByVersionValidator,
    getSpecificationByVersion,
  );

  /**
   * @openapi
   * /management/specifications:
   *   get:
   *     description: Get the API app info
   *     responses:
   *       "200":
   *         $ref: "#/components/responses/ApiInfo"
   *     tags:
   *       - Management
   */
  router.get(`${prefix}/specifications`, getApiInfo);
};

module.exports = {
  setupRouter,
};
