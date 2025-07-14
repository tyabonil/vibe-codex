/**
 * Tests for documentation module
 */

const fs = require("fs-extra");
const path = require("path");
const logger = require("../../../../lib/utils/logger");

// Mock dependencies
jest.mock("fs-extra");
jest.mock("../../../../lib/utils/logger", () => ({
  log: jest.fn(),
  debug: jest.fn(),
  error: jest.fn(),
}));

// Mock base module
jest.mock("../../../../lib/modules/base", () => {
  return class BaseModule {
    constructor(name) {
      this.name = name;
      this.rules = [];
      this.hooks = {};
      this.validators = {};
    }
    initialize = jest.fn();
    loadRules = jest.fn();
    loadHooks = jest.fn();
    loadValidators = jest.fn();
    validateRule = jest.fn().mockResolvedValue({ valid: true });
    runHook = jest.fn().mockResolvedValue(true);
  };
});

const DocumentationModule = require("../../../../lib/modules/documentation");

describe("Documentation Module", () => {
  let module;

  beforeEach(() => {
    jest.clearAllMocks();
    module = new DocumentationModule();

    fs.pathExists.mockResolvedValue(false);
    fs.readFile = jest.fn().mockResolvedValue("");
  });

  test("should extend BaseModule", () => {
    expect(module.name).toBe("documentation");
    expect(module.initialize).toBeDefined();
  });

  test("should validate README exists", async () => {
    fs.pathExists.mockResolvedValue(true);
    fs.readFile.mockResolvedValue("# Project Title\n\nDescription");

    const result = await module.validateReadme();

    expect(result.valid).toBe(true);
  });

  test("should detect missing README", async () => {
    fs.pathExists.mockResolvedValue(false);

    const result = await module.validateReadme();

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("README.md not found");
  });

  test("should check README sections", async () => {
    fs.pathExists.mockResolvedValue(true);
    fs.readFile.mockResolvedValue(`
# Project Name
## Installation
## Usage
## Contributing
## License
    `);

    const result = await module.checkReadmeSections();

    expect(result.valid).toBe(true);
  });

  test("should detect missing README sections", async () => {
    fs.pathExists.mockResolvedValue(true);
    fs.readFile.mockResolvedValue("# Project Name\n\nShort description");

    const result = await module.checkReadmeSections();

    expect(result.valid).toBe(false);
    expect(result.warnings).toContain(
      "Missing recommended section: Installation",
    );
  });

  test("should validate JSDoc comments", async () => {
    const files = [
      {
        path: "src/utils.js",
        content: `
/**
 * Calculates sum of two numbers
 * @param {number} a - First number
 * @param {number} b - Second number
 * @returns {number} Sum of a and b
 */
function add(a, b) {
  return a + b;
}
      `,
      },
    ];

    const result = await module.validateJSDoc(files);

    expect(result.valid).toBe(true);
  });

  test("should detect missing JSDoc", async () => {
    const files = [
      {
        path: "src/utils.js",
        content: `
function complexCalculation(data, options) {
  // Complex logic
  return result;
}
      `,
      },
    ];

    const result = await module.validateJSDoc(files);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      "Missing JSDoc for function: complexCalculation",
    );
  });

  test("should check API documentation", async () => {
    fs.pathExists.mockResolvedValue(true);
    fs.readdir = jest.fn().mockResolvedValue(["api.md", "endpoints.md"]);

    const result = await module.checkApiDocumentation();

    expect(result.valid).toBe(true);
  });

  test("should validate changelog format", async () => {
    fs.pathExists.mockResolvedValue(true);
    fs.readFile.mockResolvedValue(`
# Changelog

## [1.0.0] - 2023-01-01
### Added
- Initial release
    `);

    const result = await module.validateChangelog();

    expect(result.valid).toBe(true);
  });

  test("should check inline code comments", async () => {
    const files = [
      {
        path: "src/complex.js",
        content: `
// This function handles user authentication
function authenticate(user, password) {
  // Validate input
  if (!user || !password) return false;
  
  // Check credentials
  return checkDatabase(user, password);
}
      `,
      },
    ];

    const result = await module.checkInlineComments(files);

    expect(result.valid).toBe(true);
  });

  test("should detect uncommented complex code", async () => {
    const files = [
      {
        path: "src/complex.js",
        content: `
function complexAlgorithm(data) {
  const x = data.map(d => d * 2).filter(d => d > 10);
  return x.reduce((a, b) => a + b, 0) / x.length;
}
      `,
      },
    ];

    const result = await module.checkInlineComments(files);

    expect(result.warnings).toContain(
      "Complex code without comments in complexAlgorithm",
    );
  });

  test("should validate example files", async () => {
    fs.pathExists.mockResolvedValue(true);
    fs.readdir = jest.fn().mockResolvedValue(["basic.js", "advanced.js"]);

    const result = await module.checkExamples();

    expect(result.valid).toBe(true);
  });

  test("should check documentation freshness", async () => {
    const files = [
      {
        path: "README.md",
        mtime: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // 1 year old
      },
    ];

    const result = await module.checkDocumentationFreshness(files);

    expect(result.warnings).toContain(
      "Documentation may be outdated: README.md",
    );
  });
});
