/**
 * Configuration creator and manager
 */

const fs = require('fs-extra');
const path = require('path');
const Joi = require('joi');
const { detectFramework, detectPackageManager, detectTestingFramework, detectCICD } = require('./detector');

/**
 * Create a new configuration
 */
function createConfig(options = {}) {
  const {
    projectType = 'custom',
    modules = ['core'],
    enforcementLevel = 'error'
  } = options;
  
  const config = {
    version: '2.0.0',
    projectType,
    modules: {},
    enforcementLevel,
    createdAt: new Date().toISOString(),
    lastModified: new Date().toISOString()
  };
  
  // Always enable core module
  config.modules.core = { enabled: true };
  
  // Enable selected modules
  modules.forEach(moduleName => {
    if (moduleName !== 'core') {
      config.modules[moduleName] = { enabled: true };
    }
  });
  
  return config;
}

/**
 * Create auto-detected configuration
 */
async function createAutoConfig() {
  const framework = await detectFramework();
  const packageManager = await detectPackageManager();
  const testingFramework = await detectTestingFramework();
  const cicd = await detectCICD();
  
  const config = {
    version: '2.0.0',
    projectType: framework ? 'web' : 'custom',
    framework,
    packageManager,
    modules: {
      core: { enabled: true },
      testing: {
        enabled: !!testingFramework,
        framework: testingFramework
      },
      github: {
        enabled: cicd.includes('github-actions')
      }
    },
    ci: cicd,
    testing: {
      framework: testingFramework
    },
    createdAt: new Date().toISOString(),
    lastModified: new Date().toISOString()
  };
  
  return config;
}

/**
 * Merge configurations
 */
function mergeConfigs(existing, updates) {
  const merged = JSON.parse(JSON.stringify(existing)); // Deep clone
  
  // Update version
  merged.version = updates.version || existing.version;
  
  // Merge modules
  if (updates.modules) {
    Object.entries(updates.modules).forEach(([name, moduleConfig]) => {
      if (merged.modules[name]) {
        merged.modules[name] = { ...merged.modules[name], ...moduleConfig };
      } else {
        merged.modules[name] = moduleConfig;
      }
    });
  }
  
  // Update other properties
  Object.entries(updates).forEach(([key, value]) => {
    if (key !== 'modules' && key !== 'createdAt') {
      merged[key] = value;
    }
  });
  
  merged.lastModified = new Date().toISOString();
  
  return merged;
}

/**
 * Get project template
 */
function getTemplate(projectType) {
  const templates = {
    web: {
      modules: ['core', 'testing', 'github', 'documentation', 'patterns'],
      hooks: {
        'pre-commit': true,
        'pre-push': true
      },
      testing: {
        coverage: {
          threshold: 80
        }
      }
    },
    api: {
      modules: ['core', 'testing', 'deployment', 'documentation'],
      hooks: {
        'pre-commit': true,
        'pre-push': true
      },
      testing: {
        coverage: {
          threshold: 85
        }
      }
    },
    fullstack: {
      modules: ['core', 'testing', 'github', 'deployment', 'documentation', 'patterns'],
      hooks: {
        'pre-commit': true,
        'pre-push': true,
        'post-merge': true
      },
      testing: {
        coverage: {
          threshold: 80
        }
      },
      monorepo: {
        packages: ['frontend', 'backend', 'shared']
      }
    },
    library: {
      modules: ['core', 'testing', 'documentation'],
      hooks: {
        'pre-commit': true,
        'pre-push': true
      },
      testing: {
        coverage: {
          threshold: 90
        }
      },
      publishing: {
        registry: 'https://registry.npmjs.org'
      }
    }
  };
  
  return templates[projectType] || templates.web;
}

/**
 * Configure testing module based on framework
 */
function configureTestingModule(framework = 'jest') {
  const configs = {
    jest: {
      enabled: true,
      framework: 'jest',
      coverage: {
        tool: 'jest',
        threshold: 80,
        reporters: ['text', 'lcov', 'html']
      },
      scripts: {
        test: 'jest',
        'test:watch': 'jest --watch',
        'test:coverage': 'jest --coverage'
      }
    },
    vitest: {
      enabled: true,
      framework: 'vitest',
      coverage: {
        tool: 'c8',
        threshold: 80,
        reporters: ['text', 'lcov', 'html']
      },
      scripts: {
        test: 'vitest',
        'test:watch': 'vitest --watch',
        'test:coverage': 'vitest --coverage'
      }
    },
    mocha: {
      enabled: true,
      framework: 'mocha',
      coverage: {
        tool: 'nyc',
        threshold: 80,
        reporters: ['text', 'lcov', 'html']
      },
      scripts: {
        test: 'mocha',
        'test:watch': 'mocha --watch',
        'test:coverage': 'nyc mocha'
      }
    }
  };
  
  return configs[framework] || configs.jest;
}

/**
 * Configure GitHub module
 */
function configureGitHubModule(options = {}) {
  return {
    enabled: true,
    actions: {
      enabled: true
    },
    workflows: options.workflows || ['ci'],
    pr: {
      autoAssign: true,
      requireApproval: true,
      deleteAfterMerge: true
    },
    issues: {
      templates: true,
      autoLabel: true
    }
  };
}

/**
 * Configure deployment module
 */
function configureDeploymentModule(options = {}) {
  const { platform = 'vercel' } = options;
  
  const configs = {
    vercel: {
      enabled: true,
      platform: 'vercel',
      checks: ['build', 'preview'],
      environments: ['preview', 'production'],
      hooks: {
        'pre-deploy': 'npm run build && npm test',
        'post-deploy': 'npm run smoke-test'
      }
    },
    netlify: {
      enabled: true,
      platform: 'netlify',
      checks: ['build', 'functions'],
      environments: ['preview', 'production'],
      hooks: {
        'pre-deploy': 'npm run build',
        'post-deploy': 'npm run lighthouse'
      }
    },
    aws: {
      enabled: true,
      platform: 'aws',
      services: ['s3', 'cloudfront', 'lambda'],
      environments: ['dev', 'staging', 'production'],
      hooks: {
        'pre-deploy': 'npm run build && npm run test:integration',
        'post-deploy': 'npm run validate-deployment'
      }
    }
  };
  
  return configs[platform] || configs.vercel;
}

/**
 * Validate configuration
 */
function validateConfig(config) {
  const schema = Joi.object({
    version: Joi.string().required(),
    projectType: Joi.string().valid('web', 'api', 'fullstack', 'library', 'custom'),
    modules: Joi.object().pattern(
      Joi.string(),
      Joi.object({
        enabled: Joi.boolean().required()
      }).unknown(true)
    ).required(),
    enforcementLevel: Joi.string().valid('error', 'warning', 'info'),
    createdAt: Joi.string().isoDate(),
    lastModified: Joi.string().isoDate()
  }).unknown(true);
  
  const { error } = schema.validate(config);
  
  if (error) {
    return {
      valid: false,
      errors: error.details.map(d => d.message)
    };
  }
  
  return {
    valid: true,
    errors: []
  };
}

/**
 * Get suggestions for configuration improvements
 */
function getSuggestions(config) {
  const suggestions = [];
  
  // Check version
  if (config.version === '1.0.0') {
    suggestions.push('Update to version 2.0.0 for latest features');
  }
  
  // Check test coverage
  if (config.modules.testing?.coverage?.threshold < 70) {
    suggestions.push('Consider increasing test coverage threshold to at least 70%');
  }
  
  // Check enabled modules
  if (!config.modules.testing?.enabled) {
    suggestions.push('Enable testing module for better code quality');
  }
  
  if (!config.modules.documentation?.enabled) {
    suggestions.push('Enable documentation module to maintain docs');
  }
  
  // Check for security
  if (!config.modules.github?.enabled && !config.modules['github-workflow']?.enabled) {
    suggestions.push('Enable GitHub integration for automated security checks');
  }
  
  return suggestions;
}

/**
 * Create environment-specific configuration
 */
function createEnvironmentConfig(environment) {
  const configs = {
    development: {
      strictMode: false,
      hooks: {
        'pre-commit': true,
        'pre-push': true
      },
      modules: {
        core: { enabled: true },
        testing: { enabled: true },
        patterns: { enabled: true }
      }
    },
    production: {
      strictMode: true,
      enforcementLevel: 'error',
      modules: {
        core: { enabled: true },
        testing: {
          enabled: true,
          coverage: { threshold: 80 }
        },
        deployment: { enabled: true },
        documentation: { enabled: true }
      }
    },
    ci: {
      ci: true,
      reporting: {
        format: ['junit', 'json']
      },
      failFast: true,
      modules: {
        core: { enabled: true },
        testing: { enabled: true },
        github: { enabled: true }
      }
    }
  };
  
  return configs[environment] || configs.development;
}

module.exports = {
  createConfig,
  createAutoConfig,
  mergeConfigs,
  getTemplate,
  configureTestingModule,
  configureGitHubModule,
  configureDeploymentModule,
  validateConfig,
  getSuggestions,
  createEnvironmentConfig
};