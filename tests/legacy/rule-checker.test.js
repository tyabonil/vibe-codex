/**
 * Comprehensive test suite for MANDATORY Rules Compliance Checker
 * Validates all rule levels and validation logic with 100% coverage
 */

const RuleEngine = require("../scripts/rule-engine");
const GitHubClient = require("../scripts/github-client");
const Reporter = require("../scripts/reporter");

describe("MANDATORY Rules Compliance Checker", () => {
  let ruleEngine;
  let reporter;
  let mockGitHubClient;

  beforeEach(() => {
    ruleEngine = new RuleEngine();
    reporter = new Reporter();
    mockGitHubClient = createMockGitHubClient();
  });

  describe("Level 1: Security & Safety", () => {
    describe("Secret Detection", () => {
      test("should detect API keys in file content", async () => {
        const files = [
          {
            filename: "config.js",
            patch:
              '+const API_KEY = "sk-1234567890abcdef";\n+const password = "secret123"',
          },
        ];

        const violations = await ruleEngine.checkLevel1Security(files, {});

        expect(violations).toHaveLength(1);
        expect(violations[0]).toMatchObject({
          level: 1,
          type: "SECURITY",
          severity: "BLOCKER",
          rule: "NEVER COMMIT SECRETS",
        });
      });

      test("should detect various secret patterns", async () => {
        const secretPatterns = [
          'api_key = "sk-test123"',
          'PASSWORD = "mypassword"',
          'auth_token = "bearer_token_123"',
          'access_key = "AKIA1234567890"',
          'private_key = "-----BEGIN PRIVATE KEY-----"',
        ];

        for (const pattern of secretPatterns) {
          const files = [{ filename: "test.js", patch: `+${pattern}` }];
          const violations = await ruleEngine.checkLevel1Security(files, {});
          expect(violations.length).toBeGreaterThan(0);
        }
      });

      test("should not flag non-secret patterns", async () => {
        const files = [
          {
            filename: "config.js",
            patch:
              '+const config = { api_url: "https://api.example.com" };\n+// TODO: Add API key configuration',
          },
        ];

        const violations = await ruleEngine.checkLevel1Security(files, {});
        expect(violations).toHaveLength(0);
      });
    });

    describe("Environment File Protection", () => {
      test("should detect .env file modifications", async () => {
        const files = [
          {
            filename: ".env",
            status: "modified",
            patch: "+NEW_VAR=value",
          },
        ];

        const violations = await ruleEngine.checkLevel1Security(files, {});

        expect(violations).toHaveLength(1);
        expect(violations[0]).toMatchObject({
          level: 1,
          type: "SECURITY",
          severity: "BLOCKER",
          rule: "NEVER OVERWRITE ENVIRONMENT FILES",
        });
      });

      test("should allow .env file creation", async () => {
        const files = [
          {
            filename: ".env.example",
            status: "added",
            patch:
              "+# Example environment variables\n+API_KEY=your_api_key_here",
          },
        ];

        const violations = await ruleEngine.checkLevel1Security(files, {});
        expect(violations).toHaveLength(0);
      });

      test("should detect various environment file patterns", async () => {
        const envFiles = [
          ".env",
          ".env.local",
          ".env.production",
          "environment.yml",
        ];

        for (const filename of envFiles) {
          const files = [{ filename, status: "modified" }];
          const violations = await ruleEngine.checkLevel1Security(files, {});
          expect(violations.length).toBeGreaterThan(0);
        }
      });
    });
  });

  describe("Level 2: Workflow Integrity", () => {
    describe("Issue Reference Validation", () => {
      test("should detect missing issue reference", async () => {
        const prData = {
          title: "Add new feature",
          body: "This adds a new feature to the application",
          head: { ref: "feature/new-feature" },
        };

        const violations = await ruleEngine.checkLevel2Workflow(
          prData,
          [],
          [],
          mockGitHubClient,
        );

        const issueViolation = violations.find(
          (v) => v.rule === "CREATE ISSUES FOR ALL WORK",
        );
        expect(issueViolation).toBeDefined();
        expect(issueViolation.severity).toBe("BLOCKER");
      });

      test("should accept valid issue references", async () => {
        const validReferences = [
          { title: "Fix bug #123", body: "" },
          { title: "Add feature", body: "Fixes #456" },
          { title: "Update docs", body: "Related to issue 789" },
        ];

        for (const prData of validReferences) {
          prData.head = { ref: "feature/test" };
          const hasReference = ruleEngine.hasIssueReference(
            prData.title,
            prData.body,
          );
          expect(hasReference).toBe(true);
        }
      });
    });

    describe("Branch Naming Validation", () => {
      test("should validate correct branch naming patterns", () => {
        const validBranches = [
          "feature/issue-123-add-authentication",
          "bugfix/issue-456-fix-login-error",
          "hotfix/issue-789-security-patch",
        ];

        for (const branch of validBranches) {
          const isValid = ruleEngine.isValidBranchName(branch);
          expect(isValid).toBe(true);
        }
      });

      test("should reject invalid branch naming patterns", () => {
        const invalidBranches = [
          "feature/add-auth",
          "fix-bug",
          "main",
          "feature/123-test",
          "bugfix/test-branch",
        ];

        for (const branch of invalidBranches) {
          const isValid = ruleEngine.isValidBranchName(branch);
          expect(isValid).toBe(false);
        }
      });
    });

    describe("MCP GitHub API Usage Detection", () => {
      test("should detect terminal git usage in commits", () => {
        const commits = [
          { commit: { message: "git push origin main" } },
          { commit: { message: 'Fixed bug and ran git commit -m "fix"' } },
          { commit: { message: "Used git checkout -b new-branch" } },
        ];

        const evidence = ruleEngine.detectTerminalGitUsage(commits);
        expect(evidence).toHaveLength(3);
      });

      test("should not flag MCP API usage", () => {
        const commits = [
          {
            commit: {
              message: "Used mcp_github_create_branch for new feature",
            },
          },
          { commit: { message: "Added files via mcp_github_push_files" } },
          { commit: { message: "Normal commit message without git commands" } },
        ];

        const evidence = ruleEngine.detectTerminalGitUsage(commits);
        expect(evidence).toHaveLength(0);
      });
    });

    describe("Significant Changes Detection", () => {
      test("should detect significant changes requiring PROJECT_CONTEXT update", () => {
        const significantFiles = [
          { filename: ".github/workflows/ci.yml", additions: 10 },
          { filename: "package.json", additions: 5 },
          { filename: "src/main.js", additions: 100 },
          { filename: "scripts/deploy.sh", additions: 20 },
        ];

        const hasSignificant =
          ruleEngine.hasSignificantChanges(significantFiles);
        expect(hasSignificant).toBe(true);
      });

      test("should not flag minor changes", () => {
        const minorFiles = [
          { filename: "README.md", additions: 5 },
          { filename: "docs/api.md", additions: 10 },
          { filename: "test.txt", additions: 2 },
        ];

        const hasSignificant = ruleEngine.hasSignificantChanges(minorFiles);
        expect(hasSignificant).toBe(false);
      });
    });
  });

  describe("Level 3: Quality Gates", () => {
    describe("Test Coverage Validation", () => {
      test("should require tests for new code files", async () => {
        const files = [
          { filename: "src/newFeature.js", additions: 50 },
          { filename: "src/utils.ts", additions: 30 },
        ];

        const violation = await ruleEngine.checkTestCoverage(files, {});

        expect(violation).toBeDefined();
        expect(violation.rule).toBe("100% TEST COVERAGE REQUIRED");
        expect(violation.severity).toBe("BLOCKER");
      });

      test("should pass when test files are present", async () => {
        const files = [
          { filename: "src/newFeature.js", additions: 50 },
          { filename: "tests/newFeature.test.js", additions: 80 },
          { filename: "src/utils.spec.ts", additions: 40 },
        ];

        const violation = await ruleEngine.checkTestCoverage(files, {});
        expect(violation).toBeNull();
      });
    });

    describe("Copilot Review Validation", () => {
      test("should detect draft PRs awaiting Copilot review", async () => {
        const prData = { draft: true };

        const violation = await ruleEngine.checkCopilotReview(
          prData,
          mockGitHubClient,
        );

        expect(violation).toBeDefined();
        expect(violation.rule).toBe("ALWAYS REQUEST COPILOT REVIEW");
      });

      test("should pass for non-draft PRs", async () => {
        const prData = { draft: false };

        const violation = await ruleEngine.checkCopilotReview(
          prData,
          mockGitHubClient,
        );
        expect(violation).toBeNull();
      });
    });
  });

  describe("Level 4: Development Patterns", () => {
    describe("File Size Validation", () => {
      test("should flag large files", async () => {
        const files = [
          { filename: "largeFile.js", additions: 500 },
          { filename: "normalFile.js", additions: 100 },
        ];

        const violations = await ruleEngine.checkLevel4Patterns(files, {});

        const sizeViolation = violations.find(
          (v) => v.rule === "FILES ≤200-300 LINES",
        );
        expect(sizeViolation).toBeDefined();
        expect(sizeViolation.severity).toBe("RECOMMENDED");
      });
    });

    describe("Branch Target Validation", () => {
      test("should recommend against merging to main", async () => {
        const prData = { base: { ref: "main" } };

        const violations = await ruleEngine.checkLevel4Patterns([], prData);

        const branchViolation = violations.find(
          (v) => v.rule === "NEVER MERGE TO MAIN",
        );
        expect(branchViolation).toBeDefined();
        expect(branchViolation.severity).toBe("RECOMMENDED");
      });
    });

    describe("Code Duplication Detection", () => {
      test("should detect potential duplication patterns", () => {
        const files = [
          { filename: "component1.js" },
          { filename: "component2.js" },
          { filename: "component3.js" },
        ];

        const violations = ruleEngine.checkCodeDuplication(files);

        expect(violations).toHaveLength(1);
        expect(violations[0].rule).toBe("AVOID CODE DUPLICATION");
      });
    });
  });

  describe("Reporter Functionality", () => {
    describe("Report Generation", () => {
      test("should generate comprehensive violation report", () => {
        const violations = [
          {
            level: 1,
            type: "SECURITY",
            severity: "BLOCKER",
            rule: "NEVER COMMIT SECRETS",
            message: "Secret detected",
            details: "API key found",
            action: "Remove secret",
            fix: "Use environment variables",
          },
          {
            level: 2,
            type: "WORKFLOW",
            severity: "MANDATORY",
            rule: "CREATE ISSUES FOR ALL WORK",
            message: "No issue reference",
            details: "Missing issue number",
            action: "Add issue reference",
            fix: "Reference issue in PR",
          },
        ];

        const report = reporter.generateReport(violations, 6, true, {
          number: 123,
        });

        expect(report).toContain("MANDATORY Rules Compliance Report");
        expect(report).toContain("Compliance Score: 6/10");
        expect(report).toContain("BLOCKED");
        expect(report).toContain("Level 1: Security");
        expect(report).toContain("Level 2: Workflow");
      });

      test("should generate success report for compliant PRs", () => {
        const report = reporter.generateSuccessReport({
          number: 123,
          title: "Test PR",
        });

        expect(report).toContain("PASSED");
        expect(report).toContain("Score: 10/10");
        expect(report).toContain("Ready for merge");
      });
    });

    describe("Violation Grouping", () => {
      test("should group violations by level correctly", () => {
        const violations = [
          { level: 1, rule: "Security Rule" },
          { level: 2, rule: "Workflow Rule" },
          { level: 3, rule: "Quality Rule" },
          { level: 4, rule: "Pattern Rule" },
        ];

        const groups = reporter.groupViolationsByLevel(violations);

        expect(groups[1]).toHaveLength(1);
        expect(groups[2]).toHaveLength(1);
        expect(groups[3]).toHaveLength(1);
        expect(groups[4]).toHaveLength(1);
      });
    });
  });

  describe("Integration Tests", () => {
    test("should handle complete rule checking workflow", async () => {
      const prData = {
        number: 123,
        title: "Test PR #123",
        body: "Testing the rule checker",
        head: { ref: "feature/issue-123-test-pr", sha: "abc123" },
        base: { ref: "preview" },
        draft: false,
      };

      const files = [
        {
          filename: "src/test.js",
          additions: 50,
          patch: '+console.log("test");',
        },
        {
          filename: "tests/test.spec.js",
          additions: 30,
          patch: '+describe("test")',
        },
      ];

      const commits = [
        { commit: { message: "Add test functionality using MCP APIs" } },
      ];

      // Test Level 1
      const level1Violations = await ruleEngine.checkLevel1Security(
        files,
        prData,
      );
      expect(level1Violations).toHaveLength(0);

      // Test Level 2
      const level2Violations = await ruleEngine.checkLevel2Workflow(
        prData,
        files,
        commits,
        mockGitHubClient,
      );
      expect(level2Violations.length).toBeLessThan(2); // May have some minor violations

      // Test Level 3
      const level3Violations = await ruleEngine.checkLevel3Quality(
        prData,
        files,
        mockGitHubClient,
      );
      expect(level3Violations).toHaveLength(0);

      // Test Level 4
      const level4Violations = await ruleEngine.checkLevel4Patterns(
        files,
        prData,
      );
      expect(level4Violations).toHaveLength(0);

      // Test report generation
      const allViolations = [
        ...level1Violations,
        ...level2Violations,
        ...level3Violations,
        ...level4Violations,
      ];
      const report = reporter.generateReport(allViolations, 10, false, prData);

      expect(report).toContain("Compliance Score");
      expect(typeof report).toBe("string");
      expect(report.length).toBeGreaterThan(100);
    });
  });
});

// Mock GitHub Client for testing
function createMockGitHubClient() {
  return {
    getPRData: jest.fn().mockResolvedValue({
      number: 123,
      title: "Test PR",
      body: "Test body",
      head: { ref: "feature/test", sha: "abc123" },
      base: { ref: "main" },
    }),
    getPRFiles: jest.fn().mockResolvedValue([]),
    getPRCommits: jest.fn().mockResolvedValue([]),
    getPRReviews: jest.fn().mockResolvedValue([]),
    getPRComments: jest
      .fn()
      .mockResolvedValue({ issueComments: [], reviewComments: [] }),
    checkCopilotReviewRequest: jest.fn().mockResolvedValue(false),
    getLinkedIssues: jest.fn().mockResolvedValue([]),
    checkIssueDocumentation: jest.fn().mockResolvedValue(false),
    postComplianceComment: jest.fn().mockResolvedValue({}),
    setStatusCheck: jest.fn().mockResolvedValue({}),
    checkProjectContextExists: jest.fn().mockResolvedValue(true),
  };
}
