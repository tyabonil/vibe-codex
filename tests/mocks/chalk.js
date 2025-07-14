/**
 * Mock for chalk module
 */

const chalk = {
  blue: jest.fn((str) => str),
  green: jest.fn((str) => str),
  red: jest.fn((str) => str),
  yellow: jest.fn((str) => str),
  gray: jest.fn((str) => str),
  cyan: jest.fn((str) => str),
  bold: jest.fn((str) => str),
  white: jest.fn((str) => str),
};

// Make chainable
Object.keys(chalk).forEach((key) => {
  chalk[key].mockReturnValue(chalk);
});

module.exports = chalk;
