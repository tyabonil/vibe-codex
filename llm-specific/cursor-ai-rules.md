# 🤖 Cursor AI - Specific Rules and Idiosyncrasies

## Overview
Cursor is an AI-first IDE built on VS Code with deep AI integration. Known for powerful context management and autocomplete, but requires careful configuration to avoid "autocomplete clutter" and hallucination issues.

## 🚨 Critical Cursor AI Issues to Handle

### 1. Autocomplete Clutter and Over-Suggestion
**Issue**: Cursor's aggressive autocomplete can flood workspace with irrelevant suggestions
```markdown
❌ CURSOR PROBLEM:
- Suggestions pop up too frequently and eagerly
- Verbose suggestions when simple ones needed
- Interrupts natural coding flow
- Cognitive overload from constant suggestion evaluation

✅ MITIGATION RULES:
- Adjust suggestion frequency in Settings > Autocomplete
- Set delay to 300ms+ before suggestions appear
- Use manual completion (Ctrl/Cmd + Space) instead of automatic
- Limit max tokens/lines per completion to 10-20 lines
- Use "faded text" display mode for less intrusive suggestions
```

### 2. Context Window Management Problems
**Issue**: Cursor can hallucinate when context is insufficient or get overwhelmed with too much
```markdown
❌ CURSOR PROBLEM:
- Hallucinates functions/classes that don't exist in codebase
- Gets distracted by irrelevant context
- Makes suggestions that conflict with project architecture
- Limited context window causes incomplete understanding

✅ MITIGATION RULES:
- Use @-symbols for surgical context control
- @code for specific functions/symbols
- @file for specific files
- @folder for directory-level context
- Use Rules feature for long-term project memory
- Enable MCP for external context sources
```

### 3. Function and API Hallucination
**Issue**: Cursor invents functions, classes, or APIs that don't exist
```markdown
❌ CURSOR PROBLEM:
- Suggests non-existent library functions
- Creates phantom class methods
- Invents API endpoints that don't exist
- Assumes incorrect interfaces

✅ MITIGATION RULES:
- Always verify suggested function/class names exist
- Provide existing code examples in context
- Use @file to include relevant interface definitions
- Double-check imports and API calls
- Test suggestions before accepting
```

### 4. Model Selection Impact on Quality
**Issue**: Different underlying models produce vastly different quality results
```markdown
❌ CURSOR PROBLEM:
- Default model may not be optimal for task
- Model switching affects suggestion quality
- Some models better for specific languages/frameworks
- Performance vs accuracy trade-offs

✅ MITIGATION RULES:
- Experiment with different models for your use case
- Use GPT-4 for complex algorithms
- Use Claude for large codebase analysis
- Switch models based on task complexity
- Monitor which models work best for your patterns
```

### 5. Aggressive Tab Completion Interference
**Issue**: Tab completion can interfere with normal typing patterns
```markdown
❌ CURSOR PROBLEM:
- Tab completion triggers when not wanted
- Interrupts fast typing patterns
- Accepts unwanted suggestions accidentally
- Conflicts with existing muscle memory

✅ MITIGATION RULES:
- Customize tab completion keybindings
- Use Shift+Tab for auto-accept mode toggle
- Practice "reject liberally" mindset
- Configure visual indicators for pending suggestions
- Set up escape sequences to interrupt suggestions
```

## 🛠️ Cursor-Specific Optimization Patterns

### Optimal Context Management:
```markdown
@file [specific-file.ts] @code [SpecificFunction] 
"Update this function to handle [specific case]"
```

### Cursor Rules Configuration:
```markdown
// .cursorrules file example
You are an expert in [tech stack].
- Use 2 spaces for indentation
- Prefer functional programming patterns
- Always include error handling
- Follow [specific style guide]
```

### MCP Integration Setup:
```json
// .mcp.json for project-specific tools
{
  "mcpServers": {
    "docs": "path/to/docs-server",
    "api": "path/to/api-server"
  }
}
```

## 🎯 When to Use Cursor vs Other Tools

### Use Cursor For:
- Multi-file refactoring with context awareness
- Project-wide code generation
- Learning new codebases (codebase Q&A)
- Rapid prototyping with AI assistance
- When you need deep IDE integration

### Avoid Cursor For:
- Simple syntax fixes (too much overhead)
- When you need specific model control
- Security-sensitive code review
- When working offline
- Single-file focused tasks

## 🔧 Cursor Configuration Best Practices

### Essential Settings:
```markdown
Settings > General > Rules for AI:
- Include .cursorrules file: ✓
- Context window management: Optimized
- Model selection: Task-appropriate

Settings > Autocomplete:
- Delay: 300ms
- Max completion length: 20 lines
- Display mode: Faded text
- Manual trigger: Ctrl/Cmd + Space
```

### Project Setup Pattern:
```bash
# Create .cursorrules file
echo "You are an expert in $TECH_STACK" > .cursorrules

# Add project-specific MCP if needed
cat > .mcp.json << EOF
{
  "mcpServers": {
    "project-docs": "./docs-server"
  }
}
EOF
```

## 🚫 Cursor Anti-Patterns to Avoid

1. **Never** rely on autocomplete for critical logic without verification
2. **Never** accept suggestions for functions you haven't verified exist
3. **Never** ignore context management - always use @-symbols when specific
4. **Never** use default settings without optimization for your workflow
5. **Never** let autocomplete interfere with your natural typing patterns

## 🎯 Cursor Success Patterns

1. **Always** configure autocomplete delay and limits
2. **Always** use .cursorrules for project-specific behavior
3. **Always** verify suggested functions/APIs exist
4. **Always** use @-symbols for precise context control
5. **Always** experiment with different models for different tasks

## 📝 Cursor-Specific Workflow Template

```markdown
1. SETUP: Configure .cursorrules and settings for project
2. CONTEXT: Use @file/@code/@folder for precise context
3. MODEL: Select appropriate model for task complexity
4. SUGGEST: Allow suggestions but verify before accepting
5. ITERATE: Refine with feedback and adjust rules
6. OPTIMIZE: Update settings based on experience
```

## ⚡ Cursor Productivity Hacks

### Keyboard Shortcuts:
- `Ctrl/Cmd + L`: Select current line for AI editing
- `Ctrl/Cmd + K`: Open AI command palette
- `Shift + Tab`: Toggle auto-accept mode
- `Escape`: Interrupt AI suggestions
- `Ctrl/Cmd + /`: Toggle AI chat panel

### Rules Generation:
- Use `/Generate Cursor Rules` after long conversations
- Capture useful patterns in .cursorrules
- Share rules across team via version control

### Context Optimization:
- Use Tab completion for file references
- Provide URLs for external documentation
- Leverage MCP for internal tool integration

## ⚠️ Critical Warnings for Cursor Usage

- **Autocomplete Overload**: Default settings can be overwhelming
- **Context Confusion**: Poor context leads to hallucinated suggestions
- **Model Dependency**: Quality varies significantly by model choice
- **Verification Required**: Always verify suggestions before accepting
- **Setup Investment**: Requires configuration time for optimal results

*Updated: Based on Cursor AI behavior patterns and community best practices as of 2025*