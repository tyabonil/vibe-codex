/**
 * Tests for project detection utilities
 */

const fs = require("fs-extra");
const {
  detectProjectType,
  detectTestFramework,
  detectDeploymentPlatform,
  detectPackageManager,
} = require("../../../lib/utils/detector");

jest.mock("fs-extra");

describe("detector utilities", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("detectProjectType", () => {
    test("should detect React web project", async () => {
      fs.pathExists.mockResolvedValue(true);
      fs.readJSON.mockResolvedValue({
        dependencies: { react: "^18.0.0", "react-dom": "^18.0.0" },
      });

      const result = await detectProjectType();
      expect(result).toBe("web");
    });

    test("should detect Express API project", async () => {
      fs.pathExists.mockResolvedValue(true);
      fs.readJSON.mockResolvedValue({
        dependencies: { express: "^4.18.0" },
      });

      const result = await detectProjectType();
      expect(result).toBe("api");
    });

    test("should detect Next.js fullstack project", async () => {
      fs.pathExists.mockResolvedValue(true);
      fs.readJSON.mockResolvedValue({
        dependencies: { next: "^13.0.0" },
      });

      const result = await detectProjectType();
      expect(result).toBe("fullstack");
    });

    test("should detect npm library", async () => {
      fs.pathExists.mockResolvedValue(true);
      fs.readJSON.mockResolvedValue({
        main: "index.js",
        private: false,
      });

      const result = await detectProjectType();
      expect(result).toBe("library");
    });

    test("should return null for unknown project type", async () => {
      fs.pathExists.mockResolvedValue(true);
      fs.readJSON.mockResolvedValue({});

      const result = await detectProjectType();
      expect(result).toBeNull();
    });

    test("should handle missing package.json", async () => {
      fs.pathExists.mockResolvedValue(false);

      const result = await detectProjectType();
      expect(result).toBeNull();
    });
  });

  describe("detectTestFramework", () => {
    test("should detect Jest", async () => {
      fs.pathExists.mockResolvedValue(true);
      fs.readJSON.mockResolvedValue({
        devDependencies: { jest: "^29.0.0" },
      });

      const result = await detectTestFramework();
      expect(result).toBe("jest");
    });

    test("should detect Vitest", async () => {
      fs.pathExists.mockResolvedValue(true);
      fs.readJSON.mockResolvedValue({
        devDependencies: { vitest: "^0.34.0" },
      });

      const result = await detectTestFramework();
      expect(result).toBe("vitest");
    });

    test("should detect from test script", async () => {
      fs.pathExists.mockResolvedValue(true);
      fs.readJSON.mockResolvedValue({
        scripts: { test: "mocha tests/**/*.js" },
      });

      const result = await detectTestFramework();
      expect(result).toBe("mocha");
    });

    test("should return null if no test framework found", async () => {
      fs.pathExists.mockResolvedValue(true);
      fs.readJSON.mockResolvedValue({});

      const result = await detectTestFramework();
      expect(result).toBeNull();
    });
  });

  describe("detectDeploymentPlatform", () => {
    test("should detect Vercel", async () => {
      fs.pathExists.mockImplementation(async (file) => {
        return file === "vercel.json";
      });

      const result = await detectDeploymentPlatform();
      expect(result).toBe("vercel");
    });

    test("should detect Netlify", async () => {
      fs.pathExists.mockImplementation(async (file) => {
        return file === "netlify.toml";
      });

      const result = await detectDeploymentPlatform();
      expect(result).toBe("netlify");
    });

    test("should detect Docker", async () => {
      fs.pathExists.mockImplementation(async (file) => {
        return file === "Dockerfile";
      });

      const result = await detectDeploymentPlatform();
      expect(result).toBe("docker");
    });

    test("should return null if no platform detected", async () => {
      fs.pathExists.mockResolvedValue(false);

      const result = await detectDeploymentPlatform();
      expect(result).toBeNull();
    });
  });

  describe("detectPackageManager", () => {
    test("should detect pnpm", async () => {
      fs.pathExists.mockImplementation(async (file) => {
        return file === "pnpm-lock.yaml";
      });

      const result = await detectPackageManager();
      expect(result).toBe("pnpm");
    });

    test("should detect yarn", async () => {
      fs.pathExists.mockImplementation(async (file) => {
        return file === "yarn.lock";
      });

      const result = await detectPackageManager();
      expect(result).toBe("yarn");
    });

    test("should detect npm", async () => {
      fs.pathExists.mockImplementation(async (file) => {
        return file === "package-lock.json";
      });

      const result = await detectPackageManager();
      expect(result).toBe("npm");
    });

    test("should default to npm", async () => {
      fs.pathExists.mockResolvedValue(false);

      const result = await detectPackageManager();
      expect(result).toBe("npm");
    });
  });
});
