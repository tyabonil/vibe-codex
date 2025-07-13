/**
 * CommonJS wrapper for ES module loader
 */

module.exports = {
  initialize: async (projectPath) => {
    // For now, just return a no-op to avoid the ES module error
    return {
      loadModules: async () => [],
      getModule: () => null,
      getAllModules: () => []
    };
  }
};