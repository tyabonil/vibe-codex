/**
 * Fix for inquirer import issues
 */

const inquirerModule = require("inquirer");
module.exports = inquirerModule.default || inquirerModule;
