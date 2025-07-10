/**
 * Jest setup file
 */

// Suppress console output during tests
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn()
};

// Reset mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
});