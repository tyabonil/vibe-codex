const RuleEngine = require('../scripts/rule-engine');

describe('RuleEngine', () => {
    let ruleEngine;

    beforeEach(() => {
        ruleEngine = new RuleEngine();
    });

    describe('checkSequentialWorkflow', () => {
        it('should not flag a valid feature branch PR to preview', async () => {
            const prData = {
                title: 'feat: Add new feature',
                body: 'Fixes #123',
                head: { ref: 'feature/issue-123-add-new-feature' },
                base: { ref: 'preview' }
            };
            const violations = await ruleEngine.checkSequentialWorkflow(prData, [], [], null);
            expect(violations).toHaveLength(0);
        });

        it('should not flag a valid preview branch PR to main', async () => {
            const prData = {
                title: 'feat: Consolidate all rule improvements',
                body: 'Fixes #6',
                head: { ref: 'preview' },
                base: { ref: 'main' }
            };
            const violations = await ruleEngine.checkSequentialWorkflow(prData, [], [], null);
            expect(violations).toHaveLength(0);
        });

        it('should flag a feature branch PR to main', async () => {
            const prData = {
                title: 'feat: Add new feature',
                body: 'Fixes #123',
                head: { ref: 'feature/issue-123-add-new-feature' },
                base: { ref: 'main' }
            };
            const violations = await ruleEngine.checkSequentialWorkflow(prData, [], [], null);
            expect(violations).toHaveLength(1);
            expect(violations[0].rule).toBe('SEQ-4: CREATE A PULL REQUEST');
        });

        it('should flag an invalid branch name', async () => {
            const prData = {
                title: 'feat: Add new feature',
                body: 'Fixes #123',
                head: { ref: 'my-feature' },
                base: { ref: 'preview' }
            };
            const violations = await ruleEngine.checkSequentialWorkflow(prData, [], [], null);
            expect(violations).toHaveLength(1);
            expect(violations[0].rule).toBe('SEQ-2: CREATE A BRANCH');
        });

        it('should not flag the preview branch name', async () => {
            const prData = {
                title: 'feat: Consolidate all rule improvements',
                body: 'Fixes #6',
                head: { ref: 'preview' },
                base: { ref: 'main' }
            };
            const violations = await ruleEngine.checkSequentialWorkflow(prData, [], [], null);
            const branchViolation = violations.find(v => v.rule === 'SEQ-2: CREATE A BRANCH');
            expect(branchViolation).toBeUndefined();
        });
    });
});