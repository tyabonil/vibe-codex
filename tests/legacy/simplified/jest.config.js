/**
 * Jest configuration for simplified vibe-codex tests
 */

module.exports = {
  testEnvironment: "node",
  testMatch: ["**/test/simplified/**/*.test.js"],
  collectCoverageFrom: ["lib/**/*.js", "!lib/**/*.test.js"],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
