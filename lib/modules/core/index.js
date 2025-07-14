/**
 * Core module - Essential rules that are always required
 */
import { RuleModule } from "../base.js";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import logger from "../../utils/logger.js";
import { calculateSimilarity, checkForSecrets } from "./utils.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class CoreModule extends RuleModule {
  constructor() {
    super({
      name: "core",
      version: "1.0.0",
      description: "Essential security, workflow, and git rules",
      dependencies: [],
      options: {},
    });
  }

  async loadRules() {
    // Level 1: Security Rules
    this.registerRule({
      id: "SEC-1",
      name: "No Secrets in Code",
      description: "Never commit secrets, API keys, passwords, or credentials",
      level: 1,
      category: "security",
      severity: "error",
      check: async (context) => {
        const violations = [];
        for (const file of context.files) {
          const secrets = checkForSecrets(file.content);
          for (const secret of secrets) {
            violations.push({
              file: file.path,
              line: secret.line,
              message: "Potential secret detected",
            });
          }
        }
        return violations;
      },
    });

    this.registerRule({
      id: "SEC-2",
      name: "Environment File Protection",
      description: "Never overwrite environment files",
      level: 1,
      category: "security",
      severity: "error",
      check: async (context) => {
        const violations = [];
        const envFiles = [".env", ".env.local", ".env.production"];

        for (const file of context.modifiedFiles) {
          if (envFiles.includes(path.basename(file.path))) {
            violations.push({
              file: file.path,
              message: "Environment files should not be modified directly",
            });
          }
        }
        return violations;
      },
    });

    this.registerRule({
      id: "SEC-3",
      name: "Environment Example File",
      description: "Always create .env.example with documented variables",
      level: 1,
      category: "security",
      severity: "warning",
      check: async (context) => {
        const hasEnvFile = context.files.some(
          (f) => f.path.endsWith(".env") || f.path.endsWith(".env.local"),
        );
        const hasEnvExample = context.files.some((f) =>
          f.path.endsWith(".env.example"),
        );

        if (hasEnvFile && !hasEnvExample) {
          return [
            {
              message: "Missing .env.example file",
            },
          ];
        }
        return [];
      },
    });

    // Level 2: Workflow Rules
    this.registerRule({
      id: "WF-1",
      name: "Issue-First Development",
      description: "Every code change must start with a GitHub issue",
      level: 2,
      category: "workflow",
      severity: "error",
      check: async (context) => {
        if (!context.issue) {
          return [
            {
              message: "No associated GitHub issue found",
            },
          ];
        }
        return [];
      },
    });

    this.registerRule({
      id: "WF-2",
      name: "Branch Naming Convention",
      description:
        "Branch must reference issue: feature/issue-{number}-{description}",
      level: 2,
      category: "workflow",
      severity: "error",
      check: async (context) => {
        const branchPattern = /^(feature|bugfix|hotfix)\/issue-\d+-[\w-]+$/;
        if (!branchPattern.test(context.branch)) {
          return [
            {
              branch: context.branch,
              message:
                "Branch name must follow pattern: {type}/issue-{number}-{description}",
            },
          ];
        }
        return [];
      },
    });

    this.registerRule({
      id: "WF-3",
      name: "Commit Message Format",
      description: "Commits must be clear and reference issues",
      level: 2,
      category: "workflow",
      severity: "warning",
      check: async (context) => {
        const violations = [];
        const pattern =
          /^(feat|fix|docs|style|refactor|test|chore)(\(.+\))?:\s.+/;

        for (const commit of context.commits) {
          if (!pattern.test(commit.message)) {
            violations.push({
              commit: commit.sha.substring(0, 7),
              message: "Commit message should follow conventional format",
            });
          }
        }
        return violations;
      },
    });

    this.registerRule({
      id: "WF-4",
      name: "PR Title References Issue",
      description: "PR title must reference the issue number",
      level: 2,
      category: "workflow",
      severity: "error",
      check: async (context) => {
        if (!context.pr) return [];

        const hasIssueRef = /#\d+/.test(context.pr.title);
        if (!hasIssueRef) {
          return [
            {
              message: "PR title must reference issue number (e.g., #123)",
            },
          ];
        }
        return [];
      },
    });

    this.registerRule({
      id: "WF-5",
      name: "Token Efficiency",
      description: "Consolidate redundant content for LLM efficiency",
      level: 2,
      category: "workflow",
      severity: "warning",
      check: async (context) => {
        const violations = [];
        const contentMap = new Map();

        // Check for duplicate content
        for (const file of context.files) {
          const content = file.content.toLowerCase().replace(/\s+/g, " ");
          for (const [otherFile, otherContent] of contentMap) {
            const similarity = calculateSimilarity(content, otherContent);
            if (similarity > 0.25 && file.path !== otherFile) {
              violations.push({
                files: [file.path, otherFile],
                similarity: Math.round(similarity * 100),
                message: `Files have ${Math.round(similarity * 100)}% similar content`,
              });
            }
          }
          contentMap.set(file.path, content);
        }
        return violations;
      },
    });
  }

  async loadHooks() {
    // Pre-commit hook
    this.registerHook("pre-commit", async (context) => {
      logger.info("🔍 Running security pre-commit checks...");

      // Check for secrets
      const secretsRule = this.rules.find((r) => r.id === "SEC-1");
      if (secretsRule) {
        const violations = await secretsRule.check(context);
        if (violations.length > 0) {
          logger.error("❌ Security violations found:");
          violations.forEach((v) =>
            logger.error(`  - ${v.file}: ${v.message}`),
          );
          return false;
        }
      }

      logger.success("✅ No secrets detected");
      return true;
    });

    // Commit-msg hook
    this.registerHook("commit-msg", async (context) => {
      const pattern =
        /^(feat|fix|docs|style|refactor|test|chore)(\(.+\))?:\s.+/;
      if (!pattern.test(context.message)) {
        logger.error("❌ Invalid commit message format!");
        logger.error("Expected format: <type>(<scope>): <subject>");
        logger.error(
          "Valid types: feat, fix, docs, style, refactor, test, chore",
        );
        return false;
      }
      return true;
    });
  }

  async loadValidators() {
    // Environment validator
    this.registerValidator("environment", async (projectPath) => {
      const envPath = path.join(projectPath, ".env");
      const envExamplePath = path.join(projectPath, ".env.example");

      try {
        await fs.access(envPath);
        // .env exists, check for .env.example
        try {
          await fs.access(envExamplePath);
          return { valid: true };
        } catch {
          return {
            valid: false,
            message: ".env file exists but .env.example is missing",
          };
        }
      } catch {
        // .env doesn't exist, which is fine
        return { valid: true };
      }
    });

    // Git workflow validator
    this.registerValidator("git-workflow", async (context) => {
      const errors = [];

      // Check if in a git repository
      try {
        await fs.access(path.join(context.projectPath, ".git"));
      } catch {
        errors.push("Not a git repository");
      }

      return {
        valid: errors.length === 0,
        errors,
      };
    });
  }
}

// Export singleton instance
export default new CoreModule();
