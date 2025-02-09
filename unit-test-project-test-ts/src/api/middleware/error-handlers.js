"use strict";
// eslint-disable-next-line no-unused-vars
const notFoundHandler = (_, response, next) => {
  response.status(404).json({ error_message: "Not found." });
};

// eslint-disable-next-line no-unused-vars
const serverErrorHandler = (error, _, response, next) => {
  response.status(response.statusCode || 500).json({
    error_message: error.message,
    stack_trace: error.stack,
  });
};

module.exports = {
  notFoundHandler,
  serverErrorHandler,
};
