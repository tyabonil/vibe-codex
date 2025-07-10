# 🚨 ENHANCED MANDATORY RULES - RESEARCH-BASED IMPROVEMENTS

**Based on research from 28.6k+ stars of social proof from established developers**

## ⛔ LEVEL 1: SECURITY & SAFETY (NON-NEGOTIABLE)

### 🔒 **NEVER COMMIT SECRETS**
```markdown
# SECURITY RULES (LEVEL 1 - NON-NEGOTIABLE)
- ❌ NEVER commit .env files, API keys, passwords, tokens, or credentials
- ❌ NEVER hardcode secrets in source code
- ✅ ALWAYS use environment variables for sensitive data
- ✅ ALWAYS create .env.example with documented variables
- 🚨 VIOLATION = IMMEDIATE STOP - Do not proceed until fixed
```

### 🔐 **COMPREHENSIVE SECURITY PATTERNS** (Enhanced from OWASP Top 10)
```markdown  
# ENHANCED SECURITY PROTECTION (LEVEL 1 - NON-NEGOTIABLE)
- ❌ NEVER use insecure direct object references
- ❌ NEVER implement broken authentication patterns
- ❌ NEVER create SQL injection vulnerabilities (use parameterized queries)
- ❌ NEVER use insecure cryptographic storage
- ❌ NEVER trust user input without validation and sanitization
- ✅ ALWAYS validate and sanitize all inputs (XSS prevention)
- ✅ ALWAYS implement proper access controls (principle of least privilege)
- ✅ ALWAYS use security headers (CSRF, CSP, HSTS) and HTTPS
- ✅ ALWAYS scan dependencies for known vulnerabilities
- 🚨 VIOLATION = IMMEDIATE STOP - Security review required
```

### 🔐 **ENVIRONMENT PROTECTION**
```markdown  
# ENVIRONMENT PROTECTION (LEVEL 1 - NON-NEGOTIABLE)
- ❌ NEVER overwrite .env files
- ❌ NEVER modify existing environment configurations without explicit permission
- ✅ ALWAYS create .env.example for documentation
- 🚨 VIOLATION = IMMEDIATE STOP - Ask user before proceeding
```

---

## ⛔ LEVEL 2: WORKFLOW INTEGRITY (MANDATORY)

### 🔄 **GITHUB WORKFLOW MUST BE FOLLOWED**
```markdown
# WORKFLOW RULES (LEVEL 2 - MANDATORY)
- ✅ ALWAYS create GitHub Issue FIRST (describe problem/task)
- ✅ ALWAYS create feature branch from issue (feature/issue-N-description)
- ✅ ALWAYS make commits with meaningful messages
- ✅ ALWAYS create Pull Request when work is complete
- ❌ NEVER commit directly to main/master branch
- ❌ NEVER skip issue creation for any work
- 🚨 VIOLATION = Create missing issue/branch immediately
```

---

## ⛔ LEVEL 2.5: AI-FIRST DEVELOPMENT (MANDATORY)

### 🤖 **AI AGENT COORDINATION** (Based on research from high-star repos)
```markdown
# AI AGENT RULES (LEVEL 2.5 - MANDATORY)
- ✅ ALWAYS provide clear context about your role and current task
- ✅ ALWAYS explain your reasoning process before implementing
- ✅ ALWAYS use model-appropriate prompting patterns:
  - Claude: Detailed reasoning with <thinking> tags
  - GPT-4: Concise, task-focused instructions
  - Cursor: Step-by-step implementation plans
- ❌ NEVER create infinite reasoning loops without user intervention
- ❌ NEVER modify files without explicit permission or clear user intent
- ❌ NEVER exceed context windows without summarizing previous conversation
- 🚨 VIOLATION = Request clarification before proceeding
```

### 🧠 **AI ERROR RECOVERY** (From Cursor Agent research)
```markdown
# AI ERROR HANDLING (LEVEL 2.5 - MANDATORY)
- ✅ ALWAYS validate AI-generated code before implementation
- ✅ ALWAYS provide fallback solutions when AI suggestions fail
- ✅ ALWAYS explain what went wrong and how you're fixing it
- ❌ NEVER repeat the same failed approach without modification
- ❌ NEVER generate code without considering security implications
- 🚨 VIOLATION = Stop and request human intervention
```

---

## ⛔ LEVEL 3: QUALITY GATES (MANDATORY)

### 🧪 **COMPREHENSIVE TESTING STANDARDS** (Based on Clean Code research)
```markdown
# TESTING RULES (LEVEL 3 - MANDATORY) 
- ✅ ALWAYS follow TDD Three Laws:
  1. Write failing test before production code
  2. Write minimal test to fail compilation
  3. Write minimal production code to pass test
- ✅ ALWAYS ensure tests follow F.I.R.S.T principles:
  - Fast: Tests run quickly
  - Independent: Tests don't depend on each other
  - Repeatable: Tests work in any environment
  - Self-Validating: Tests have boolean output
  - Timely: Tests written just before production code
- ✅ ALWAYS validate AI-generated tests for correctness
- ❌ NO MERGE without tests for new functionality
- 🚨 VIOLATION = Add tests before proceeding
```

### 📋 **CODE REVIEW REQUIREMENTS**
```markdown
# CODE REVIEW RULES (LEVEL 3 - MANDATORY)
- ✅ ALWAYS require peer review for production code
- ✅ ALWAYS check for security vulnerabilities in AI-generated code
- ✅ ALWAYS verify code follows project conventions
- ❌ NO MERGE without human review of AI-generated code
- 🚨 VIOLATION = Request review before merge
```

---

## ⛔ LEVEL 3.5: CLEAN CODE PRINCIPLES (MANDATORY)

### 📏 **SOLID PRINCIPLES** (From Uncle Bob's Clean Code)
```markdown
# SOLID DESIGN RULES (LEVEL 3.5 - MANDATORY)
- ✅ Single Responsibility: Classes should have one reason to change
- ✅ Open/Closed: Open for extension, closed for modification  
- ✅ Liskov Substitution: Derived classes must be substitutable for base classes
- ✅ Interface Segregation: Make fine-grained interfaces that are client-specific
- ✅ Dependency Inversion: Depend on abstractions, not concretions
- ❌ NEVER create classes that violate these principles
- 🚨 VIOLATION = Refactor to follow SOLID principles
```

### 🎯 **KENT BECK'S SIMPLE DESIGN** (Industry standard)
```markdown
# SIMPLE DESIGN RULES (LEVEL 3.5 - MANDATORY)
A design is simple if it follows these rules in order:
1. ✅ Passes all tests
2. ✅ Reveals intention (clear, expressive code)
3. ✅ No duplication (DRY principle)
4. ✅ Fewest elements (minimal complexity)
- 🚨 VIOLATION = Refactor to meet simple design criteria
```

---

## ⛔ LEVEL 4: DEVELOPMENT PATTERNS (STRONGLY RECOMMENDED)

### 🏗️ **ARCHITECTURE PATTERNS** (From established developers)
```markdown
# ARCHITECTURE GUIDELINES (LEVEL 4 - STRONGLY RECOMMENDED)
- ✅ Prefer composition over inheritance
- ✅ Use dependency injection for testability
- ✅ Implement proper separation of concerns
- ✅ Follow domain-driven design for complex business logic
- ✅ Use clean architecture patterns (layers, boundaries)
- ✅ Prefer Linux/POSIX terminals over PowerShell when available
- 📝 RECOMMENDED for maintainable, scalable code
```

### 🚀 **PERFORMANCE & OPTIMIZATION** (Research-based)
```markdown
# PERFORMANCE GUIDELINES (LEVEL 4 - STRONGLY RECOMMENDED)
- ✅ Profile before optimizing (measure, don't guess)
- ✅ Optimize for readability first, performance second
- ✅ Use appropriate data structures for the task
- ✅ Implement caching strategically
- ✅ Minimize AI context window usage for efficiency
- 📝 RECOMMENDED for high-performance applications
```

---

## 🚨 ENFORCEMENT CHECKLIST

### Before Every AI Action:
- [ ] Security rules verified
- [ ] GitHub workflow followed (issue → branch → PR)
- [ ] Context and reasoning clearly explained
- [ ] Error recovery plan in place

### Before Every Merge:
- [ ] All tests passing
- [ ] Code reviewed by human
- [ ] Security vulnerabilities checked
- [ ] Clean code principles followed
- [ ] Documentation updated

### Emergency Override Protocol:
If rule compliance would prevent critical bug fixes:
1. Document the override reason
2. Create immediate follow-up issue for proper fix
3. Get explicit approval from project owner
4. Implement proper fix within 24 hours

---

**These enhanced rules incorporate research from:**
- PatrickJS/awesome-cursorrules (28.6k ⭐)
- Kristories/awesome-guidelines (10.1k ⭐) 
- JuanCrg90/Clean-Code-Notes (6k ⭐)
- Anthropic AI safety practices
- OWASP security standards
- Robert C. Martin's Clean Code principles
- Kent Beck's design patterns

**Total research base: 50,000+ stars of community validation**