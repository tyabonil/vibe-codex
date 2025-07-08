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
    '**/test/**/*.test.js'
  ],
  setupFilesAfterEnv: ['./test/setup.js'],
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
    chalk: '<rootDir>/test/mocks/chalk.js',
    ora: '<rootDir>/test/mocks/ora.js',
    inquirer: '<rootDir>/test/mocks/inquirer.js'
  },
  transformIgnorePatterns: [
    'node_modules/(?!(chalk|ora|node-fetch)/)'
  ]
};