# 🚀 Quick Install - MANDATORY Rules Checker

## ⚡ One-Command Installation

Install the MANDATORY Rules compliance checker in any repository:

```bash
curl -sSL https://raw.githubusercontent.com/tyabonil/cursor_rules/main/install-rule-checker.sh | bash
```

## 🔧 Quick Setup

1. **Run Installation**:
   ```bash
   curl -sSL https://raw.githubusercontent.com/tyabonil/cursor_rules/main/install-rule-checker.sh | bash
   ```

2. **Configure Permissions**:
   - Go to repository **Settings → Actions → General**
   - Set **Workflow permissions** to "Read and write permissions"

3. **Test Installation**:
   ```bash
   git checkout -b test/rule-checker
   echo "# Test" > test.md
   git add test.md && git commit -m "Test rule checker"
   git push -u origin test/rule-checker
   # Create PR and verify rule checker runs
   ```

## ✅ What Gets Installed

- **Centralized Workflow**: Automatically downloads latest rules from `tyabonil/cursor_rules`
- **No Local Copies**: Rules always pulled from central repository  
- **Auto-Updates**: Latest rule versions applied on every PR
- **Local Overrides**: Optional `.cursorrules` for repository-specific customization

## 🎯 Benefits

- ✅ **Consistent Rules**: All repos use same rule version
- ✅ **Zero Maintenance**: Rules update automatically
- ✅ **Centralized Control**: Update rules once, apply everywhere
- ✅ **Custom Overrides**: Repository-specific modifications when needed

## 📚 Full Documentation

- **Installation Guide**: [INSTALLATION.md](./INSTALLATION.md)
- **Rule Documentation**: [MANDATORY-RULES.md](./MANDATORY-RULES.md)
- **Rule Checker Details**: [README-RULE-CHECKER.md](./README-RULE-CHECKER.md)

## 🔐 Private Repositories

For private repos that need authentication to access central rules:

1. Create GitHub Personal Access Token with `Contents: Read` permission
2. Add as repository secret: `RULES_ACCESS_TOKEN`
3. Installation script automatically handles authentication

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/tyabonil/cursor_rules/issues)
- **Documentation**: [Complete Installation Guide](./INSTALLATION.md)
- **Examples**: [Test Repository Setup](./INSTALLATION.md#testing-your-installation)

---

**🎉 Your repository will enforce MANDATORY rules with centralized management in under 2 minutes!**