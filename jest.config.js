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
  testMatch: [
    '**/test/**/*.test.js',
    '**/tests/**/*.test.js'
  ],
  setupFilesAfterEnv: ['./tests/setup.js'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/lib/$1',
    // Mock ESM modules
    chalk: '<rootDir>/tests/mocks/chalk.js',
    ora: '<rootDir>/tests/mocks/ora.js',
    inquirer: '<rootDir>/tests/mocks/inquirer.js'
  },
  transformIgnorePatterns: [
    'node_modules/(?!(chalk|ora|node-fetch)/)'
  ],
  // Support for dynamic imports
  testEnvironmentOptions: {
    experimental: { vm: { modules: true } }
  }
};