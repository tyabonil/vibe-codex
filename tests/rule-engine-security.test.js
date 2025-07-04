const RuleEngine = require('../scripts/rule-engine');
const rules = require('../config/rules.json');

describe('RuleEngine', () => {
    let ruleEngine;

    beforeEach(() => {
        ruleEngine = new RuleEngine();
    });

    describe('checkLevel1Security', () => {
        const securityRules = rules.rules.level1_security;

        it('should not report violations for files that do not contain secrets', async () => {
            const files = [{
                filename: 'src/config.js',
                patch: '+const API_KEY = "sk-1234567890abcdef";'
            }];
            const violations = await ruleEngine.checkLevel1Security(files, {});
            expect(violations).toHaveLength(0);
        });

        it('should report violations for files that contain secrets', async () => {
            const files = [{
                filename: 'src/config.js',
                patch: '+const API_KEY = "sk_live_1234567890abcdef";'
            }];
            const violations = await ruleEngine.checkLevel1Security(files, {});
            expect(violations).toHaveLength(1);
            expect(violations[0].rule).toBe('secrets_detection');
            expect(violations[0].level).toBe(1);
            expect(violations[0].severity).toBe('BLOCKER');
        });

        it('should not report violations for test files that contain secrets', async () => {
            const files = [{
                filename: 'tests/config.test.js',
                patch: '+const API_KEY = "sk_live_1234567890abcdef";'
            }];
            const violations = await ruleEngine.checkLevel1Security(files, {});
            expect(violations).toHaveLength(0);
        });

        it('should not report violations for documentation files that contain secrets', async () => {
            const files = [{
                filename: 'docs/config.md',
                patch: '+const API_KEY = "sk_live_1234567890abcdef";'
            }];
            const violations = await ruleEngine.checkLevel1Security(files, {});
            expect(violations).toHaveLength(0);
        });

        it('should not report violations for prisma schema files that contain secrets', async () => {
            const files = [{
                filename: 'prisma/schema.prisma',
                patch: '+const API_KEY = "sk_live_1234567890abcdef";'
            }];
            const violations = await ruleEngine.checkLevel1Security(files, {});
            expect(violations).toHaveLength(0);
        });

        securityRules.checks.secrets_detection.patterns.forEach(pattern => {
            it(`should detect the pattern "${pattern}"`, async () => {
                const files = [{
                    filename: 'src/config.js',
                    patch: `+const MY_SECRET = "${pattern}";`
                }];
                const violations = await ruleEngine.checkLevel1Security(files, {});
                expect(violations).toHaveLength(1);
                expect(violations[0].rule).toBe('secrets_detection');
                expect(violations[0].level).toBe(1);
                expect(violations[0].severity).toBe('BLOCKER');
            });
        });
    });
});
