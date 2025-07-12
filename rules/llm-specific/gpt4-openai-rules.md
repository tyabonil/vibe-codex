# 🤖 GPT-4/OpenAI Models - Specific Rules and Idiosyncrasies

## Overview
GPT-4 family includes GPT-4, GPT-4o, o3, o4-mini variants. Known for speed but recent models have significant quality degradation issues and context management problems.

## 🚨 Critical GPT-4/OpenAI Issues to Handle

### 1. Context Window Confusion and Limits
**Issue**: Advertised context vs actual usable context are vastly different
```markdown
❌ GPT-4 PROBLEM:
- Claims 128k-200k context but often fails at 32k-80k tokens
- Output limited to 4k tokens despite large input context
- Recent models (o4-mini-high, o3) hit limits much earlier
- "Message too long" errors on previously working prompts

✅ MITIGATION RULES:
- Never exceed 60k tokens in single request
- Break large codebases into smaller chunks
- Use iterative refinement instead of massive context
- Monitor token usage actively
- Expect context failures and plan alternatives
```

### 2. Recent Model Degradation (2024-2025)
**Issue**: o4-mini-high and o3 significantly worse than predecessors
```markdown
❌ GPT-4 PROBLEM:
- o4-mini-high produces lower quality code than o3-mini-high
- High hallucination rates with newer models
- Code often formatted as diff with +/- markers
- Missing function implementations and variables
- Can't handle previously working 80k token prompts

✅ MITIGATION RULES:
- Avoid o4-mini-high and o3 for complex coding tasks
- Use GPT-4 or GPT-4o for critical work
- When forced to use new models, use much smaller prompts
- Always validate outputs more thoroughly
- Consider switching to alternative models for coding
```

### 3. Outdated Knowledge and SDK Issues
**Issue**: Training cutoffs cause major issues with recent library updates
```markdown
❌ GPT-4 PROBLEM:
- Uses deprecated Azure OpenAI v1 SDK instead of v2
- Suggests OpenAIClient instead of AzureOpenAIClient
- Outdated API patterns for major frameworks
- Wrong import statements for newer library versions

✅ MITIGATION RULES:
- Always verify import statements and SDK versions
- Include current documentation in prompts when possible
- Double-check API calls against latest docs
- Specify exact library versions in requests
- Use newest models (Grok-3) for latest SDK knowledge
```

### 4. Output Format Issues
**Issue**: Recent models produce unwanted formatting artifacts
```markdown
❌ GPT-4 PROBLEM:
- Adds +/- diff markers to regular code
- Produces incomplete code blocks
- Missing implementations with just comments
- Inconsistent code formatting

✅ MITIGATION RULES:
- Explicitly request: "Complete code only, no diff markers"
- Ask for: "Full implementation, no placeholders"
- Specify: "Plain code format, not git diff format"
- Verify all functions are fully implemented
```

### 5. Speed vs Accuracy Trade-off
**Issue**: GPT-4o optimized for speed often sacrifices coding accuracy
```markdown
❌ GPT-4o PROBLEM:
- Faster but less accurate than GPT-4
- Oversimplifies complex problems
- Misses architectural considerations
- Surface-level solutions that fail under testing

✅ MITIGATION RULES:
- Use GPT-4 for complex algorithms and architecture
- Use GPT-4o only for simple, well-defined tasks
- Always specify complexity requirements upfront
- Request explicit consideration of edge cases
```

## 🛠️ GPT-4 Specific Commands and Patterns

### Optimal GPT-4 Prompting Pattern:
```markdown
[VERSION] Using [specific model version]
[CONTEXT] [Minimal but relevant context - under 60k tokens]
[LIBRARY] Using [specific library/framework version]
[FORMAT] Complete code only, no diff markers
[REQUEST] [Specific action needed]
```

### Context Management Pattern:
```markdown
"Break this task into smaller parts. Start with [specific component].
Provide complete implementation for each part separately."
```

### SDK Version Override:
```markdown
"IMPORTANT: Use the latest [Library] v[X] API. 
The current patterns use [NewClass] instead of [OldClass].
Do not use deprecated [OldAPI] patterns."
```

## 🎯 When to Use GPT-4 vs Other Models

### Use GPT-4 (Classic) For:
- Complex algorithmic problems
- Architecture decisions requiring deep reasoning
- When accuracy matters more than speed
- Large refactoring tasks

### Use GPT-4o For:
- Simple syntax fixes
- Quick boilerplate generation
- Fast iteration cycles
- When speed matters more than perfection

### Avoid Recent Models (o4-mini-high, o3) For:
- Any complex coding tasks
- Large codebase analysis
- Production-critical code
- Tasks requiring high accuracy

## 🔧 Integration with Development Tools

### API Usage Patterns:
```python
# Correct current pattern for Azure OpenAI v2
from azure.ai.openai import AzureOpenAIClient
# NOT: from openai import OpenAIClient

client = AzureOpenAIClient(
    api_endpoint="your-endpoint",
    api_key="your-key"
)
```

### Token Management:
```bash
# Monitor token usage
echo "Estimated tokens: $(echo "$prompt" | wc -w | awk '{print $1*1.3}')"
```

## 🚫 GPT-4 Anti-Patterns to Avoid

1. **Never** trust recent model outputs without verification
2. **Never** use deprecated SDK patterns without checking
3. **Never** exceed 60k tokens in single request
4. **Never** assume speed optimized models are accurate
5. **Never** use diff-formatted output without cleaning

## 🎯 GPT-4 Success Patterns

1. **Always** specify exact library/framework versions
2. **Always** request complete implementations
3. **Always** verify SDK patterns against latest docs
4. **Always** use iterative approach for large tasks
5. **Always** test outputs more thoroughly than with other models

## 📝 GPT-4 Specific Workflow Template

```markdown
1. MODEL: [Specify exact GPT-4 variant to use]
2. VERSION: [Include library/framework versions]
3. CHUNK: [Break large tasks into <60k token pieces]
4. FORMAT: [Request specific output format]
5. VERIFY: [Double-check against current documentation]
6. TEST: [More thorough testing than usual]
```

## ⚠️ Critical Warnings for GPT-4 Usage

- **Recent Degradation**: Quality has significantly decreased in 2024-2025
- **Context Lies**: Advertised context windows are not reliable
- **SDK Obsolescence**: Training data contains outdated patterns
- **Speed vs Quality**: Faster models sacrifice accuracy significantly
- **Output Artifacts**: Recent models add unwanted formatting

*Updated: Based on GPT-4 family behavior patterns through 2025, including recent model degradation issues*