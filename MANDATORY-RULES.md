# MANDATORY RULES

These are the core development rules enforced by vibe-codex.

## 🔒 Security Rules

1. **NO SECRETS IN CODE**
   - Never commit API keys, passwords, or tokens
   - Use environment variables for sensitive data
   - Add `.env` to `.gitignore`

2. **DEPENDENCY SECURITY**
   - Regularly update dependencies
   - Run security audits before deployment
   - Review dependency licenses

## 🔄 Workflow Rules

3. **GIT WORKFLOW**
   - Create an issue before starting work
   - Use descriptive branch names: `type/issue-number-description`
   - Create PR early and request reviews
   - Keep commits atomic and well-described

4. **CODE QUALITY**
   - Write tests for new features
   - Maintain documentation
   - Follow project code style
   - Remove debug code before committing

## 📋 Project Standards

5. **DOCUMENTATION**
   - Keep README.md up to date
   - Document breaking changes
   - Include examples for complex features
   - Update changelog for releases

6. **TESTING**
   - Aim for >80% test coverage
   - Test edge cases
   - Run tests before pushing
   - Fix failing tests immediately

## 🚀 Deployment Rules

7. **PRE-DEPLOYMENT**
   - All tests must pass
   - No console.log in production code
   - Security scan must pass
   - Documentation must be current

8. **RELEASE PROCESS**
   - Tag releases semantically
   - Update CHANGELOG.md
   - Test in staging first
   - Announce breaking changes

---

These rules are enforced automatically by vibe-codex git hooks and validation commands.