# AI Development: Context Preservation Rules

## RULE-AI-001: Project Context Alignment

**Category**: AI Development  
**Complexity**: Advanced  
**Default**: Disabled  

### Description
Ensures all AI-generated code aligns with project context and prevents reward hacking.

### Requirements
1. **Context Document**: Maintain PROJECT-CONTEXT.md with:
   - Core purpose ("WHY")
   - Success criteria
   - Anti-patterns to avoid
   - Project values

2. **Issue Alignment**: Every issue must have:
   - Acceptance criteria tied to project context
   - Clear connection to project goals
   - Justification if seemingly unrelated

3. **Commit Validation**: Pre-commit checks that:
   - Changes address linked issue
   - Issue supports project context
   - No drift from core purpose

### Example Context Check
```
Q: "How does this change support the project's core purpose?"
A: Must provide clear connection or reconsider change
```

### Configuration
```json
{
  "id": "ai-001",
  "context_file": "PROJECT-CONTEXT.md",
  "enforce_level": "strict",
  "require_justification": true
}
```

---

## RULE-AI-002: AI Agent Coordination

**Category**: AI Development  
**Complexity**: Advanced  
**Default**: Disabled  

### Description
Manages coordination between multiple AI agents or sessions to prevent conflicts and maintain consistency.

### Coordination Patterns
1. **Session Isolation**: Each AI session works on separate issue
2. **Clear Handoffs**: Document context when switching agents
3. **Conflict Prevention**: Check for overlapping work
4. **State Preservation**: Save context between sessions

### Required Documentation
- Current task state in issue comments
- Blockers and next steps
- Any assumptions made
- Partial implementations

### Implementation
- Git hooks check for concurrent modifications
- Issues track which agent is assigned
- Clear "handoff" protocol in issue comments

---

## RULE-AI-003: Reward Hacking Prevention

**Category**: AI Development  
**Complexity**: Advanced  
**Default**: Enabled  

### Description
Prevents AI from optimizing for wrong metrics or taking shortcuts that technically satisfy requirements but violate intent.

### Common Reward Hacking Patterns
1. **Over-Simplification**: Reducing features to meet "simple" requirement
2. **Metric Gaming**: Optimizing coverage by adding trivial tests
3. **Literal Interpretation**: Following letter but not spirit of requirement
4. **Scope Creep**: Adding unrequested "improvements"

### Prevention Strategies
1. **Intent Validation**: Check if solution matches intended outcome
2. **Anti-Pattern Detection**: Flag suspicious patterns
3. **Human Review Gates**: Require review for certain changes
4. **Context Anchoring**: Regular checks against project goals

### Example Checks
```javascript
// Detects trivial test additions
if (newTests.all(test => test.length < 3)) {
  warn("Tests appear trivial - ensure meaningful coverage");
}

// Detects feature removal disguised as "simplification"
if (deletedLines > addedLines * 2) {
  warn("Large deletion - ensure features aren't being removed");
}
```

---

## RULE-AI-004: Context Window Management

**Category**: AI Development  
**Complexity**: Advanced  
**Default**: Disabled  

### Description
Optimizes for AI context windows by enforcing modular code and clear boundaries.

### Patterns
1. **File Size Limits**: Keep files under 500 lines
2. **Single Responsibility**: One concept per file
3. **Clear Interfaces**: Well-defined module boundaries
4. **Documentation Proximity**: Keep docs near code

### Benefits
- AI can understand complete modules
- Reduces context switching
- Improves suggestion quality
- Enables better refactoring

### Configuration
```json
{
  "id": "ai-004",
  "max_file_lines": 500,
  "max_function_lines": 50,
  "require_module_docs": true
}
```