/**
 * Project detection utilities
 */

const fs = require("fs-extra");
const path = require("path");

async function detectProjectType() {
  try {
    const pkg = await readPackageJsonSafe();
    if (!pkg) return null;

    const deps = {
      ...pkg.dependencies,
      ...pkg.devDependencies,
    };

    // Frontend frameworks
    if (deps.react || deps.vue || deps.angular || deps.svelte) {
      return "web";
    }

    // Backend frameworks
    if (
      deps.express ||
      deps.fastify ||
      deps.koa ||
      deps.hapi ||
      deps["@nestjs/core"]
    ) {
      return "api";
    }

    // Full-stack frameworks
    if (deps.next || deps.nuxt || deps.gatsby || deps.remix) {
      return "fullstack";
    }

    // Library detection
    if (pkg.main && !pkg.private) {
      return "library";
    }

    return null;
  } catch {
    return null;
  }
}

async function detectTestFramework() {
  try {
    const pkg = await readPackageJsonSafe();
    if (!pkg) return null;

    const deps = {
      ...pkg.dependencies,
      ...pkg.devDependencies,
    };

    if (deps.jest) return "jest";
    if (deps.vitest) return "vitest";
    if (deps.mocha) return "mocha";
    if (deps.ava) return "ava";
    if (deps.tape) return "tape";

    // Check test script
    if (pkg.scripts?.test) {
      const testScript = pkg.scripts.test.toLowerCase();
      if (testScript.includes("jest")) return "jest";
      if (testScript.includes("vitest")) return "vitest";
      if (testScript.includes("mocha")) return "mocha";
    }

    return null;
  } catch {
    return null;
  }
}

async function detectDeploymentPlatform() {
  // Check for platform config files
  const checks = [
    { file: "vercel.json", platform: "vercel" },
    { file: ".vercel/project.json", platform: "vercel" },
    { file: "netlify.toml", platform: "netlify" },
    { file: "_redirects", platform: "netlify" },
    { file: "app.yaml", platform: "gcp" },
    { file: "Dockerfile", platform: "docker" },
    { file: "docker-compose.yml", platform: "docker" },
    { file: ".elasticbeanstalk", platform: "aws" },
    { file: "Procfile", platform: "heroku" },
  ];

  for (const check of checks) {
    if (await fs.pathExists(check.file)) {
      return check.platform;
    }
  }

  return null;
}

async function detectPackageManager() {
  // Check for lock files
  if (await fs.pathExists("pnpm-lock.yaml")) return "pnpm";
  if (await fs.pathExists("yarn.lock")) return "yarn";
  if (await fs.pathExists("package-lock.json")) return "npm";

  // Default to npm
  return "npm";
}

async function readPackageJsonSafe() {
  try {
    const pkgPath = "package.json";
    if (await fs.pathExists(pkgPath)) {
      return await fs.readJSON(pkgPath);
    }
  } catch {
    // Ignore errors
  }
  return null;
}

module.exports = {
  detectProjectType,
  detectTestFramework,
  detectDeploymentPlatform,
  detectPackageManager,
  readPackageJsonSafe,
};
