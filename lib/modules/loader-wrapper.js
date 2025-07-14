/**
 * CommonJS wrapper for ES module loader
 */

// Store for module loader state
let moduleState = {
  loaded: [],
  rules: [],
};

module.exports = {
  initialize: async (projectPath) => {
    // For now, just return a no-op to avoid the ES module error
    moduleState.loaded = ["core", "github-workflow"];
    return {
      loadModules: async () => [],
      getModule: () => null,
      getAllModules: () => [],
    };
  },

  getLoadedModules: () => moduleState.loaded,

  getAllRules: () => {
    // Return some basic rules for validation
    return [
      {
        id: "security-no-secrets",
        name: "No Secrets in Code",
        level: 1,
        module: "core",
        severity: "error",
        check: async (context) => [],
      },
      {
        id: "git-branch-protection",
        name: "Branch Protection",
        level: 1,
        module: "core",
        severity: "warning",
        check: async (context) => [],
      },
    ];
  },
};
