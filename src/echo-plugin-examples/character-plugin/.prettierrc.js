const {resolve} = require("path");

const baseConfig = require(resolve("..", "..", "eslint-config-sage", ".prettierrc.js"))

const config = {
  ...baseConfig
};

module.exports = config;
