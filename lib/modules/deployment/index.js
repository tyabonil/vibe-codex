/**
 * Deployment module - Deployment platform validation
 */
import { RuleModule } from "../base.js";
import fs from "fs/promises";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export class DeploymentModule extends RuleModule {
  constructor() {
    super({
      name: "deployment",
      version: "1.0.0",
      description: "Deployment configuration and platform-specific validation",
      dependencies: ["core"],
      options: {
        platforms: ["vercel", "netlify", "heroku", "aws", "docker"],
        requireDockerfile: false,
        requireBuildScript: true,
        requireHealthCheck: true,
      },
    });
  }

  async loadRules() {
    // Level 4: Deployment Rules
    this.registerRule({
      id: "DEPLOY-1",
      name: "Environment Variables Documentation",
      description: "All required environment variables must be documented",
      level: 4,
      category: "deployment",
      severity: "warning",
      check: async (context) => {
        const violations = [];

        // Check for .env.example
        try {
          const envExamplePath = path.join(context.projectPath, ".env.example");
          const envExample = await fs.readFile(envExamplePath, "utf8");
          const envVars = envExample
            .split("\n")
            .filter((line) => line.includes("=") && !line.startsWith("#"))
            .map((line) => line.split("=")[0].trim());

          // Check if all env vars are documented
          const readmePath = path.join(context.projectPath, "README.md");
          const readme = await fs.readFile(readmePath, "utf8");

          const undocumentedVars = envVars.filter(
            (varName) => !readme.includes(varName),
          );

          if (undocumentedVars.length > 0) {
            violations.push({
              message: `Environment variables not documented in README: ${undocumentedVars.join(", ")}`,
            });
          }

          // Check for sensitive var patterns
          const sensitivePatterns = ["KEY", "SECRET", "PASSWORD", "TOKEN"];
          const sensitiveMissingDescription = envVars.filter((varName) => {
            const isSensitive = sensitivePatterns.some((pattern) =>
              varName.includes(pattern),
            );
            if (isSensitive) {
              const line = envExample
                .split("\n")
                .find((l) => l.startsWith(varName));
              return !line || !line.includes("#");
            }
            return false;
          });

          if (sensitiveMissingDescription.length > 0) {
            violations.push({
              message: `Sensitive environment variables lack description: ${sensitiveMissingDescription.join(", ")}`,
            });
          }
        } catch (error) {
          // .env.example not found - handled by core module
        }

        return violations;
      },
    });

    this.registerRule({
      id: "DEPLOY-2",
      name: "Platform Configuration Files",
      description: "Deployment platform configuration must be valid",
      level: 4,
      category: "deployment",
      severity: "error",
      check: async (context) => {
        const violations = [];
        const platforms =
          context.config?.deployment?.platforms || this.options.platforms;

        // Check for platform-specific config files
        const platformConfigs = {
          vercel: ["vercel.json", "now.json"],
          netlify: ["netlify.toml", "_redirects"],
          heroku: ["Procfile", "app.json"],
          aws: ["serverless.yml", "cloudformation.yaml", "sam.yaml"],
          docker: ["Dockerfile", "docker-compose.yml"],
        };

        for (const platform of platforms) {
          if (platformConfigs[platform]) {
            const hasConfig = await Promise.all(
              platformConfigs[platform].map((config) =>
                fs
                  .access(path.join(context.projectPath, config))
                  .then(() => true)
                  .catch(() => false),
              ),
            );

            if (hasConfig.some((exists) => exists)) {
              // Platform detected, validate specific config
              const configViolations = await this.validatePlatformConfig(
                context,
                platform,
              );
              violations.push(...configViolations);
            }
          }
        }

        return violations;
      },
    });

    this.registerRule({
      id: "DEPLOY-3",
      name: "Build Configuration",
      description: "Project must have proper build configuration",
      level: 4,
      category: "deployment",
      severity: "error",
      check: async (context) => {
        if (!context.config?.deployment?.requireBuildScript) return [];

        const violations = [];

        try {
          const packageJsonPath = path.join(
            context.projectPath,
            "package.json",
          );
          const packageJson = JSON.parse(
            await fs.readFile(packageJsonPath, "utf8"),
          );

          // Check for build script
          if (!packageJson.scripts?.build) {
            violations.push({
              message: "No build script found in package.json",
            });
          }

          // Check for start script
          if (!packageJson.scripts?.start) {
            violations.push({
              message: "No start script found in package.json",
            });
          }

          // Check output directory configuration
          const buildDirs = ["dist", "build", "out", ".next", "public"];
          const hasBuildDir = await Promise.all(
            buildDirs.map((dir) =>
              fs
                .access(path.join(context.projectPath, dir))
                .then(() => true)
                .catch(() => false),
            ),
          );

          if (
            !hasBuildDir.some((exists) => exists) &&
            packageJson.scripts?.build
          ) {
            // Check if build directory is in .gitignore
            try {
              const gitignore = await fs.readFile(
                path.join(context.projectPath, ".gitignore"),
                "utf8",
              );
              const hasBuildDirIgnored = buildDirs.some((dir) =>
                gitignore.includes(dir),
              );

              if (!hasBuildDirIgnored) {
                violations.push({
                  message: "Build output directory should be in .gitignore",
                });
              }
            } catch (error) {
              // .gitignore not found
            }
          }
        } catch (error) {
          violations.push({
            message: "Unable to read package.json",
          });
        }

        return violations;
      },
    });

    this.registerRule({
      id: "DEPLOY-4",
      name: "Docker Configuration",
      description: "Docker setup must follow best practices",
      level: 4,
      category: "deployment",
      severity: "warning",
      check: async (context) => {
        if (!context.config?.deployment?.requireDockerfile) return [];

        const violations = [];
        const dockerfilePath = path.join(context.projectPath, "Dockerfile");

        try {
          const dockerfile = await fs.readFile(dockerfilePath, "utf8");
          const lines = dockerfile.split("\n");

          // Check for multi-stage builds
          const hasMultiStage = dockerfile.includes("FROM .* AS ");
          if (!hasMultiStage && lines.length > 20) {
            violations.push({
              message:
                "Consider using multi-stage Docker builds for smaller images",
            });
          }

          // Check for non-root user
          const hasUser =
            dockerfile.includes("USER ") && !dockerfile.includes("USER root");
          if (!hasUser) {
            violations.push({
              message: "Docker container should run as non-root user",
            });
          }

          // Check for .dockerignore
          try {
            await fs.access(path.join(context.projectPath, ".dockerignore"));
          } catch {
            violations.push({
              message: ".dockerignore file missing",
            });
          }

          // Check for health check
          if (!dockerfile.includes("HEALTHCHECK")) {
            violations.push({
              message: "Docker image should include HEALTHCHECK instruction",
            });
          }

          // Check for proper caching
          const copyPackageIndex = lines.findIndex(
            (line) =>
              line.includes("COPY package*.json") ||
              line.includes("COPY package.json"),
          );
          const copyAllIndex = lines.findIndex(
            (line) => line.includes("COPY . .") || line.includes("COPY ./"),
          );

          if (
            copyPackageIndex > copyAllIndex &&
            copyPackageIndex !== -1 &&
            copyAllIndex !== -1
          ) {
            violations.push({
              message:
                "Copy package.json before source code for better Docker cache utilization",
            });
          }
        } catch (error) {
          if (context.config?.deployment?.platforms?.includes("docker")) {
            violations.push({
              message: "Dockerfile not found but Docker platform is configured",
            });
          }
        }

        return violations;
      },
    });

    this.registerRule({
      id: "DEPLOY-5",
      name: "Health Check Endpoint",
      description: "Application must have health check endpoint",
      level: 4,
      category: "deployment",
      severity: "warning",
      check: async (context) => {
        if (!context.config?.deployment?.requireHealthCheck) return [];

        const violations = [];

        // Look for health check routes in common patterns
        const healthCheckPatterns = [
          /\/health/i,
          /\/healthz/i,
          /\/status/i,
          /\/ping/i,
          /_health/i,
        ];

        const sourceFiles = context.files.filter(
          (f) =>
            (f.path.endsWith(".js") || f.path.endsWith(".ts")) &&
            !f.path.includes("node_modules") &&
            !f.path.includes("test"),
        );

        const hasHealthCheck = sourceFiles.some((file) =>
          healthCheckPatterns.some((pattern) => pattern.test(file.content)),
        );

        if (!hasHealthCheck) {
          // Check for specific framework patterns
          const hasExpress = sourceFiles.some((f) =>
            f.content.includes("express()"),
          );
          const hasFastify = sourceFiles.some((f) =>
            f.content.includes("fastify("),
          );
          const hasKoa = sourceFiles.some((f) =>
            f.content.includes("new Koa()"),
          );

          if (hasExpress || hasFastify || hasKoa) {
            violations.push({
              message:
                "No health check endpoint found. Add /health or /status endpoint",
            });
          }
        }

        return violations;
      },
    });
  }

  async loadHooks() {
    // Pre-deploy hook
    this.registerHook("pre-deploy", async (context) => {
      console.log("🚀 Running deployment checks...");

      // Check for uncommitted changes
      try {
        const { stdout: status } = await execAsync("git status --porcelain");
        if (status.trim()) {
          logger.error("❌ Uncommitted changes detected!");
          logger.error("Please commit or stash changes before deploying");
          return false;
        }
      } catch (error) {
        logger.warn("Unable to check git status");
      }

      // Run build to ensure it succeeds
      try {
        const packageJsonPath = path.join(context.projectPath, "package.json");
        const packageJson = JSON.parse(
          await fs.readFile(packageJsonPath, "utf8"),
        );

        if (packageJson.scripts?.build) {
          logger.info("🔨 Running build...");
          const { stderr } = await execAsync("npm run build", {
            cwd: context.projectPath,
          });

          if (stderr && !stderr.includes("warning")) {
            console.error("❌ Build failed!");
            return false;
          }

          console.log("✅ Build successful");
        }
      } catch (error) {
        console.error("❌ Build failed:", error.message);
        return false;
      }

      return true;
    });
  }

  async loadValidators() {
    // Platform detector
    this.registerValidator("deployment-platform", async (projectPath) => {
      const detectedPlatforms = [];

      // Check for platform files
      const platformChecks = [
        { file: "vercel.json", platform: "vercel" },
        { file: "netlify.toml", platform: "netlify" },
        { file: "Procfile", platform: "heroku" },
        { file: "Dockerfile", platform: "docker" },
        { file: "serverless.yml", platform: "serverless" },
      ];

      for (const check of platformChecks) {
        try {
          await fs.access(path.join(projectPath, check.file));
          detectedPlatforms.push(check.platform);
        } catch {
          // File doesn't exist
        }
      }

      return {
        valid: true,
        platforms: detectedPlatforms,
      };
    });

    // Environment validator
    this.registerValidator("deployment-env", async (projectPath) => {
      const errors = [];

      // Check for required files
      const requiredFiles = [".env.example"];
      for (const file of requiredFiles) {
        try {
          await fs.access(path.join(projectPath, file));
        } catch {
          errors.push(`Missing ${file}`);
        }
      }

      // Check package.json engines
      try {
        const packageJsonPath = path.join(projectPath, "package.json");
        const packageJson = JSON.parse(
          await fs.readFile(packageJsonPath, "utf8"),
        );

        if (!packageJson.engines) {
          errors.push("No engines field in package.json");
        }
      } catch {
        errors.push("Unable to read package.json");
      }

      return {
        valid: errors.length === 0,
        errors,
      };
    });
  }

  // Helper method to validate platform-specific configs
  async validatePlatformConfig(context, platform) {
    const violations = [];

    switch (platform) {
      case "vercel":
        try {
          const vercelConfig = JSON.parse(
            await fs.readFile(
              path.join(context.projectPath, "vercel.json"),
              "utf8",
            ),
          );

          if (!vercelConfig.builds && !vercelConfig.functions) {
            violations.push({
              platform: "vercel",
              message: "vercel.json should specify builds or functions",
            });
          }
        } catch {
          // Invalid JSON or file not found
        }
        break;

      case "netlify":
        try {
          const netlifyToml = await fs.readFile(
            path.join(context.projectPath, "netlify.toml"),
            "utf8",
          );

          if (!netlifyToml.includes("[build]")) {
            violations.push({
              platform: "netlify",
              message: "netlify.toml should include [build] section",
            });
          }
        } catch {
          // File not found
        }
        break;

      case "heroku":
        try {
          const procfile = await fs.readFile(
            path.join(context.projectPath, "Procfile"),
            "utf8",
          );

          if (!procfile.includes("web:")) {
            violations.push({
              platform: "heroku",
              message: "Procfile should define web process",
            });
          }
        } catch {
          // File not found
        }
        break;
    }

    return violations;
  }
}

// Export singleton instance
export default new DeploymentModule();
