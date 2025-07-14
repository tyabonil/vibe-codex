/**
 * Module loader and manager
 */
import coreModule from "./core/index.js";
import testingModule from "./testing/index.js";
import githubModule from "./github/index.js";
import deploymentModule from "./deployment/index.js";
import documentationModule from "./documentation/index.js";
import githubWorkflowModule from "./github-workflow/index.js";
import patternsModule from "./patterns/index.js";
import { ModuleLoader } from "./loader.js";

// Create module loader instance
const moduleLoader = new ModuleLoader();

// Register all available modules
moduleLoader.registerModule(coreModule);
moduleLoader.registerModule(testingModule);
moduleLoader.registerModule(githubModule);
moduleLoader.registerModule(deploymentModule);
moduleLoader.registerModule(documentationModule);
moduleLoader.registerModule(githubWorkflowModule);
moduleLoader.registerModule(patternsModule);

export { moduleLoader };

// Export individual modules for direct access
export {
  coreModule,
  testingModule,
  githubModule,
  deploymentModule,
  documentationModule,
  githubWorkflowModule,
  patternsModule,
};

// Default export for backward compatibility
export default {
  // Load all available modules
  available: {
    core: coreModule,
    testing: testingModule,
    github: githubModule,
    deployment: deploymentModule,
    documentation: documentationModule,
    "github-workflow": githubWorkflowModule,
    patterns: patternsModule,
  },

  // Load modules based on configuration
  async load(config) {
    const enabledModules = [];

    for (const [name, moduleConfig] of Object.entries(config.modules || {})) {
      if (moduleConfig.enabled !== false) {
        enabledModules.push(name);
      }
    }

    return moduleLoader.loadModules(enabledModules, config);
  },

  // Get module loader instance
  getLoader() {
    return moduleLoader;
  },
};
