/**
 * Configuration file creator
 */

const fs = require('fs-extra');
const path = require('path');

async function createConfiguration(options) {
  const config = {
    version: require('../../package.json').version,
    projectType: options.projectType,
    modules: {
      core: {
        enabled: true,
        gitHooks: true,
        commitMessageValidation: true,
        securityChecks: true
      }
    },
    createdAt: new Date().toISOString(),
    lastModified: new Date().toISOString()
  };
  
  // Add selected modules with their configurations
  for (const moduleName of options.selectedModules) {
    const moduleConfig = options.moduleConfigs?.[moduleName] || {};
    
    config.modules[moduleName] = {
      enabled: true,
      ...moduleConfig
    };
  }
  
  // Add project-specific defaults
  applyProjectDefaults(config, options.projectType);
  
  // Save configuration file
  await fs.writeJSON('.vibe-codex.json', config, { spaces: 2 });
  
  // Create .vibe-codexignore file
  await createIgnoreFile();
  
  // Create PROJECT_CONTEXT.md if it doesn't exist
  await createProjectContext();
  
  return config;
}

function applyProjectDefaults(config, projectType) {
  const defaults = {
    web: {
      modules: {
        testing: {
          coverage: { threshold: 80 },
          patterns: ['**/*.test.{js,jsx,ts,tsx}', '**/*.spec.{js,jsx,ts,tsx}']
        },
        quality: {
          eslint: true,
          prettier: true
        }
      }
    },
    api: {
      modules: {
        testing: {
          coverage: { threshold: 85 },
          patterns: ['**/*.test.js', '**/*.spec.js', 'test/**/*.js']
        },
        documentation: {
          apiDocs: true,
          openapi: true
        }
      }
    },
    fullstack: {
      modules: {
        testing: {
          coverage: { threshold: 80 },
          e2e: true
        },
        deployment: {
          environments: ['development', 'staging', 'production']
        }
      }
    },
    library: {
      modules: {
        testing: {
          coverage: { threshold: 90 }
        },
        documentation: {
          typedoc: true,
          examples: true
        }
      }
    }
  };
  
  const projectDefaults = defaults[projectType];
  if (projectDefaults) {
    // Deep merge defaults with existing config
    mergeDeep(config, projectDefaults);
  }
}

function mergeDeep(target, source) {
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      if (!target[key]) target[key] = {};
      mergeDeep(target[key], source[key]);
    } else {
      if (!target[key]) target[key] = source[key];
    }
  }
}

async function createIgnoreFile() {
  const ignoreContent = `# vibe-codex ignore file
# Add patterns for files/directories to exclude from validation

# Dependencies
node_modules/
vendor/

# Build outputs
dist/
build/
out/
.next/
.nuxt/

# IDE files
.vscode/
.idea/
*.swp
*.swo

# OS files
.DS_Store
Thumbs.db

# Test coverage
coverage/
.nyc_output/

# Environment files
.env*
!.env.example

# Temporary files
*.tmp
*.temp
.cache/
`;

  const ignorePath = '.vibe-codexignore';
  if (!await fs.pathExists(ignorePath)) {
    await fs.writeFile(ignorePath, ignoreContent);
  }
}

async function createProjectContext() {
  const contextPath = 'PROJECT_CONTEXT.md';
  
  if (await fs.pathExists(contextPath)) {
    return; // Don't overwrite existing file
  }
  
  const template = `# Project Context

## Overview
[Brief description of your project]

## Architecture
[High-level architecture description]

## Key Components
- Component 1: [Description]
- Component 2: [Description]

## Development Workflow
1. [Step 1]
2. [Step 2]

## Testing Strategy
[Describe your testing approach]

## Deployment
[Deployment process and environments]

## Team Conventions
- [Convention 1]
- [Convention 2]

---
*This file is required by vibe-codex. Keep it updated as your project evolves.*
`;

  await fs.writeFile(contextPath, template);
}

module.exports = {
  createConfiguration
};