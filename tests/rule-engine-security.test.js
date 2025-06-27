const RuleEngine = require('../scripts/rule-engine');

describe('RuleEngine', () => {
    let ruleEngine;

    beforeEach(() => {
        ruleEngine = new RuleEngine();
    });

    describe('checkLevel1Security', () => {
        it('should use strict patterns for non-test files', async () => {
            const files = [{
                filename: 'src/config.js',
                patch: '+const API_KEY = "sk-1234567890abcdef";'
            }];
            const violations = await ruleEngine.checkLevel1Security(files, {});
            expect(violations).toHaveLength(1);
        });

        it('should use less strict patterns for test files', async () => {
            const files = [{
                filename: 'tests/config.test.js',
                patch: '+const API_KEY = "sk-1234567890abcdef";'
            }];
            const violations = await ruleEngine.checkLevel1Security(files, {});
            expect(violations).toHaveLength(0);
        });
    });
});