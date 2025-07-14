/**
 * Testing module - Test framework and coverage rules
 */
import { RuleModule } from "../base.js";
import fs from "fs/promises";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export class TestingModule extends RuleModule {
  constructor() {
    super({
      name: "testing",
      version: "1.0.0",
      description: "Test framework, coverage, and test quality rules",
      dependencies: [],
      options: {
        coverageThreshold: 80,
        testFilePattern: "**/*.{test,spec}.{js,ts,jsx,tsx}",
        sourceFilePattern: "**/src/**/*.{js,ts,jsx,tsx}",
        excludePatterns: ["**/node_modules/**", "**/build/**", "**/dist/**"],
      },
    });
  }

  async loadRules() {
    // Level 3: Testing Rules
    this.registerRule({
      id: "TEST-1",
      name: "Test Coverage Threshold",
      description: "Code coverage must meet minimum threshold",
      level: 3,
      category: "testing",
      severity: "error",
      check: async (context) => {
        const threshold =
          context.config?.testing?.coverageThreshold ||
          this.options.coverageThreshold;

        try {
          // Try to read coverage report
          const coverageReportPath = path.join(
            context.projectPath,
            "coverage",
            "coverage-summary.json",
          );
          const coverageData = JSON.parse(
            await fs.readFile(coverageReportPath, "utf8"),
          );

          const violations = [];
          const metrics = ["lines", "statements", "functions", "branches"];

          for (const metric of metrics) {
            const coverage = coverageData.total[metric].pct;
            if (coverage < threshold) {
              violations.push({
                metric,
                coverage: `${coverage}%`,
                threshold: `${threshold}%`,
                message: `${metric} coverage (${coverage}%) is below threshold (${threshold}%)`,
              });
            }
          }

          return violations;
        } catch (error) {
          // Coverage report not found
          return [
            {
              message:
                "Coverage report not found. Run tests with coverage first.",
            },
          ];
        }
      },
    });

    this.registerRule({
      id: "TEST-2",
      name: "Test Files Exist",
      description: "Every source file should have a corresponding test file",
      level: 3,
      category: "testing",
      severity: "warning",
      check: async (context) => {
        const violations = [];
        const sourceFiles = context.files.filter(
          (f) =>
            f.path.match(/\.(js|ts|jsx|tsx)$/) &&
            f.path.includes("/src/") &&
            !f.path.match(/\.(test|spec)\./) &&
            !f.path.includes("node_modules"),
        );

        for (const sourceFile of sourceFiles) {
          const testPatterns = [
            sourceFile.path.replace(/\.(js|ts|jsx|tsx)$/, ".test.$1"),
            sourceFile.path.replace(/\.(js|ts|jsx|tsx)$/, ".spec.$1"),
            sourceFile.path
              .replace("/src/", "/__tests__/")
              .replace(/\.(js|ts|jsx|tsx)$/, ".test.$1"),
            sourceFile.path
              .replace("/src/", "/test/")
              .replace(/\.(js|ts|jsx|tsx)$/, ".test.$1"),
          ];

          const hasTest = await Promise.all(
            testPatterns.map((pattern) =>
              fs
                .access(pattern)
                .then(() => true)
                .catch(() => false),
            ),
          );

          if (!hasTest.some((exists) => exists)) {
            violations.push({
              file: sourceFile.path,
              message: "No test file found for source file",
            });
          }
        }

        return violations;
      },
    });

    this.registerRule({
      id: "TEST-3",
      name: "Test Naming Convention",
      description: "Test descriptions should be clear and follow conventions",
      level: 3,
      category: "testing",
      severity: "warning",
      check: async (context) => {
        const violations = [];
        const testFiles = context.files.filter((f) =>
          f.path.match(/\.(test|spec)\.(js|ts|jsx|tsx)$/),
        );

        for (const file of testFiles) {
          const content = file.content;

          // Check for test descriptions
          const describePattern = /describe\s*\(['"`]([^'"`]+)['"`]/g;
          const itPattern = /it\s*\(['"`]([^'"`]+)['"`]/g;
          const testPattern = /test\s*\(['"`]([^'"`]+)['"`]/g;

          const descriptions = [];
          let match;

          while ((match = describePattern.exec(content)) !== null) {
            descriptions.push({
              type: "describe",
              text: match[1],
              line: content.substring(0, match.index).split("\n").length,
            });
          }

          while ((match = itPattern.exec(content)) !== null) {
            descriptions.push({
              type: "it",
              text: match[1],
              line: content.substring(0, match.index).split("\n").length,
            });
          }

          while ((match = testPattern.exec(content)) !== null) {
            descriptions.push({
              type: "test",
              text: match[1],
              line: content.substring(0, match.index).split("\n").length,
            });
          }

          for (const desc of descriptions) {
            // Check for poor descriptions
            if (
              desc.text.length < 5 ||
              desc.text === "test" ||
              desc.text === "works"
            ) {
              violations.push({
                file: file.path,
                line: desc.line,
                message: `Test description "${desc.text}" is too vague`,
              });
            }

            // Check it/test descriptions start with "should" or describe behavior
            if (
              desc.type === "it" &&
              !desc.text.match(
                /^(should|returns|throws|handles|validates|creates|updates|deletes)/i,
              )
            ) {
              violations.push({
                file: file.path,
                line: desc.line,
                message: `Test description should describe behavior: "${desc.text}"`,
              });
            }
          }
        }

        return violations;
      },
    });

    this.registerRule({
      id: "TEST-4",
      name: "No Skipped Tests",
      description: "Tests should not be skipped without justification",
      level: 3,
      category: "testing",
      severity: "warning",
      check: async (context) => {
        const violations = [];
        const testFiles = context.files.filter((f) =>
          f.path.match(/\.(test|spec)\.(js|ts|jsx|tsx)$/),
        );

        for (const file of testFiles) {
          const content = file.content;
          const lines = content.split("\n");

          lines.forEach((line, index) => {
            // Check for skipped tests
            if (
              line.match(/\.(skip|only)\s*\(/) ||
              line.match(/(describe|it|test)\.skip/)
            ) {
              violations.push({
                file: file.path,
                line: index + 1,
                message: "Skipped test found without justification",
              });
            }
          });
        }

        return violations;
      },
    });

    this.registerRule({
      id: "TEST-5",
      name: "Test File Structure",
      description: "Test files should follow consistent structure",
      level: 3,
      category: "testing",
      severity: "info",
      check: async (context) => {
        const violations = [];
        const testFiles = context.files.filter((f) =>
          f.path.match(/\.(test|spec)\.(js|ts|jsx|tsx)$/),
        );

        for (const file of testFiles) {
          const content = file.content;

          // Check for proper imports
          if (!content.includes("import") && !content.includes("require")) {
            violations.push({
              file: file.path,
              message: "Test file missing imports",
            });
          }

          // Check for at least one describe block
          if (!content.includes("describe(")) {
            violations.push({
              file: file.path,
              message: "Test file should use describe blocks for organization",
            });
          }

          // Check for setup/teardown when needed
          const hasAsyncOperations =
            content.includes("async") || content.includes("await");
          const hasSetup = content.match(
            /(beforeEach|beforeAll|afterEach|afterAll)/,
          );

          if (hasAsyncOperations && !hasSetup) {
            violations.push({
              file: file.path,
              message:
                "Consider using setup/teardown hooks for async operations",
            });
          }
        }

        return violations;
      },
    });
  }

  async loadHooks() {
    // Pre-push hook to ensure tests pass
    this.registerHook("pre-push", async (context) => {
      console.log("🧪 Running tests before push...");

      try {
        // Detect test runner
        const packageJsonPath = path.join(context.projectPath, "package.json");
        const packageJson = JSON.parse(
          await fs.readFile(packageJsonPath, "utf8"),
        );

        let testCommand = "npm test";
        if (packageJson.scripts?.test) {
          testCommand = "npm test";
        } else if (packageJson.devDependencies?.jest) {
          testCommand = "npx jest";
        } else if (packageJson.devDependencies?.mocha) {
          testCommand = "npx mocha";
        } else if (packageJson.devDependencies?.vitest) {
          testCommand = "npx vitest run";
        }

        const { stdout, stderr } = await execAsync(testCommand, {
          cwd: context.projectPath,
        });

        if (stderr && !stdout.includes("passing")) {
          console.error("❌ Tests failed!");
          console.error(stderr);
          return false;
        }

        console.log("✅ All tests passed");
        return true;
      } catch (error) {
        console.error("❌ Test execution failed:", error.message);
        return false;
      }
    });
  }

  async loadValidators() {
    // Test framework validator
    this.registerValidator("test-framework", async (projectPath) => {
      try {
        const packageJsonPath = path.join(projectPath, "package.json");
        const packageJson = JSON.parse(
          await fs.readFile(packageJsonPath, "utf8"),
        );

        const testFrameworks = ["jest", "mocha", "vitest", "ava", "tape"];
        const hasTestFramework = testFrameworks.some(
          (framework) =>
            packageJson.devDependencies?.[framework] ||
            packageJson.dependencies?.[framework],
        );

        if (!hasTestFramework && !packageJson.scripts?.test) {
          return {
            valid: false,
            message: "No test framework configured",
          };
        }

        return { valid: true };
      } catch (error) {
        return {
          valid: false,
          message: "Unable to detect test framework",
        };
      }
    });

    // Coverage configuration validator
    this.registerValidator("coverage-config", async (projectPath) => {
      const coverageConfigs = [
        "jest.config.js",
        "jest.config.ts",
        ".nycrc",
        ".nycrc.json",
        "vitest.config.js",
        "vitest.config.ts",
      ];

      try {
        const hasConfig = await Promise.all(
          coverageConfigs.map((config) =>
            fs
              .access(path.join(projectPath, config))
              .then(() => true)
              .catch(() => false),
          ),
        );

        if (!hasConfig.some((exists) => exists)) {
          // Check package.json for coverage config
          const packageJsonPath = path.join(projectPath, "package.json");
          const packageJson = JSON.parse(
            await fs.readFile(packageJsonPath, "utf8"),
          );

          if (!packageJson.jest?.collectCoverage && !packageJson.nyc) {
            return {
              valid: false,
              message: "No coverage configuration found",
            };
          }
        }

        return { valid: true };
      } catch (error) {
        return {
          valid: false,
          message: "Unable to validate coverage configuration",
        };
      }
    });
  }
}

// Export singleton instance
export default new TestingModule();
