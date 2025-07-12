# Claude (Anthropic) Specific Rules

## RULE-LLM-001: Claude Safety Context

**Category**: LLM-Specific  
**Complexity**: Basic  
**Default**: Enabled  
**Hook Type**: Pre-commit  
**Performance Impact**: Low

### Purpose
Prevent Claude from refusing legitimate security-related code work by providing proper context.

### Problem It Solves
Claude may refuse to work on security tools, penetration testing code, or malware analysis due to over-cautious safety mechanisms, even when the work is legitimate and educational.

### Implementation
```bash
# Check for security-related keywords that might trigger refusal
SECURITY_KEYWORDS="malware|exploit|vulnerability|penetration|backdoor|trojan"
if git diff --cached --name-only | xargs grep -l -E "$SECURITY_KEYWORDS" > /dev/null 2>&1; then
  echo "⚠️  Security-related code detected. Add context comment:"
  echo "   // Educational/defensive security purpose: [explain]"
  exit 1
fi
```

### Configuration
```json
{
  "rules": {
    "llm-001": {
      "enabled": true,
      "options": {
        "require_context": true,
        "keywords": ["malware", "exploit", "vulnerability"]
      }
    }
  }
}
```

---

## RULE-LLM-002: Claude Conciseness Enforcement

**Category**: LLM-Specific  
**Complexity**: Basic  
**Default**: Enabled  
**Hook Type**: Pre-commit  
**Performance Impact**: Low

### Purpose
Ensure prompts to Claude include conciseness directives to prevent verbose responses.

### Problem It Solves
Claude tends to provide overly long explanations unless specifically constrained, wasting tokens and time.

### Implementation
```bash
# Check AI instruction files for conciseness directives
AI_FILES=".cursorrules .clinerules CLAUDE.md PROJECT-CONTEXT.md"
for file in $AI_FILES; do
  if [ -f "$file" ] && ! grep -q "CONCISE\|concise\|brief" "$file"; then
    echo "⚠️  $file should include conciseness directives"
    echo "   Add: 'BE CONCISE' or 'Give direct answers only'"
    exit 1
  fi
done
```

---

## RULE-LLM-003: Claude Thinking Mode Triggers

**Category**: LLM-Specific  
**Complexity**: Advanced  
**Default**: Disabled  
**Hook Type**: Pre-commit  
**Performance Impact**: Low

### Purpose
Remind developers to use Claude's thinking mode triggers for complex problems.

### Problem It Solves
Claude has enhanced reasoning modes that need specific triggers ("think", "think hard", "ultrathink") for optimal performance on complex tasks.

### Implementation
```bash
# Check for complex code patterns that might benefit from thinking mode
COMPLEX_PATTERNS="algorithm|architecture|refactor|optimize|design pattern"
if git diff --cached | grep -E "$COMPLEX_PATTERNS" > /dev/null 2>&1; then
  echo "💡 Complex task detected. Consider using Claude thinking triggers:"
  echo "   - 'think' for moderately complex problems"
  echo "   - 'think hard' for very complex problems"
  echo "   - 'ultrathink' for maximum reasoning capability"
fi
```

---

## RULE-LLM-004: Claude Context Window Management

**Category**: LLM-Specific  
**Complexity**: Advanced  
**Default**: Enabled  
**Hook Type**: Pre-commit  
**Performance Impact**: Low

### Purpose
Prevent context window overflow in Claude conversations by monitoring file sizes.

### Problem It Solves
Claude has limited context windows (30K-100K tokens). Large files or too many files can cause context overflow and degraded performance.

### Implementation
```bash
# Check for large files that might overflow context
MAX_FILE_SIZE=50000  # ~12K tokens
for file in $(git diff --cached --name-only); do
  if [ -f "$file" ] && [ $(wc -c < "$file") -gt $MAX_FILE_SIZE ]; then
    echo "⚠️  Large file detected: $file"
    echo "   Consider splitting or summarizing for Claude"
    exit 1
  fi
done
```

---

## RULE-LLM-005: Claude Artifact Generation

**Category**: LLM-Specific  
**Complexity**: Basic  
**Default**: Disabled  
**Hook Type**: Post-commit  
**Performance Impact**: Low

### Purpose
Track when Claude generates artifacts and ensure they're properly integrated.

### Problem It Solves
Claude can generate standalone "artifacts" (complete files, scripts, configs) that need proper integration into the project.

### Implementation
```bash
# Log artifact generation for tracking
if git log -1 --pretty=%B | grep -i "claude.*artifact\|artifact.*claude" > /dev/null; then
  echo "📄 Claude artifact detected in commit"
  echo "   Ensure proper testing and integration"
  # Log to artifact tracking file
  echo "$(date): Artifact in commit $(git rev-parse HEAD)" >> .vibe-codex/claude-artifacts.log
fi
```