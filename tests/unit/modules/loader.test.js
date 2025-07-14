/**
 * Tests for module loader
 */

const path = require("path");
const fs = require("fs/promises");

// Mock dependencies
jest.mock("fs/promises");
jest.mock("../../../lib/utils/logger.js", () => ({
  default: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    success: jest.fn(),
    debug: jest.fn(),
  },
}));

// Since ModuleLoader is ES module, we need to handle it specially
let ModuleLoader;

beforeAll(async () => {
  const module = await import("../../../lib/modules/loader.js");
  ModuleLoader = module.ModuleLoader;
});

describe("ModuleLoader", () => {
  let loader;

  beforeEach(() => {
    loader = new ModuleLoader();
    jest.clearAllMocks();
  });

  describe("constructor", () => {
    it("should initialize with empty modules and config", () => {
      expect(loader.modules).toEqual({});
      expect(loader.config).toEqual({});
      expect(loader.projectPath).toBe(process.cwd());
    });
  });

  describe("loadModules", () => {
    it("should load built-in modules", async () => {
      const mockConfig = {
        modules: {
          core: { enabled: true },
          testing: { enabled: true },
          github: { enabled: false },
        },
      };

      const modules = await loader.loadModules(mockConfig, "/test/project");

      // Core should always be loaded
      expect(modules).toHaveProperty("core");
      // Testing should be loaded since it's enabled
      expect(modules).toHaveProperty("testing");
      // GitHub should not be loaded since it's disabled
      expect(modules).not.toHaveProperty("github");
    });

    it("should handle module loading errors gracefully", async () => {
      const mockConfig = {
        modules: {
          core: { enabled: true },
          invalidModule: { enabled: true },
        },
      };

      const modules = await loader.loadModules(mockConfig, "/test/project");

      // Core should still be loaded
      expect(modules).toHaveProperty("core");
      // Invalid module should be skipped
      expect(modules).not.toHaveProperty("invalidModule");
    });

    it("should initialize loaded modules", async () => {
      const mockConfig = {
        modules: {
          core: { enabled: true },
        },
      };

      const modules = await loader.loadModules(mockConfig, "/test/project");

      // Module should have initialized properties
      expect(modules.core).toHaveProperty("rules");
      expect(modules.core).toHaveProperty("hooks");
      expect(modules.core).toHaveProperty("validators");
    });
  });

  describe("validateDependencies", () => {
    it("should validate module dependencies", () => {
      const modules = {
        core: { dependencies: [] },
        testing: { dependencies: ["core"] },
        deployment: { dependencies: ["testing", "core"] },
      };

      const result = loader.validateDependencies(modules);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should detect missing dependencies", () => {
      const modules = {
        testing: { dependencies: ["core"] },
        deployment: { dependencies: ["testing", "missing"] },
      };

      const result = loader.validateDependencies(modules);
      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(2); // Missing 'core' and 'missing'
    });

    it("should detect circular dependencies", () => {
      const modules = {
        moduleA: { dependencies: ["moduleB"] },
        moduleB: { dependencies: ["moduleC"] },
        moduleC: { dependencies: ["moduleA"] },
      };

      const result = loader.validateDependencies(modules);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("Circular"))).toBe(true);
    });
  });

  describe("getRules", () => {
    beforeEach(async () => {
      const mockConfig = {
        modules: {
          core: { enabled: true },
        },
      };
      await loader.loadModules(mockConfig, "/test/project");
    });

    it("should return all rules from loaded modules", () => {
      const rules = loader.getRules();
      expect(Array.isArray(rules)).toBe(true);
      expect(rules.length).toBeGreaterThan(0);
      expect(rules[0]).toHaveProperty("id");
      expect(rules[0]).toHaveProperty("check");
    });

    it("should filter rules by level", () => {
      const level1Rules = loader.getRules({ level: 1 });
      const allRules = loader.getRules();

      expect(level1Rules.length).toBeLessThanOrEqual(allRules.length);
      expect(level1Rules.every((r) => r.level === 1)).toBe(true);
    });

    it("should filter rules by category", () => {
      const securityRules = loader.getRules({ category: "security" });
      expect(securityRules.every((r) => r.category === "security")).toBe(true);
    });

    it("should filter rules by severity", () => {
      const errorRules = loader.getRules({ severity: "error" });
      expect(errorRules.every((r) => r.severity === "error")).toBe(true);
    });
  });

  describe("getHooks", () => {
    beforeEach(async () => {
      const mockConfig = {
        modules: {
          core: { enabled: true },
        },
      };
      await loader.loadModules(mockConfig, "/test/project");
    });

    it("should return hooks for a specific type", () => {
      const preCommitHooks = loader.getHooks("pre-commit");
      expect(Array.isArray(preCommitHooks)).toBe(true);
    });

    it("should return empty array for non-existent hook type", () => {
      const hooks = loader.getHooks("non-existent");
      expect(hooks).toEqual([]);
    });
  });

  describe("getValidators", () => {
    beforeEach(async () => {
      const mockConfig = {
        modules: {
          core: { enabled: true },
        },
      };
      await loader.loadModules(mockConfig, "/test/project");
    });

    it("should return all validators as object", () => {
      const validators = loader.getValidators();
      expect(typeof validators).toBe("object");
      expect(Object.keys(validators).length).toBeGreaterThan(0);
    });

    it("should return validator function for specific type", () => {
      const validators = loader.getValidators();
      const envValidator = validators.environment;
      expect(typeof envValidator).toBe("function");
    });
  });

  describe("reload", () => {
    it("should clear and reload modules", async () => {
      const mockConfig = {
        modules: {
          core: { enabled: true },
        },
      };

      // Initial load
      await loader.loadModules(mockConfig, "/test/project");
      const initialModules = Object.keys(loader.modules);

      // Reload with different config
      const newConfig = {
        modules: {
          core: { enabled: true },
          testing: { enabled: true },
        },
      };

      await loader.reload(newConfig);
      const reloadedModules = Object.keys(loader.modules);

      expect(reloadedModules.length).toBeGreaterThan(initialModules.length);
      expect(reloadedModules).toContain("testing");
    });
  });

  describe("getModuleInfo", () => {
    beforeEach(async () => {
      const mockConfig = {
        modules: {
          core: { enabled: true },
        },
      };
      await loader.loadModules(mockConfig, "/test/project");
    });

    it("should return module information", () => {
      const info = loader.getModuleInfo("core");
      expect(info).toHaveProperty("name", "core");
      expect(info).toHaveProperty("version");
      expect(info).toHaveProperty("description");
      expect(info).toHaveProperty("ruleCount");
      expect(info).toHaveProperty("hookCount");
    });

    it("should return null for non-existent module", () => {
      const info = loader.getModuleInfo("non-existent");
      expect(info).toBeNull();
    });
  });
});
