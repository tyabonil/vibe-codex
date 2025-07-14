/**
 * Tests for patterns module
 */

const fs = require("fs-extra");
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

const PatternsModule = require("../../../../lib/modules/patterns");

describe("Patterns Module", () => {
  let module;

  beforeEach(() => {
    jest.clearAllMocks();
    module = new PatternsModule();
  });

  test("should extend BaseModule", () => {
    expect(module.name).toBe("patterns");
    expect(module.initialize).toBeDefined();
  });

  test("should check file naming conventions", async () => {
    const files = [
      { path: "src/components/MyComponent.js" },
      { path: "src/utils/helper-functions.js" },
    ];

    const result = await module.checkNamingConventions(files);
    expect(result.valid).toBe(true);
  });

  test("should detect invalid file names", async () => {
    const files = [
      { path: "src/components/my component.js" }, // space in filename
      { path: "src/utils/Helper-Functions.js" }, // inconsistent casing
    ];

    const result = await module.checkNamingConventions(files);
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(2);
  });

  test("should check import organization", async () => {
    const fileContent = `
import React from 'react';
import { useState } from 'react';

import { helper } from '../utils';
import styles from './styles.css';

import { Component } from './Component';
    `;

    const result = await module.checkImportOrganization(fileContent);
    expect(result.valid).toBe(true);
  });

  test("should detect disorganized imports", async () => {
    const fileContent = `
import { Component } from './Component';
import React from 'react';
import styles from './styles.css';
import { useState } from 'react';
import { helper } from '../utils';
    `;

    const result = await module.checkImportOrganization(fileContent);
    expect(result.valid).toBe(false);
    expect(result.suggestions).toContain("Group and sort imports");
  });

  test("should check code consistency", async () => {
    const files = [
      {
        path: "src/a.js",
        content: "const foo = () => {};\nexport default foo;",
      },
      {
        path: "src/b.js",
        content: "const bar = () => {};\nexport default bar;",
      },
    ];

    const result = await module.checkCodeConsistency(files);
    expect(result.valid).toBe(true);
  });

  test("should detect inconsistent patterns", async () => {
    const files = [
      { path: "src/a.js", content: "export default function foo() {}" },
      {
        path: "src/b.js",
        content: "const bar = () => {};\nexport default bar;",
      },
    ];

    const result = await module.checkCodeConsistency(files);
    expect(result.warnings).toContain("Inconsistent export patterns detected");
  });

  test("should check documentation patterns", async () => {
    const fileContent = `
/**
 * Calculates the sum of two numbers
 * @param {number} a - First number
 * @param {number} b - Second number
 * @returns {number} The sum
 */
function add(a, b) {
  return a + b;
}
    `;

    const result = await module.checkDocumentation(fileContent);
    expect(result.valid).toBe(true);
  });

  test("should detect missing documentation", async () => {
    const fileContent = `
function complexCalculation(data, options) {
  // Complex logic here
  return result;
}
    `;

    const result = await module.checkDocumentation(fileContent);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      "Missing documentation for public function",
    );
  });

  test("should validate folder structure", async () => {
    const files = [
      { path: "src/components/Button/Button.js" },
      { path: "src/components/Button/Button.test.js" },
      { path: "src/components/Button/index.js" },
    ];

    const result = await module.checkFolderStructure(files);
    expect(result.valid).toBe(true);
  });

  test("should detect structure violations", async () => {
    const files = [
      { path: "components/Button.js" }, // missing src
      { path: "src/Button.test.js" }, // test not co-located
    ];

    const result = await module.checkFolderStructure(files);
    expect(result.suggestions).toContain(
      "Consider organizing components in dedicated folders",
    );
  });
});
