/**
 * Mock for ora module
 */

const ora = jest.fn(() => {
  const spinner = {
    start: jest.fn().mockReturnThis(),
    succeed: jest.fn().mockReturnThis(),
    fail: jest.fn().mockReturnThis(),
    text: "",
    stop: jest.fn().mockReturnThis(),
  };

  return spinner;
});

module.exports = ora;
