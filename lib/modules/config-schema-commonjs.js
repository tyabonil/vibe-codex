/**
 * CommonJS version of config schema - temporary fix
 */

const configExamples = {
  basic: {
    version: "1.0.0",
    modules: {
      core: { enabled: true },
    },
  },

  minimal: {
    version: "1.0.0",
    modules: {
      core: { enabled: true },
      "github-workflow": { enabled: true },
    },
  },

  frontend: {
    version: "1.0.0",
    modules: {
      core: { enabled: true },
      "github-workflow": { enabled: true },
      testing: { enabled: true },
      documentation: { enabled: true },
    },
  },

  fullStack: {
    version: "1.0.0",
    modules: {
      core: { enabled: true },
      "github-workflow": { enabled: true },
      testing: { enabled: true },
      deployment: { enabled: true },
      documentation: { enabled: true },
    },
  },
};

module.exports = { configExamples };
