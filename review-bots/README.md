# Review Bots 🤖

Three opinionated code review bots with different perspectives on your code:

- **🤬 Hater Bot**: The world's greatest developer who is also the world's greatest hater. Finds every flaw, expresses them pedantically but truthfully.
- **🛡️ White Knight Bot**: The eternal defender of code. Provides fair counterpoints and defends reasonable design decisions.
- **⚖️ Balance Bot**: The pragmatic mediator. Factors in both perspectives and offers solutions biased toward greater impact.

## Installation

```bash
# From the review-bots directory
npm install

# Install globally for CLI access
npm link
```

## Usage

### Run All Bots Together

```bash
# Review current directory
review-bots

# Review specific files or directories
review-bots src/ tests/

# Review with specific extensions
review-bots --extensions .js .ts

# Save report to file
review-bots --output report.md
```

### Run Individual Bots

```bash
# Run only the Hater Bot
hater-bot src/

# Run only the White Knight Bot
white-knight-bot src/

# Run only the Balance Bot
balance-bot src/
```

### Options

- `-e, --extensions <exts...>`: File extensions to include (default: `.js .ts .jsx .tsx .md .json .sh`)
- `-i, --ignore <patterns...>`: Patterns to ignore (default: `node_modules .git dist build`)
- `-o, --output <file>`: Save report to file instead of printing to console
- `-b, --bot <bot>`: Run specific bot only when using `review-bots` command
- `--separate`: Show each bot report separately instead of combined
- `--no-color`: Disable colored output

## Examples

### Example 1: Review TypeScript Project

```bash
hater-bot src/ --extensions .ts .tsx
```

Output:
```
🤬 HaterBot reviewing src/index.ts:

Found 3 issues. Let me tell you everything wrong with your code:

1. **'var' in 2025? Time Traveler Detected**
   Severity: HIGH
   Found 2 uses of 'var'. Did you write this code in 2009 and just commit it now?
   💡 Replace all 'var' with 'const' or 'let'. It's literally a find-and-replace operation.

2. **YOLO Error Handling**
   Severity: CRITICAL
   5 async operations and zero try-catch blocks. What's your error handling strategy? Prayer?
   💡 Add proper error handling. Wrap async calls in try-catch blocks.
```

### Example 2: Balanced Analysis

```bash
balance-bot src/utils/ --output utils-review.md
```

The Balance Bot will:
1. Run both Hater Bot and White Knight Bot internally
2. Synthesize their perspectives
3. Provide actionable recommendations sorted by severity
4. Include effort vs impact analysis

### Example 3: Compare All Perspectives

```bash
review-bots src/api.js --separate
```

This will show each bot's analysis separately, letting you see:
- What Hater Bot criticizes
- What White Knight Bot defends
- What Balance Bot actually recommends

## Bot Philosophies

### Hater Bot 😤
- Assumes the worst about your code
- Points out every possible flaw
- Uses sarcasm and harsh truth
- Zero tolerance for bad practices
- Makes you question your career choices

### White Knight Bot 🛡️
- Looks for legitimate reasons behind decisions
- Defends pragmatic choices
- Understands real-world constraints
- Values working code over perfect code
- Makes you feel better about your technical debt

### Balance Bot ⚖️
- Weighs criticism against practical reality
- Sorts issues by actual impact
- Provides effort vs reward analysis
- Focuses on what matters for shipping
- Actually helpful (unlike the other two)

## Supported Languages

Currently supports analysis for:
- JavaScript/TypeScript (.js, .jsx, .ts, .tsx)
- Markdown (.md)
- JSON (.json)
- Shell Scripts (.sh)

Each language has specific checks:
- **JavaScript/TypeScript**: var usage, error handling, callbacks, complexity
- **Markdown**: Structure, examples, marketing speak, readability
- **JSON**: Validity, nesting depth, naming consistency
- **Shell**: Shebang, error handling, variable quoting

## Extending the Bots

To add new checks or languages:

1. Add patterns to the respective bot class
2. Implement language-specific methods
3. Update the file extension mappings

Example:
```javascript
// In hater-bot.js
checkPythonIssues(content, analysis) {
  const issues = [];
  // Add Python-specific checks
  return issues;
}
```

## Use Cases

1. **Pre-commit Reviews**: Run Hater Bot before commits to catch issues early
2. **PR Reviews**: Use Balance Bot for practical PR feedback
3. **Learning**: Compare all three perspectives to understand trade-offs
4. **Team Standards**: Configure Balance Bot thresholds for your team
5. **Comedy**: Run Hater Bot when you need to feel bad about yourself

## Notes

- The bots analyze code statically - they don't execute it
- Large files may take longer to analyze
- Binary files are automatically skipped
- Reports can be saved as markdown for sharing

## License

MIT - Criticize responsibly!