# API Reference

## Programmatic Usage

vibe-codex can be used programmatically in your Node.js applications.

## Installation

```bash
npm install vibe-codex
```

## Basic Usage

```javascript
const vibeCodex = require('vibe-codex');

// Initialize vibe-codex
await vibeCodex.init({
  type: 'fullstack',
  skipGitHooks: false
});

// Validate project
const result = await vibeCodex.validate();
console.log(`Found ${result.violations.length} violations`);

// Fix violations
if (!result.valid) {
  const fixed = await vibeCodex.fix(result.violations);
  console.log(`Fixed ${fixed.count} violations`);
}
```

## API Methods

### `init(options)`

Initialize vibe-codex in a project.

#### Parameters
- `options` (Object)
  - `type` (String): Project type - 'frontend', 'backend', 'fullstack', 'mobile'
  - `skipGitHooks` (Boolean): Skip git hooks installation
  - `skipGithubActions` (Boolean): Skip GitHub Actions setup
  - `config` (Object): Custom configuration
  - `force` (Boolean): Overwrite existing configuration

#### Returns
- `Promise<InitResult>`: Initialization result

#### Example
```javascript
const result = await vibeCodex.init({
  type: 'fullstack',
  config: {
    modules: {
      testing: {
        framework: 'jest',
        coverage: { threshold: 90 }
      }
    }
  }
});
```

### `validate(options)`

Run validation checks on the project.

#### Parameters
- `options` (Object)
  - `modules` (Array<String>): Specific modules to validate
  - `level` (Number): Minimum violation level (1-5)
  - `hook` (String): Run validation for specific git hook
  - `files` (Array<String>): Specific files to validate

#### Returns
- `Promise<ValidationResult>`: Validation results

#### Example
```javascript
const result = await vibeCodex.validate({
  modules: ['core', 'testing'],
  level: 3
});

if (!result.valid) {
  result.violations.forEach(v => {
    console.log(`${v.level}: ${v.message} in ${v.file}`);
  });
}
```

### `fix(violations, options)`

Attempt to auto-fix violations.

#### Parameters
- `violations` (Array<Violation>): Violations to fix
- `options` (Object)
  - `dryRun` (Boolean): Preview fixes without applying
  - `interactive` (Boolean): Prompt for each fix

#### Returns
- `Promise<FixResult>`: Fix results

#### Example
```javascript
const validation = await vibeCodex.validate();
if (!validation.valid) {
  const fixes = await vibeCodex.fix(validation.violations, {
    dryRun: true
  });
  
  console.log(`Can fix ${fixes.fixable} of ${fixes.total} violations`);
}
```

### `config.get(key)`

Get configuration value.

#### Parameters
- `key` (String): Configuration key (dot notation)

#### Returns
- `any`: Configuration value

#### Example
```javascript
const testingEnabled = await vibeCodex.config.get('modules.testing.enabled');
const coverage = await vibeCodex.config.get('modules.testing.coverage.threshold');
```

### `config.set(key, value)`

Set configuration value.

#### Parameters
- `key` (String): Configuration key (dot notation)
- `value` (any): Value to set

#### Returns
- `Promise<void>`

#### Example
```javascript
await vibeCodex.config.set('modules.testing.coverage.threshold', 90);
await vibeCodex.config.set('modules.github.features.autoMerge', true);
```

### `config.reset()`

Reset configuration to defaults.

#### Returns
- `Promise<void>`

#### Example
```javascript
await vibeCodex.config.reset();
```

### `update(options)`

Update vibe-codex rules and modules.

#### Parameters
- `options` (Object)
  - `check` (Boolean): Check for updates only
  - `modules` (Boolean): Update modules only
  - `rules` (Boolean): Update rules only

#### Returns
- `Promise<UpdateResult>`: Update results

#### Example
```javascript
const updates = await vibeCodex.update({ check: true });
if (updates.available) {
  console.log(`Updates available: ${updates.version}`);
  await vibeCodex.update();
}
```

### `doctor(options)`

Run diagnostics on vibe-codex installation.

#### Parameters
- `options` (Object)
  - `fix` (Boolean): Attempt to fix issues
  - `verbose` (Boolean): Detailed output

#### Returns
- `Promise<DiagnosticResult>`: Diagnostic results

#### Example
```javascript
const diagnostics = await vibeCodex.doctor({ fix: true });
diagnostics.issues.forEach(issue => {
  console.log(`${issue.severity}: ${issue.message}`);
});
```

## Types

### `ValidationResult`
```typescript
interface ValidationResult {
  valid: boolean;
  violations: Violation[];
  summary: {
    total: number;
    byLevel: Record<number, number>;
    byModule: Record<string, number>;
  };
  duration: number;
}
```

### `Violation`
```typescript
interface Violation {
  level: number;          // 1-5 (1 is most severe)
  module: string;         // Module that generated violation
  rule: string;          // Rule identifier
  message: string;       // Human-readable message
  file?: string;         // File path if applicable
  line?: number;         // Line number if applicable
  column?: number;       // Column number if applicable
  fixable: boolean;      // Can be auto-fixed
  fix?: () => Promise<void>; // Fix function
}
```

### `InitResult`
```typescript
interface InitResult {
  success: boolean;
  installedModules: string[];
  gitHooksInstalled: boolean;
  githubActionsInstalled: boolean;
  configPath: string;
}
```

### `FixResult`
```typescript
interface FixResult {
  total: number;
  fixable: number;
  fixed: number;
  failed: number;
  errors: Error[];
}
```

## Events

vibe-codex emits events during operation:

```javascript
const vibeCodex = require('vibe-codex');

vibeCodex.on('validation:start', (modules) => {
  console.log(`Validating modules: ${modules.join(', ')}`);
});

vibeCodex.on('validation:complete', (result) => {
  console.log(`Validation complete: ${result.valid ? 'PASSED' : 'FAILED'}`);
});

vibeCodex.on('violation:found', (violation) => {
  console.log(`Found: ${violation.message}`);
});

vibeCodex.on('fix:applied', (fix) => {
  console.log(`Fixed: ${fix.rule} in ${fix.file}`);
});
```

### Available Events
- `validation:start` - Validation begins
- `validation:complete` - Validation ends
- `violation:found` - Violation detected
- `fix:applied` - Fix successfully applied
- `module:load` - Module loaded
- `module:error` - Module error occurred
- `config:change` - Configuration changed

## Custom Modules

Create custom modules for domain-specific rules:

```javascript
const vibeCodex = require('vibe-codex');

// Define custom module
const customModule = {
  name: 'my-rules',
  description: 'Custom business rules',
  
  async validate(context) {
    const violations = [];
    
    // Check for specific patterns
    for (const file of context.files) {
      if (file.path.includes('api/') && !file.content.includes('auth')) {
        violations.push({
          level: 2,
          module: 'my-rules',
          rule: 'api-auth-required',
          message: 'API endpoints must include authentication',
          file: file.path,
          fixable: false
        });
      }
    }
    
    return {
      valid: violations.length === 0,
      violations
    };
  }
};

// Register module
vibeCodex.registerModule(customModule);

// Use in validation
const result = await vibeCodex.validate({
  modules: ['core', 'my-rules']
});
```

## Integration Examples

### Jest Integration
```javascript
// jest.setup.js
beforeAll(async () => {
  const vibeCodex = require('vibe-codex');
  const result = await vibeCodex.validate({
    modules: ['testing'],
    level: 3
  });
  
  if (!result.valid) {
    throw new Error('Code quality checks failed');
  }
});
```

### Webpack Plugin
```javascript
// webpack.config.js
const VibeCodexPlugin = require('vibe-codex/webpack');

module.exports = {
  plugins: [
    new VibeCodexPlugin({
      modules: ['core', 'testing'],
      failOnError: true
    })
  ]
};
```

### Express Middleware
```javascript
// middleware/vibe-codex.js
const vibeCodex = require('vibe-codex');

module.exports = async (req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    const result = await vibeCodex.validate({
      files: [req.file?.path].filter(Boolean)
    });
    
    if (!result.valid) {
      return res.status(400).json({
        error: 'Code quality issues',
        violations: result.violations
      });
    }
  }
  next();
};
```

## Error Handling

```javascript
const vibeCodex = require('vibe-codex');

try {
  const result = await vibeCodex.validate();
} catch (error) {
  if (error.code === 'CONFIG_NOT_FOUND') {
    console.error('Please run: npx vibe-codex init');
  } else if (error.code === 'MODULE_ERROR') {
    console.error(`Module failed: ${error.module}`);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

### Error Codes
- `CONFIG_NOT_FOUND` - Configuration file missing
- `MODULE_ERROR` - Module validation failed
- `INIT_ERROR` - Initialization failed
- `GIT_ERROR` - Git operations failed
- `PERMISSION_ERROR` - File permission issues