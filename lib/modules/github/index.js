/**
 * GitHub module - GitHub workflow and integration rules
 */
import { RuleModule } from "../base.js";
import fs from "fs/promises";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export class GitHubModule extends RuleModule {
  constructor() {
    super({
      name: "github",
      version: "1.0.0",
      description: "GitHub-specific workflow, template, and integration rules",
      dependencies: ["core"],
      options: {
        requirePRTemplate: true,
        requireIssueTemplates: true,
        requireCodeOwners: false,
        requireContributing: true,
      },
    });
  }

  async loadRules() {
    // Level 4: GitHub Integration Rules
    this.registerRule({
      id: "GH-1",
      name: "Pull Request Template",
      description: "Repository must have a pull request template",
      level: 4,
      category: "github",
      severity: "warning",
      check: async (context) => {
        if (!context.config?.github?.requirePRTemplate) return [];

        const prTemplates = [
          ".github/pull_request_template.md",
          ".github/PULL_REQUEST_TEMPLATE.md",
          ".github/PULL_REQUEST_TEMPLATE/pull_request_template.md",
          "docs/pull_request_template.md",
          "PULL_REQUEST_TEMPLATE.md",
        ];

        const hasTemplate = await Promise.all(
          prTemplates.map((template) =>
            fs
              .access(path.join(context.projectPath, template))
              .then(() => true)
              .catch(() => false),
          ),
        );

        if (!hasTemplate.some((exists) => exists)) {
          return [
            {
              message:
                "No pull request template found. Create .github/pull_request_template.md",
            },
          ];
        }

        return [];
      },
      fix: async (context) => {
        const templatePath = path.join(
          context.projectPath,
          ".github",
          "pull_request_template.md",
        );
        const templateContent = `## Description
Please include a summary of the changes and which issue is fixed.

Fixes #(issue)

## Type of change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Checklist
- [ ] My code follows the style guidelines of this project
- [ ] I have performed a self-review of my code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
`;

        await fs.mkdir(path.dirname(templatePath), { recursive: true });
        await fs.writeFile(templatePath, templateContent);
        return true;
      },
    });

    this.registerRule({
      id: "GH-2",
      name: "Issue Templates",
      description: "Repository must have issue templates",
      level: 4,
      category: "github",
      severity: "warning",
      check: async (context) => {
        if (!context.config?.github?.requireIssueTemplates) return [];

        const issueTemplateDir = path.join(
          context.projectPath,
          ".github",
          "ISSUE_TEMPLATE",
        );

        try {
          const files = await fs.readdir(issueTemplateDir);
          const templates = files.filter(
            (f) => f.endsWith(".md") || f.endsWith(".yml"),
          );

          if (templates.length === 0) {
            return [
              {
                message:
                  "Issue template directory exists but contains no templates",
              },
            ];
          }

          // Check for basic template types
          const hasFeatureRequest = templates.some((t) =>
            t.toLowerCase().includes("feature"),
          );
          const hasBugReport = templates.some((t) =>
            t.toLowerCase().includes("bug"),
          );

          const missing = [];
          if (!hasFeatureRequest) missing.push("feature request");
          if (!hasBugReport) missing.push("bug report");

          if (missing.length > 0) {
            return [
              {
                message: `Missing issue templates for: ${missing.join(", ")}`,
              },
            ];
          }

          return [];
        } catch (error) {
          return [
            {
              message:
                "No issue templates found. Create .github/ISSUE_TEMPLATE/ directory with templates",
            },
          ];
        }
      },
      fix: async (context) => {
        const templateDir = path.join(
          context.projectPath,
          ".github",
          "ISSUE_TEMPLATE",
        );
        await fs.mkdir(templateDir, { recursive: true });

        // Create bug report template
        const bugTemplate = `name: Bug report
about: Create a report to help us improve
title: '[BUG] '
labels: bug
assignees: ''
---

**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**
A clear and concise description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment:**
 - OS: [e.g. iOS]
 - Browser [e.g. chrome, safari]
 - Version [e.g. 22]

**Additional context**
Add any other context about the problem here.
`;

        // Create feature request template
        const featureTemplate = `name: Feature request
about: Suggest an idea for this project
title: '[FEATURE] '
labels: enhancement
assignees: ''
---

**Is your feature request related to a problem? Please describe.**
A clear and concise description of what the problem is. Ex. I'm always frustrated when [...]

**Describe the solution you'd like**
A clear and concise description of what you want to happen.

**Describe alternatives you've considered**
A clear and concise description of any alternative solutions or features you've considered.

**Additional context**
Add any other context or screenshots about the feature request here.
`;

        await fs.writeFile(
          path.join(templateDir, "bug_report.md"),
          bugTemplate,
        );
        await fs.writeFile(
          path.join(templateDir, "feature_request.md"),
          featureTemplate,
        );
        return true;
      },
    });

    this.registerRule({
      id: "GH-3",
      name: "CODEOWNERS File",
      description: "Repository should have a CODEOWNERS file",
      level: 4,
      category: "github",
      severity: "info",
      check: async (context) => {
        if (!context.config?.github?.requireCodeOwners) return [];

        const codeownersLocations = [
          ".github/CODEOWNERS",
          "CODEOWNERS",
          "docs/CODEOWNERS",
        ];

        const hasCodeowners = await Promise.all(
          codeownersLocations.map((location) =>
            fs
              .access(path.join(context.projectPath, location))
              .then(() => true)
              .catch(() => false),
          ),
        );

        if (!hasCodeowners.some((exists) => exists)) {
          return [
            {
              message:
                "No CODEOWNERS file found for automatic review assignments",
            },
          ];
        }

        return [];
      },
    });

    this.registerRule({
      id: "GH-4",
      name: "Contributing Guidelines",
      description: "Repository must have contributing guidelines",
      level: 4,
      category: "github",
      severity: "warning",
      check: async (context) => {
        if (!context.config?.github?.requireContributing) return [];

        const contributingFiles = [
          "CONTRIBUTING.md",
          ".github/CONTRIBUTING.md",
          "docs/CONTRIBUTING.md",
        ];

        const hasContributing = await Promise.all(
          contributingFiles.map((file) =>
            fs
              .access(path.join(context.projectPath, file))
              .then(() => true)
              .catch(() => false),
          ),
        );

        if (!hasContributing.some((exists) => exists)) {
          return [
            {
              message: "No CONTRIBUTING.md file found",
            },
          ];
        }

        return [];
      },
      fix: async (context) => {
        const contributingPath = path.join(
          context.projectPath,
          "CONTRIBUTING.md",
        );
        const contributingContent = `# Contributing to ${path.basename(context.projectPath)}

We love your input! We want to make contributing to this project as easy and transparent as possible.

## Development Process

1. Fork the repo and create your branch from \`main\`.
2. If you've added code that should be tested, add tests.
3. If you've changed APIs, update the documentation.
4. Ensure the test suite passes.
5. Make sure your code lints.
6. Issue that pull request!

## Any contributions you make will be under the project's license

When you submit code changes, your submissions are understood to be under the same license that covers the project.

## Report bugs using GitHub Issues

We use GitHub issues to track public bugs. Report a bug by opening a new issue.

## License

By contributing, you agree that your contributions will be licensed under the project's license.
`;

        await fs.writeFile(contributingPath, contributingContent);
        return true;
      },
    });

    this.registerRule({
      id: "GH-5",
      name: "GitHub Actions Workflows",
      description: "Repository should have CI/CD workflows",
      level: 4,
      category: "github",
      severity: "info",
      check: async (context) => {
        const workflowsDir = path.join(
          context.projectPath,
          ".github",
          "workflows",
        );

        try {
          const files = await fs.readdir(workflowsDir);
          const workflows = files.filter(
            (f) => f.endsWith(".yml") || f.endsWith(".yaml"),
          );

          if (workflows.length === 0) {
            return [
              {
                message: "No GitHub Actions workflows found",
              },
            ];
          }

          // Check for common workflow types
          const workflowContent = await Promise.all(
            workflows.map(async (workflow) => {
              const content = await fs.readFile(
                path.join(workflowsDir, workflow),
                "utf8",
              );
              return { name: workflow, content };
            }),
          );

          const hasTests = workflowContent.some(
            (w) =>
              w.content.includes("test") ||
              w.content.includes("jest") ||
              w.content.includes("mocha"),
          );
          const hasLint = workflowContent.some(
            (w) => w.content.includes("lint") || w.content.includes("eslint"),
          );

          const missing = [];
          if (!hasTests) missing.push("testing");
          if (!hasLint) missing.push("linting");

          if (missing.length > 0) {
            return [
              {
                message: `Consider adding workflows for: ${missing.join(", ")}`,
              },
            ];
          }

          return [];
        } catch (error) {
          return [
            {
              message: "No .github/workflows directory found",
            },
          ];
        }
      },
    });

    this.registerRule({
      id: "GH-6",
      name: "Security Policy",
      description: "Repository should have a security policy",
      level: 4,
      category: "github",
      severity: "info",
      check: async (context) => {
        const securityFiles = [
          "SECURITY.md",
          ".github/SECURITY.md",
          "docs/SECURITY.md",
        ];

        const hasSecurity = await Promise.all(
          securityFiles.map((file) =>
            fs
              .access(path.join(context.projectPath, file))
              .then(() => true)
              .catch(() => false),
          ),
        );

        if (!hasSecurity.some((exists) => exists)) {
          return [
            {
              message: "No SECURITY.md file found for vulnerability reporting",
            },
          ];
        }

        return [];
      },
    });
  }

  async loadHooks() {
    // Pre-push hook to validate GitHub requirements
    this.registerHook("pre-push", async (context) => {
      logger.info("🐙 Validating GitHub requirements...");

      // Check if pushing to main/master
      try {
        const { stdout: currentBranch } = await execAsync(
          "git rev-parse --abbrev-ref HEAD",
        );
        const branch = currentBranch.trim();

        if (branch === "main" || branch === "master") {
          logger.error(
            "❌ Direct pushes to main/master branch are not allowed",
          );
          logger.error(
            "Please create a feature branch and submit a pull request",
          );
          return false;
        }
      } catch (error) {
        logger.warn("Unable to check current branch");
      }

      return true;
    });
  }

  async loadValidators() {
    // GitHub repository validator
    this.registerValidator("github-repo", async (projectPath) => {
      try {
        // Check if it's a git repository
        await fs.access(path.join(projectPath, ".git"));

        // Check for GitHub remote
        const { stdout } = await execAsync("git remote -v", {
          cwd: projectPath,
        });
        const hasGitHubRemote = stdout.includes("github.com");

        if (!hasGitHubRemote) {
          return {
            valid: false,
            message: "No GitHub remote found",
          };
        }

        return { valid: true };
      } catch (error) {
        return {
          valid: false,
          message: "Not a GitHub repository",
        };
      }
    });

    // GitHub CLI validator
    this.registerValidator("github-cli", async () => {
      try {
        const { stdout } = await execAsync("gh --version");
        if (stdout.includes("gh version")) {
          return { valid: true };
        }
      } catch (error) {
        return {
          valid: false,
          message: "GitHub CLI (gh) not installed or not in PATH",
        };
      }
    });
  }
}

// Export singleton instance
export default new GitHubModule();
