/**
 * vibe-codex main module
 * Simple exports for programmatic usage
 */

const { init, config, uninstall } = require("./commands");
const { mainMenu } = require("./menu");

module.exports = {
  init,
  config,
  uninstall,
  mainMenu,
  version: "3.0.0",
};
