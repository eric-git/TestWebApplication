"use strict";
const { Router } = require("express");
const { healthCheck } = require("./controller");

/**
 * @openapi
 * tags:
 *   - name: Management
 *     description: Operations related to management
 */
const managementRouter = Router();

/**
 * @openapi
 * /:
 *   get:
 *     description: Health check
 *     responses:
 *       "200":
 *         description: Health check result
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Healthy
 *     tags:
 *       - Management
 */
managementRouter.get("/", healthCheck);

module.exports = {
  managementRouter,
};
