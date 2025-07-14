/**
 * Configuration schema for vibe-codex
 * Uses rule IDs from registry.json
 */

const Joi = require("joi");

/**
 * Rule configuration schema
 */
const ruleConfigSchema = Joi.object({
  enabled: Joi.boolean().required(),
  options: Joi.object().optional(),
});

/**
 * Main configuration schema
 */
const configSchema = Joi.object({
  // Version of the config format
  version: Joi.string().valid("3.0.0").required(),

  // Project metadata
  project: Joi.object({
    name: Joi.string().optional(),
    type: Joi.string()
      .valid("web", "api", "fullstack", "library", "custom")
      .default("custom"),
    description: Joi.string().optional(),
  }).optional(),

  // Preset used (if any)
  preset: Joi.string()
    .valid(
      "minimal",
      "standard",
      "strict",
      "ai-developer",
      "enterprise",
      "custom",
    )
    .default("custom"),

  // Individual rule configurations
  rules: Joi.object()
    .pattern(
      Joi.string().regex(/^[a-z]+-\d{3}$/), // Pattern: category-001
      ruleConfigSchema,
    )
    .required(),

  // Project context configuration
  projectContext: Joi.object({
    enabled: Joi.boolean().default(false),
    file: Joi.string().default("PROJECT-CONTEXT.md"),
  }).optional(),

  // Hook configuration
  hooks: Joi.object({
    "pre-commit": Joi.boolean().default(true),
    "commit-msg": Joi.boolean().default(true),
    "pre-push": Joi.boolean().default(true),
    "post-commit": Joi.boolean().default(false),
    "post-merge": Joi.boolean().default(false),
  }).optional(),

  // Metadata
  createdAt: Joi.string().isoDate().optional(),
  lastModified: Joi.string().isoDate().optional(),
});

/**
 * Migration schema from v2 to v3
 */
const migrationSchema = {
  moduleToRuleMapping: {
    // Core module rules
    "core.gitHooks": ["wfl-001", "wfl-002"],
    "core.commitMessageValidation": ["cmt-001", "cmt-002"],
    "core.securityChecks": ["sec-001", "sec-002", "sec-003"],

    // Testing module rules
    "testing.enabled": ["tst-001", "tst-003"],
    "testing.coverage": ["tst-002"],

    // Documentation module rules
    "documentation.enabled": ["doc-001", "doc-002", "doc-003", "doc-004"],

    // GitHub module rules
    "github.enabled": ["wfl-002", "wfl-003"],
    "github.pr": ["wfl-002"],
    "github.issues": ["wfl-001"],
  },
};

/**
 * Example configuration
 */
const exampleConfig = {
  version: "3.0.0",
  project: {
    name: "my-project",
    type: "fullstack",
    description: "Full-stack web application",
  },
  preset: "standard",
  rules: {
    // Security rules
    "sec-001": { enabled: true },
    "sec-002": { enabled: true },
    "sec-003": { enabled: false },

    // Workflow rules
    "wfl-001": { enabled: true },
    "wfl-005": {
      enabled: true,
      options: {
        directory: ".vibe-codex/work-logs",
        require_logs: false,
      },
    },
    "wfl-006": { enabled: true },

    // Documentation rules
    "doc-001": { enabled: true },
    "doc-004": {
      enabled: true,
      options: {
        strict: false,
        auto_suggest: true,
      },
    },
  },
  projectContext: {
    enabled: true,
    file: "PROJECT-CONTEXT.md",
  },
  hooks: {
    "pre-commit": true,
    "commit-msg": true,
    "pre-push": true,
  },
  createdAt: "2024-07-11T10:00:00Z",
  lastModified: "2024-07-11T10:00:00Z",
};

/**
 * Validate a configuration
 */
function validateConfig(config) {
  const { error, value } = configSchema.validate(config, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    return {
      valid: false,
      errors: error.details.map((d) => ({
        path: d.path.join("."),
        message: d.message,
      })),
    };
  }

  return {
    valid: true,
    value,
    errors: [],
  };
}

/**
 * Migrate from v2 to v3 configuration
 */
function migrateV2ToV3(v2Config) {
  const v3Config = {
    version: "3.0.0",
    project: {
      type: v2Config.projectType || "custom",
    },
    preset: "custom",
    rules: {},
    projectContext: {
      enabled: false,
    },
    hooks: {},
    createdAt: v2Config.createdAt,
    lastModified: new Date().toISOString(),
  };

  // Migrate modules to rules
  if (v2Config.modules) {
    Object.entries(v2Config.modules).forEach(([moduleName, moduleConfig]) => {
      if (!moduleConfig.enabled) return;

      // Map module settings to rule IDs
      Object.entries(moduleConfig).forEach(([setting, value]) => {
        if (setting === "enabled") return;

        const key = `${moduleName}.${setting}`;
        const ruleIds = migrationSchema.moduleToRuleMapping[key];

        if (ruleIds && value) {
          ruleIds.forEach((ruleId) => {
            v3Config.rules[ruleId] = { enabled: true };
          });
        }
      });
    });
  }

  // Set default rules if none were migrated
  if (Object.keys(v3Config.rules).length === 0) {
    // Apply standard preset rules
    const standardRules = [
      "sec-001",
      "sec-002",
      "sec-003",
      "cmt-001",
      "tst-003",
      "doc-001",
      "sty-001",
      "sty-002",
      "wfl-006",
    ];
    standardRules.forEach((ruleId) => {
      v3Config.rules[ruleId] = { enabled: true };
    });
    v3Config.preset = "standard";
  }

  return v3Config;
}

module.exports = {
  configSchema,
  ruleConfigSchema,
  validateConfig,
  migrateV2ToV3,
  exampleConfig,
  migrationSchema,
};
