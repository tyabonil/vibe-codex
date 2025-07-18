const Joi = require('joi');
const fs = require('fs-extra');
const path = require('path');

/**
 * Schema definitions for rule and ruleset validation
 */
const schemas = {
  rule: Joi.object({
    version: Joi.string().valid('1.0').required(),
    id: Joi.string().pattern(/^[a-z0-9-]+$/).required(),
    type: Joi.string().valid('rule', 'hook').required(),
    platforms: Joi.array()
      .items(Joi.string().valid('git', 'claude', 'github-copilot', 'cursor', 'all'))
      .min(1)
      .unique(),
    compatibility: Joi.object({
      os: Joi.array().items(Joi.string().valid('windows', 'linux', 'macos', 'all')),
      shells: Joi.array().items(Joi.string().valid('bash', 'powershell', 'cmd', 'zsh', 'fish')),
      requirements: Joi.array().items(Joi.string())
    }),
    metadata: Joi.object({
      name: Joi.string().required(),
      description: Joi.string().required(),
      category: Joi.string()
        .valid('security', 'workflow', 'quality', 'documentation', 'ai-development', 'llm-specific')
        .required(),
      severity: Joi.string().valid('low', 'medium', 'high', 'critical').default('medium'),
      tags: Joi.array().items(Joi.string()),
      enabled_by_default: Joi.boolean().default(false)
    }).required(),
    implementation: Joi.object()
      .pattern(
        Joi.string(),
        Joi.object({
          hooks: Joi.array().items(Joi.string()),
          script: Joi.string(),
          command: Joi.string(),
          validator: Joi.string(),
          config: Joi.object(),
          files: Joi.array().items(Joi.string())
        })
      )
      .required(),
    options: Joi.object().pattern(Joi.string(), Joi.any())
  }),

  ruleset: Joi.object({
    version: Joi.string().valid('1.0').required(),
    id: Joi.string().pattern(/^[a-z0-9-]+$/).required(),
    name: Joi.string().required(),
    description: Joi.string(),
    extends: Joi.array().items(Joi.string()),
    rules: Joi.array().items(Joi.string()).min(1).required(),
    hooks: Joi.array().items(Joi.string()),
    config: Joi.object({
      failFast: Joi.boolean().default(false),
      parallel: Joi.boolean().default(true),
      timeout: Joi.number().default(30000)
    }),
    overrides: Joi.object().pattern(Joi.string(), Joi.object())
  })
};

class SchemaValidator {
  /**
   * Validate a rule or hook definition
   * @param {Object} definition - The rule/hook definition to validate
   * @param {string} type - Either 'rule' or 'ruleset'
   * @returns {Object} Validation result with { valid: boolean, error?: string, value?: Object }
   */
  validate(definition, type = 'rule') {
    const schema = schemas[type];
    if (!schema) {
      return {
        valid: false,
        error: `Unknown schema type: ${type}`
      };
    }

    const result = schema.validate(definition, {
      abortEarly: false,
      stripUnknown: false
    });

    if (result.error) {
      return {
        valid: false,
        error: result.error.details.map(d => d.message).join('; ')
      };
    }

    return {
      valid: true,
      value: result.value
    };
  }

  /**
   * Validate a JSON file against schema
   * @param {string} filePath - Path to the JSON file
   * @param {string} type - Either 'rule' or 'ruleset'
   * @returns {Promise<Object>} Validation result
   */
  async validateFile(filePath, type = 'rule') {
    try {
      const content = await fs.readJSON(filePath);
      const result = this.validate(content, type);
      
      if (!result.valid) {
        result.file = filePath;
      }
      
      return result;
    } catch (error) {
      return {
        valid: false,
        error: `Failed to read file: ${error.message}`,
        file: filePath
      };
    }
  }

  /**
   * Validate all definitions in a directory
   * @param {string} directory - Directory containing JSON definitions
   * @param {string} type - Either 'rule' or 'ruleset'
   * @returns {Promise<Object>} Validation results
   */
  async validateDirectory(directory, type = 'rule') {
    const results = {
      valid: [],
      invalid: [],
      total: 0
    };

    try {
      const files = await fs.readdir(directory);
      const jsonFiles = files.filter(f => f.endsWith('.json'));

      for (const file of jsonFiles) {
        const filePath = path.join(directory, file);
        const result = await this.validateFile(filePath, type);
        
        results.total++;
        if (result.valid) {
          results.valid.push(file);
        } else {
          results.invalid.push({
            file,
            error: result.error
          });
        }
      }
    } catch (error) {
      throw new Error(`Failed to validate directory: ${error.message}`);
    }

    return results;
  }

  /**
   * Get the JSON schema for a given type
   * @param {string} type - Either 'rule' or 'ruleset'
   * @returns {Object} The Joi schema converted to JSON Schema format (approximation)
   */
  getJsonSchema(type = 'rule') {
    // Note: This is a simplified representation for documentation purposes
    // Joi doesn't directly export to JSON Schema format
    return {
      type: 'object',
      description: `Schema for ${type} definitions`,
      schema: schemas[type].describe()
    };
  }
}

module.exports = SchemaValidator;