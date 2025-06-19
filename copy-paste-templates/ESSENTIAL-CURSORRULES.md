# Essential .cursorrules Template - Copy This Exactly

**This is the simplified, essential version focusing on the most critical rules that LLMs must follow.**

```markdown
# 🚨 LEVEL 1: SECURITY (NON-NEGOTIABLE)
- ❌ NEVER commit .env files, API keys, passwords, or secrets
- ❌ NEVER overwrite existing .env files  
- ✅ ALWAYS use environment variables for sensitive data
- 🚨 STOP IMMEDIATELY if about to violate - ask user first

# 🚨 LEVEL 2: WORKFLOW (MANDATORY)  
- ✅ ALWAYS use mcp_github_* tools instead of terminal git commands
- ✅ IMMEDIATELY assign blocked issues to repository owner
- ✅ CREATE issues for all work (≤7 days each)
- ✅ NEVER attempt infrastructure/DevOps work - assign to user

# 🚨 LEVEL 3: QUALITY (MANDATORY)
- ✅ 100% test coverage required for ALL new code
- ✅ ALL Copilot review feedback MUST be addressed before merge
- ✅ UPDATE PROJECT_CONTEXT.md for any significant changes

# 🔗 RULE RETRIEVAL (MANDATORY)
- ✅ ALWAYS retrieve latest rules from https://github.com/tyabonil/cursor_rules
- ✅ Compare with local rules - local specificity overrides general rules
- ✅ AUTONOMOUSLY create PRs for new generally-applicable rules discovered

# 📝 BASIC STANDARDS
- ✅ Prefer simple solutions, avoid code duplication
- ✅ Files ≤200-300 lines, environment-aware code
- ✅ Never merge to main/master - use preview branch
- ✅ Branch naming: feature/issue-{number}-{description}
```

## 🚀 Quick Setup Steps

1. **Copy the above rules** to your `.cursorrules` file
2. **Create PROJECT_CONTEXT.md** in your repository root
3. **Verify MCP GitHub API access** is working
4. **Create preview branch** if it doesn't exist
5. **Review MANDATORY-RULES.md** for complete details

## ⚡ Emergency Checklist

**Before ANY action, verify:**
- [ ] Not committing secrets? (STOP if yes)
- [ ] Not overwriting .env? (ASK if yes)  
- [ ] Using MCP GitHub API? (REQUIRED)
- [ ] Is work blocked? (ASSIGN if yes)
- [ ] Issue exists? (CREATE if no)
- [ ] Tests written? (REQUIRED)
- [ ] Copilot feedback addressed? (REQUIRED)

## 🎯 Success Indicators

- ✅ 0 security incidents
- ✅ 0 workflow tool failures  
- ✅ 100% issue tracking
- ✅ 100% test coverage
- ✅ 100% review compliance

---

**For complete rules, see MANDATORY-RULES.md**

This essential template ensures the most critical rules are impossible to miss while keeping complexity manageable for quick adoption.