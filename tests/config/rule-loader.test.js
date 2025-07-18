const RuleLoader = require('../../lib/config/rule-loader');
const path = require('path');
const fs = require('fs-extra');

describe('RuleLoader', () => {
  const testRulesDir = path.join(__dirname, 'test-rules-loader');
  const definitionsDir = path.join(testRulesDir, 'definitions');
  const rulesetsDir = path.join(testRulesDir, 'rulesets');
  let loader;

  beforeAll(async () => {
    // Create test directory structure
    await fs.ensureDir(definitionsDir);
    await fs.ensureDir(rulesetsDir);
    
    // Create test rule definitions
    await fs.writeJSON(path.join(definitionsDir, 'test-rule-1.json'), {
      version: '1.0',
      id: 'test-rule-1',
      type: 'rule',
      platforms: ['git'],
      metadata: {
        name: 'Test Rule 1',
        description: 'First test rule',
        category: 'security',
        enabled_by_default: true
      },
      implementation: {
        git: {
          hooks: ['pre-commit'],
          command: 'echo test1'
        }
      }
    });

    await fs.writeJSON(path.join(definitionsDir, 'test-rule-2.json'), {
      version: '1.0',
      id: 'test-rule-2',
      type: 'hook',
      platforms: ['claude', 'all'],
      metadata: {
        name: 'Test Rule 2',
        description: 'Second test rule',
        category: 'quality'
      },
      implementation: {
        claude: {
          hooks: ['pre-submit'],
          validator: 'testValidator'
        }
      }
    });

    // Create test rulesets
    await fs.writeJSON(path.join(rulesetsDir, 'base-ruleset.json'), {
      version: '1.0',
      id: 'base-ruleset',
      name: 'Base Ruleset',
      description: 'Base rules',
      rules: ['test-rule-1']
    });

    await fs.writeJSON(path.join(rulesetsDir, 'extended-ruleset.json'), {
      version: '1.0',
      id: 'extended-ruleset',
      name: 'Extended Ruleset',
      extends: ['base-ruleset'],
      rules: ['test-rule-2']
    });
  });

  afterAll(async () => {
    await fs.remove(testRulesDir);
  });

  beforeEach(() => {
    loader = new RuleLoader({ rulesDir: testRulesDir });
  });

  describe('loadRule()', () => {
    test('should load a valid rule', async () => {
      const rule = await loader.loadRule('test-rule-1');
      
      expect(rule).toBeDefined();
      expect(rule.id).toBe('test-rule-1');
      expect(rule.metadata.name).toBe('Test Rule 1');
      expect(rule.type).toBe('rule');
    });

    test('should cache loaded rules', async () => {
      const rule1 = await loader.loadRule('test-rule-1');
      const rule2 = await loader.loadRule('test-rule-1');
      
      expect(rule1).toBe(rule2); // Same object reference
      expect(loader.cache.has('test-rule-1')).toBe(true);
    });

    test('should throw error for non-existent rule', async () => {
      await expect(loader.loadRule('non-existent')).rejects.toThrow(
        'Rule definition not found: non-existent'
      );
    });
  });

  describe('loadRules()', () => {
    test('should load multiple rules', async () => {
      const rules = await loader.loadRules(['test-rule-1', 'test-rule-2']);
      
      expect(rules).toHaveLength(2);
      expect(rules[0].id).toBe('test-rule-1');
      expect(rules[1].id).toBe('test-rule-2');
    });
  });

  describe('loadRuleset()', () => {
    test('should load a simple ruleset', async () => {
      const ruleset = await loader.loadRuleset('base-ruleset');
      
      expect(ruleset).toBeDefined();
      expect(ruleset.id).toBe('base-ruleset');
      expect(ruleset.rules).toEqual(['test-rule-1']);
      expect(ruleset.loadedRules).toHaveLength(1);
      expect(ruleset.loadedRules[0].id).toBe('test-rule-1');
    });

    test('should load extended ruleset', async () => {
      const ruleset = await loader.loadRuleset('extended-ruleset');
      
      expect(ruleset).toBeDefined();
      expect(ruleset.extends).toEqual(['base-ruleset']);
      expect(ruleset.rules).toContain('test-rule-1'); // From parent
      expect(ruleset.rules).toContain('test-rule-2'); // Own rule
      expect(ruleset.loadedRules).toHaveLength(2);
    });

    test('should cache loaded rulesets', async () => {
      const ruleset1 = await loader.loadRuleset('base-ruleset');
      const ruleset2 = await loader.loadRuleset('base-ruleset');
      
      expect(ruleset1).toBe(ruleset2);
      expect(loader.rulesetCache.has('base-ruleset')).toBe(true);
    });
  });

  describe('listRules()', () => {
    test('should list all available rules', async () => {
      const rules = await loader.listRules();
      
      expect(rules).toHaveLength(2);
      expect(rules).toContainEqual(expect.objectContaining({
        id: 'test-rule-1',
        name: 'Test Rule 1',
        type: 'rule',
        category: 'security',
        platforms: ['git'],
        enabled_by_default: true
      }));
      expect(rules).toContainEqual(expect.objectContaining({
        id: 'test-rule-2',
        name: 'Test Rule 2',
        type: 'hook',
        category: 'quality',
        platforms: ['claude', 'all']
      }));
    });
  });

  describe('listRulesets()', () => {
    test('should list all available rulesets', async () => {
      const rulesets = await loader.listRulesets();
      
      expect(rulesets).toHaveLength(2);
      expect(rulesets).toContainEqual(expect.objectContaining({
        id: 'base-ruleset',
        name: 'Base Ruleset',
        ruleCount: 1
      }));
      expect(rulesets).toContainEqual(expect.objectContaining({
        id: 'extended-ruleset',
        name: 'Extended Ruleset',
        extends: ['base-ruleset']
      }));
    });
  });

  describe('getRulesByPlatform()', () => {
    test('should filter rules by platform', async () => {
      const gitRules = await loader.getRulesByPlatform('git');
      expect(gitRules).toHaveLength(2); // test-rule-1 (git) and test-rule-2 (all)
      expect(gitRules.map(r => r.id)).toContain('test-rule-1');
      expect(gitRules.map(r => r.id)).toContain('test-rule-2'); // Has 'all' platform
      
      const claudeRules = await loader.getRulesByPlatform('claude');
      expect(claudeRules).toHaveLength(1);
      expect(claudeRules[0].id).toBe('test-rule-2');
    });

    test('should include rules with "all" platform', async () => {
      const gitRules = await loader.getRulesByPlatform('git');
      const randomPlatform = await loader.getRulesByPlatform('random-platform');
      
      // test-rule-2 has 'all' platform, so should be included
      expect(randomPlatform).toContainEqual(expect.objectContaining({
        id: 'test-rule-2'
      }));
    });
  });

  describe('getRulesByCategory()', () => {
    test('should filter rules by category', async () => {
      const securityRules = await loader.getRulesByCategory('security');
      expect(securityRules).toHaveLength(1);
      expect(securityRules[0].id).toBe('test-rule-1');
      
      const qualityRules = await loader.getRulesByCategory('quality');
      expect(qualityRules).toHaveLength(1);
      expect(qualityRules[0].id).toBe('test-rule-2');
    });
  });

  describe('clearCache()', () => {
    test('should clear all caches', async () => {
      await loader.loadRule('test-rule-1');
      await loader.loadRuleset('base-ruleset');
      
      expect(loader.cache.size).toBe(1);
      expect(loader.rulesetCache.size).toBe(1);
      
      loader.clearCache();
      
      expect(loader.cache.size).toBe(0);
      expect(loader.rulesetCache.size).toBe(0);
    });
  });
});