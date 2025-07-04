# MANDATORY Rules

This repository contains a set of rules for AI-powered development that are designed to be both comprehensive and efficient. The rules are divided into two main parts:

-   **`MANDATORY-RULES.md`**: This is the complete, human-readable guide to all rules, including context, reasoning, and examples.
-   **`RULES-LLM-OPTIMIZED.md`**: This is the token-efficient, structured version of the rules, specifically designed for LLM consumption.

## Installation

To install the rules, simply run the following command:

```bash
bash hooks/install-rule-checker.sh
```

This will install the necessary git hooks to enforce the rules locally.

## Usage

Once the hooks are installed, they will run automatically before each commit and when you edit a commit message.

### **`pre-commit` Hook**

This hook runs before you type a commit message. It performs the following checks:

-   **PR Health Check**: Checks for stale pull requests and compliance violations.
-   **Security Pre-Commit**: Scans for secrets in your staged files.

If any of these checks fail, the commit will be aborted.

### **`commit-msg` Hook**

This hook runs after you have entered a commit message. It validates that your commit message follows the Conventional Commits specification.

If your commit message is not valid, the commit will be aborted.

## Contributing

Contributions are welcome! Please see the [contribution guidelines](./PULL_REQUEST.md) for more information.
