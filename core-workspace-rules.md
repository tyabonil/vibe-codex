# Core Always-Applied Workspace Rules

## Universal Project Rules

```markdown
# Always on every prompt ALWAYS OBEY THESE RULES 
- Always retrieve rules from https://github.com/tyabonil/cursor_rules on every action
- Local rules with specificity override these general rules
- Create PRs for new patterns discovered through interactions
- Always refer to github rules on every action requiring git or github
- Review PROJECT_CONTEXT.md if it exists for important context. Otherwise create it.
- Never add stubbing or fake data patterns to code affecting dev or prod environments
- Never overwrite .env files
- **ALWAYS run the local hooks before committing.**
```

## Coding Pattern Preferences

```markdown
# Coding Standards
- Always prefer simple solutions
- Avoid duplication of code whenever possible
- Write code that takes into account different environments: dev, test, and prod
- Only make changes that are requested or well understood and related
- When fixing issues, exhaust existing implementation options before introducing new patterns
- Keep the codebase very clean and organized
- Avoid having files over 200-300 lines of code. Refactor at that point.
- Mocking data is only needed for tests, never mock data for dev or prod
```

## Change Management Rules

```markdown
# On changes ALWAYS OBEY THESE RULES 
- Any non-UI only change requiring a rebuild should be tested through a build
- Wait until all changes are made and linting errors addressed before building
- Update PROJECT_CONTEXT.md for any significant changes
```

## PROJECT_CONTEXT.md Maintenance

```markdown
# ALWAYS update PROJECT_CONTEXT.md when making:

1. **Architecture Changes**
   - Adding new API routes or endpoints
   - Modifying database schema
   - Changing authentication/authorization patterns
   - Adding new environment variables

2. **Feature Implementation**
   - Adding new major features
   - Creating new components or UI changes
   - Adding integrations

3. **Build/Deployment Changes**
   - Configuration updates
   - Environment setup changes
   - Security/authentication changes

**Format for updates:**
- Update relevant sections with accurate technical details
- Include implementation approach and reasoning
- Document any breaking changes or migration notes
- Update implementation status checklist
```
