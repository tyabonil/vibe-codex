# MANDATORY Rules - Local Hooks

## 🎯 Overview

A set of pre-commit and commit-msg hooks that validate every commit against the MANDATORY-RULES.md, providing comprehensive feedback and blocking critical violations.

## 🏗️ Architecture

### Core Components

1.  **`pre-commit` Hook**:
    -   **`pr-health-check.sh`**: Checks for stale pull requests and compliance violations.
    -   **`security-pre-commit.sh`**: Scans for secrets in your staged files.
2.  **`commit-msg` Hook**:
    -   **`commit-msg-validator.sh`**: Validates that your commit message follows the Conventional Commits specification.
3.  **`config/rules.json`**:
    -   A configuration file that allows you to customize the behavior of the hooks.

## 🚀 Features

### **`pre-commit` Hook**

-   ✅ **PR Health Check**: Checks for stale pull requests and compliance violations.
-   ✅ **Security Pre-Commit**: Scans for secrets in your staged files.
-   ✅ **Immediate Blocking**: No commit allowed for violations.

### **`commit-msg` Hook**

-   ✅ **Conventional Commits**: Enforces the Conventional Commits specification.
-   ✅ **Immediate Blocking**: No commit allowed for invalid commit messages.

## 📋 Setup Instructions

### For This Repository (cursor_rules)

The hooks are already included in this repository. To install them, run the following command:

```bash
curl -sSL https://raw.githubusercontent.com/tyabonil/cursor_rules/main/install-rule-checker.sh | bash
```

### For Other Repositories

1.  **Copy the `hooks` directory** to your repository.
2.  **Run the `install-rule-checker.sh` script**:
    ```bash
    ./hooks/install-rule-checker.sh
    ```

## 🔧 Configuration

### Rule Customization

Edit `config/rules.json` to customize:

-   Rule patterns and thresholds
-   Severity levels (BLOCKER/MANDATORY/RECOMMENDED)
-   Repository-specific settings

## 🧪 Testing

The hooks are tested via the `tests` directory. To run the tests, use the following command:

```bash
npm test
```

---

**This implementation ensures 100% compliance with MANDATORY-RULES.md and provides comprehensive feedback for all rule violations.**
