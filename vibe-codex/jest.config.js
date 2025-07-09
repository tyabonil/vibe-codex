/**
 * Jest configuration for vibe-codex
 */

module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'lib/**/*.js',
    '!lib/**/*.test.js',
    '!lib/**/__tests__/**'
  ],
  roots: ['<rootDir>'],
  testMatch: [
    '<rootDir>/test/**/*.test.js'
  ],
  setupFilesAfterEnv: ['./test/setup.js'],
  coverageThreshold: {
    global: {
      branches: 0,
      functions: 0,
      lines: 0,
      statements: 0
    }
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/lib/$1',
    // Mock ESM modules
    chalk: '<rootDir>/test/mocks/chalk.js',
    ora: '<rootDir>/test/mocks/ora.js',
    inquirer: '<rootDir>/test/mocks/inquirer.js'
  },
  transformIgnorePatterns: [
    'node_modules/(?!(chalk|ora|node-fetch)/)'
  ],
  // Support for dynamic imports
  testEnvironmentOptions: {
    experimental: { vm: { modules: true } }
  }
};