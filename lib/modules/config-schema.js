/**
 * Configuration schema for vibe-codex modules
 */

export const configSchema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "version": {
      "type": "string",
      "description": "vibe-codex configuration version",
      "pattern": "^\\d+\\.\\d+\\.\\d+$"
    },
    "modules": {
      "type": "object",
      "description": "Module configuration",
      "properties": {
        "core": {
          "$ref": "#/definitions/moduleConfig",
          "description": "Core module configuration (always enabled)"
        },
        "github-workflow": {
          "$ref": "#/definitions/githubWorkflowConfig",
          "description": "GitHub workflow module configuration"
        },
        "testing": {
          "$ref": "#/definitions/testingConfig",
          "description": "Testing module configuration"
        },
        "deployment": {
          "$ref": "#/definitions/deploymentConfig",
          "description": "Deployment module configuration"
        },
        "documentation": {
          "$ref": "#/definitions/documentationConfig",
          "description": "Documentation module configuration"
        }
      },
      "additionalProperties": {
        "$ref": "#/definitions/moduleConfig"
      }
    },
    "customModules": {
      "type": "object",
      "description": "Custom module paths",
      "additionalProperties": {
        "type": "string",
        "description": "Path to custom module"
      }
    },
    "issueTracking": {
      "type": "object",
      "description": "Issue tracking and reminder configuration",
      "properties": {
        "enableReminders": {
          "type": "boolean",
          "default": true,
          "description": "Enable issue update reminders"
        },
        "reminderFrequency": {
          "type": "string",
          "default": "2h",
          "description": "How often to remind about issue updates",
          "pattern": "^\\d+[hmd]$"
        },
        "autoPrompt": {
          "type": "boolean",
          "default": true,
          "description": "Automatically prompt for issue updates"
        },
        "updateOnPush": {
          "type": "boolean",
          "default": true,
          "description": "Check for issue updates before push"
        },
        "relatedIssueDetection": {
          "type": "boolean",
          "default": true,
          "description": "Detect related issues from commit messages"
        }
      }
    },
    "customRules": {
      "type": "array",
      "description": "Custom rules to add",
      "items": {
        "$ref": "#/definitions/customRule"
      }
    }
  },
  "required": ["version", "modules"],
  "definitions": {
    "moduleConfig": {
      "type": "object",
      "properties": {
        "enabled": {
          "type": "boolean",
          "description": "Whether the module is enabled"
        },
        "options": {
          "type": "object",
          "description": "Module-specific options"
        }
      },
      "required": ["enabled"]
    },
    "githubWorkflowConfig": {
      "type": "object",
      "allOf": [{ "$ref": "#/definitions/moduleConfig" }],
      "properties": {
        "enabled": { "type": "boolean" },
        "options": {
          "type": "object",
          "properties": {
            "features": {
              "type": "array",
              "description": "Enabled workflow features",
              "items": {
                "type": "string",
                "enum": ["pr-checks", "issue-tracking", "auto-merge", "branch-protection"]
              }
            },
            "prTemplate": {
              "type": "string",
              "description": "Path to custom PR template"
            },
            "issueTemplate": {
              "type": "string",
              "description": "Path to custom issue template"
            }
          }
        }
      }
    },
    "testingConfig": {
      "type": "object",
      "allOf": [{ "$ref": "#/definitions/moduleConfig" }],
      "properties": {
        "enabled": { "type": "boolean" },
        "options": {
          "type": "object",
          "properties": {
            "framework": {
              "type": "string",
              "description": "Testing framework",
              "enum": ["jest", "mocha", "vitest", "jasmine"]
            },
            "coverage": {
              "type": "object",
              "properties": {
                "threshold": {
                  "type": "number",
                  "description": "Coverage threshold percentage",
                  "minimum": 0,
                  "maximum": 100
                },
                "enforcement": {
                  "type": "string",
                  "description": "How to enforce coverage",
                  "enum": ["error", "warning", "none"]
                },
                "exclude": {
                  "type": "array",
                  "description": "Paths to exclude from coverage",
                  "items": { "type": "string" }
                }
              }
            }
          }
        }
      }
    },
    "deploymentConfig": {
      "type": "object",
      "allOf": [{ "$ref": "#/definitions/moduleConfig" }],
      "properties": {
        "enabled": { "type": "boolean" },
        "options": {
          "type": "object",
          "properties": {
            "platform": {
              "type": "string",
              "description": "Deployment platform",
              "enum": ["vercel", "netlify", "aws", "gcp", "azure", "heroku"]
            },
            "checks": {
              "type": "array",
              "description": "Deployment checks to perform",
              "items": {
                "type": "string",
                "enum": ["preview-deployment", "production-validation", "environment-vars", "build-success"]
              }
            }
          }
        }
      }
    },
    "documentationConfig": {
      "type": "object",
      "allOf": [{ "$ref": "#/definitions/moduleConfig" }],
      "properties": {
        "enabled": { "type": "boolean" },
        "options": {
          "type": "object",
          "properties": {
            "requirements": {
              "type": "array",
              "description": "Required documentation",
              "items": {
                "type": "string",
                "enum": ["readme", "context", "api-docs", "architecture", "contributing"]
              }
            },
            "format": {
              "type": "string",
              "description": "Documentation format",
              "enum": ["markdown", "jsdoc", "typedoc"]
            }
          }
        }
      }
    },
    "customRule": {
      "type": "object",
      "properties": {
        "name": {
          "type": "string",
          "description": "Rule name"
        },
        "path": {
          "type": "string",
          "description": "Path to rule implementation"
        },
        "level": {
          "type": "integer",
          "description": "Rule level",
          "minimum": 1,
          "maximum": 5
        },
        "enabled": {
          "type": "boolean",
          "description": "Whether rule is enabled",
          "default": true
        }
      },
      "required": ["name", "path", "level"]
    }
  }
};

/**
 * Example configurations
 */
export const configExamples = {
  minimal: {
    version: "1.0.0",
    modules: {
      core: { enabled: true }
    }
  },
  
  frontend: {
    version: "1.0.0",
    modules: {
      core: { enabled: true },
      "github-workflow": {
        enabled: true,
        options: {
          features: ["pr-checks", "issue-tracking"]
        }
      },
      testing: {
        enabled: true,
        options: {
          framework: "jest",
          coverage: {
            threshold: 80,
            enforcement: "error"
          }
        }
      },
      documentation: {
        enabled: true,
        options: {
          requirements: ["readme", "context"]
        }
      }
    }
  },
  
  fullStack: {
    version: "1.0.0",
    modules: {
      core: { enabled: true },
      "github-workflow": {
        enabled: true,
        options: {
          features: ["pr-checks", "issue-tracking", "auto-merge", "branch-protection"]
        }
      },
      testing: {
        enabled: true,
        options: {
          framework: "jest",
          coverage: {
            threshold: 90,
            enforcement: "error",
            exclude: ["**/*.test.js", "**/__mocks__/**"]
          }
        }
      },
      deployment: {
        enabled: true,
        options: {
          platform: "vercel",
          checks: ["preview-deployment", "production-validation", "environment-vars"]
        }
      },
      documentation: {
        enabled: true,
        options: {
          requirements: ["readme", "context", "api-docs", "architecture"],
          format: "markdown"
        }
      }
    }
  }
};