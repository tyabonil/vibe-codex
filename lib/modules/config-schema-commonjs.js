/**
 * CommonJS version of config schema - temporary fix
 */

const configExamples = {
  basic: {
    version: "1.0.0",
    modules: {
      core: { enabled: true }
    }
  },
  
  fullStack: {
    version: "1.0.0", 
    modules: {
      core: { enabled: true },
      testing: { enabled: true },
      github: { enabled: true }
    }
  }
};

module.exports = { configExamples };