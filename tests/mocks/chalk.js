/**
 * Mock for chalk module
 */

// Create chainable mock functions
const createChainableMock = () => {
  const mock = jest.fn((str) => str);
  
  // Add all color methods to the mock function
  ['blue', 'green', 'red', 'yellow', 'gray', 'cyan', 'bold', 'white'].forEach(color => {
    mock[color] = jest.fn((str) => str);
  });
  
  return mock;
};

const chalk = {
  blue: createChainableMock(),
  green: createChainableMock(),
  red: createChainableMock(),
  yellow: createChainableMock(),
  gray: createChainableMock(),
  cyan: createChainableMock(),
  bold: createChainableMock(),
  white: createChainableMock(),
};

// Make chainable - each method returns a function that can be called with a string
Object.keys(chalk).forEach((key) => {
  const originalFn = chalk[key];
  chalk[key] = jest.fn((str) => {
    if (typeof str === 'string') {
      return str;
    }
    // Return a function that returns the string for chaining
    return (s) => s;
  });
  
  // Add nested methods for chaining
  Object.keys(chalk).forEach((nestedKey) => {
    chalk[key][nestedKey] = jest.fn((s) => s);
  });
});

module.exports = chalk;
