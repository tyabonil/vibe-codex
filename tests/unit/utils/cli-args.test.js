/**
 * Tests for CLI argument parsing utilities
 */

const {
  parseModuleList,
  modulesToConfig,
  parseAdvancedHooks,
  getProjectDefaults,
  processInitArgs
} = require('../../../lib/utils/cli-args');

describe('CLI Arguments Utilities', () => {
  describe('parseModuleList', () => {
    test('should parse comma-separated module list', () => {
      const result = parseModuleList('core,testing,github-workflow');
      expect(result).toEqual(['core', 'testing', 'github-workflow']);
    });

    test('should handle spaces in module list', () => {
      const result = parseModuleList('core, testing , github-workflow');
      expect(result).toEqual(['core', 'testing', 'github-workflow']);
    });

    test('should return all modules when passed "all"', () => {
      const result = parseModuleList('all');
      expect(result).toEqual([
        'core',
        'github-workflow',
        'testing',
        'deployment',
        'documentation',
        'patterns'
      ]);
    });

    test('should return empty array for empty input', () => {
      expect(parseModuleList('')).toEqual([]);
      expect(parseModuleList(null)).toEqual([]);
      expect(parseModuleList(undefined)).toEqual([]);
    });

    test('should filter out empty strings', () => {
      const result = parseModuleList('core,,testing,');
      expect(result).toEqual(['core', 'testing']);
    });
  });

  describe('modulesToConfig', () => {
    test('should convert module list to config object', () => {
      const result = modulesToConfig(['testing', 'github-workflow']);
      expect(result).toEqual({
        core: { enabled: true },
        testing: { enabled: true },
        'github-workflow': { enabled: true }
      });
    });

    test('should always include core module', () => {
      const result = modulesToConfig([]);
      expect(result).toEqual({
        core: { enabled: true }
      });
    });

    test('should not duplicate core if explicitly passed', () => {
      const result = modulesToConfig(['core', 'testing']);
      expect(result).toEqual({
        core: { enabled: true },
        testing: { enabled: true }
      });
    });
  });

  describe('parseAdvancedHooks', () => {
    test('should parse comma-separated hook categories', () => {
      const result = parseAdvancedHooks('pr-health,issue-tracking');
      expect(result).toEqual({
        enabled: true,
        categories: ['pr-health', 'issue-tracking']
      });
    });

    test('should handle spaces in hook list', () => {
      const result = parseAdvancedHooks('pr-health , issue-tracking , commit-analysis');
      expect(result).toEqual({
        enabled: true,
        categories: ['pr-health', 'issue-tracking', 'commit-analysis']
      });
    });

    test('should return null for empty input', () => {
      expect(parseAdvancedHooks('')).toBeNull();
      expect(parseAdvancedHooks(null)).toBeNull();
      expect(parseAdvancedHooks(undefined)).toBeNull();
    });

    test('should return null if no valid categories after filtering', () => {
      const result = parseAdvancedHooks(' , , ');
      expect(result).toBeNull();
    });
  });

  describe('getProjectDefaults', () => {
    test('should return correct defaults for web project', () => {
      const result = getProjectDefaults('web');
      expect(result).toEqual({
        core: { enabled: true },
        'github-workflow': { enabled: true },
        testing: { enabled: true },
        documentation: { enabled: true }
      });
    });

    test('should return correct defaults for api project', () => {
      const result = getProjectDefaults('api');
      expect(result).toEqual({
        core: { enabled: true },
        'github-workflow': { enabled: true },
        testing: { enabled: true },
        documentation: { enabled: true }
      });
    });

    test('should return correct defaults for fullstack project', () => {
      const result = getProjectDefaults('fullstack');
      expect(result).toEqual({
        core: { enabled: true },
        'github-workflow': { enabled: true },
        testing: { enabled: true },
        deployment: { enabled: true },
        documentation: { enabled: true }
      });
    });

    test('should return correct defaults for library project', () => {
      const result = getProjectDefaults('library');
      expect(result).toEqual({
        core: { enabled: true },
        'github-workflow': { enabled: true },
        documentation: { enabled: true }
      });
    });

    test('should return minimal defaults for custom or unknown project type', () => {
      expect(getProjectDefaults('custom')).toEqual({
        core: { enabled: true }
      });
      expect(getProjectDefaults('unknown')).toEqual({
        core: { enabled: true }
      });
    });
  });

  describe('processInitArgs', () => {
    test('should set interactive flag', () => {
      const result = processInitArgs({ interactive: true });
      expect(result.interactive).toBe(true);

      const result2 = processInitArgs({});
      expect(result2.interactive).toBe(false);
    });

    test('should process project type', () => {
      const result = processInitArgs({ type: 'web' });
      expect(result.projectType).toBe('web');
    });

    test('should ignore auto type', () => {
      const result = processInitArgs({ type: 'auto' });
      expect(result.projectType).toBeUndefined();
    });

    test('should handle minimal flag', () => {
      const result = processInitArgs({ minimal: true });
      expect(result.modules).toEqual({
        core: { enabled: true }
      });
    });

    test('should parse modules list', () => {
      const result = processInitArgs({ modules: 'testing,github-workflow' });
      expect(result.modules).toEqual({
        core: { enabled: true },
        testing: { enabled: true },
        'github-workflow': { enabled: true }
      });
    });

    test('should handle modules=all', () => {
      const result = processInitArgs({ modules: 'all' });
      expect(result.modules).toEqual({
        core: { enabled: true },
        'github-workflow': { enabled: true },
        testing: { enabled: true },
        deployment: { enabled: true },
        documentation: { enabled: true },
        patterns: { enabled: true }
      });
    });

    test('should use preset defaults when specified', () => {
      const result = processInitArgs({ type: 'fullstack', preset: true });
      expect(result.modules).toEqual({
        core: { enabled: true },
        'github-workflow': { enabled: true },
        testing: { enabled: true },
        deployment: { enabled: true },
        documentation: { enabled: true }
      });
    });

    test('should parse advanced hooks', () => {
      const result = processInitArgs({ withAdvancedHooks: 'pr-health,issue-tracking' });
      expect(result.advancedHooks).toEqual({
        enabled: true,
        categories: ['pr-health', 'issue-tracking']
      });
    });

    test('should prioritize minimal over modules', () => {
      const result = processInitArgs({ minimal: true, modules: 'all' });
      expect(result.modules).toEqual({
        core: { enabled: true }
      });
    });

    test('should prioritize explicit modules over preset', () => {
      const result = processInitArgs({ 
        type: 'fullstack', 
        preset: true, 
        modules: 'testing' 
      });
      expect(result.modules).toEqual({
        core: { enabled: true },
        testing: { enabled: true }
      });
    });
  });
});