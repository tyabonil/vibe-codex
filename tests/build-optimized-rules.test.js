const { buildOptimizedRules } = require('../scripts/build-optimized-rules');
const fs = require('fs');
const path = require('path');

describe('buildOptimizedRules', () => {
    const sourcePath = path.join(__dirname, '..', 'MANDATORY-RULES.md');
    const outputPath = path.join(__dirname, '..', 'RULES-LLM-OPTIMIZED.md');

    beforeEach(() => {
        // Create a dummy MANDATORY-RULES.md file
        const dummyMarkdown = `
## ⚡ LEVEL 1: SECURITY & SAFETY (NON-NEGOTIABLE)
### 🔐 **NEVER COMMIT SENSITIVE INFO**
- ❌ NEVER commit .env files
- ✅ ALWAYS use environment variables

## ⚡ LEVEL 2: WORKFLOW INTEGRITY (MANDATORY)
### SEQ-1: CREATE OR IDENTIFY AN ISSUE
- ✅ EVERY code change must start with a GitHub issue.
`;
        fs.writeFileSync(sourcePath, dummyMarkdown, 'utf8');
    });

    afterEach(() => {
        // Clean up the dummy files
        fs.unlinkSync(sourcePath);
        fs.unlinkSync(outputPath);
    });

    it('should create the optimized rules file', () => {
        buildOptimizedRules();
        expect(fs.existsSync(outputPath)).toBe(true);
    });

    it('should correctly parse the markdown', () => {
        buildOptimizedRules();
        const optimizedContent = fs.readFileSync(outputPath, 'utf8');
        expect(optimizedContent).toContain('## LEVEL 1: SECURITY & SAFETY (NON-NEGOTIABLE)');
        expect(optimizedContent).toContain('### 🔐 **NEVER COMMIT SECRETS**');
        expect(optimizedContent).toContain('- ❌ NEVER commit .env files');
        expect(optimizedContent).toContain('- ✅ ALWAYS use environment variables');
        expect(optimizedContent).toContain('## LEVEL 2: WORKFLOW INTEGRITY (MANDATORY)');
        expect(optimizedContent).toContain('### SEQ-1: CREATE OR IDENTIFY AN ISSUE');
        expect(optimizedContent).toContain('- ✅ EVERY code change must start with a GitHub issue.');
    });
});