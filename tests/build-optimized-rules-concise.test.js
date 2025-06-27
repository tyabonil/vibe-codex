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

### 🔐 **NEVER COMMIT SECRETS**

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

    it('should correctly parse the markdown and remove blank lines', () => {
        buildOptimizedRules();
        const optimizedContent = fs.readFileSync(outputPath, 'utf8');
        expect(optimizedContent).not.toContain('\n\n');
    });
});