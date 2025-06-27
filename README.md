# cursor_rules

## 🚨 START HERE: A New, Streamlined Approach to AI-Powered Development

This repository has been refactored to provide a single, authoritative source of truth for both humans and LLMs, ensuring consistency and efficiency.

### **For Humans: The Source of Truth**
- **MANDATORY-RULES.md**: This is the complete, human-readable guide to all rules, including context, reasoning, and examples. **All rule changes should be made here.**

### **For LLMs: The Optimized Instruction Set**
- **RULES-LLM-OPTIMIZED.md**: This is the token-efficient, structured version of the rules, specifically designed for LLM consumption. **This file is auto-generated from `MANDATORY-RULES.md` and should not be edited directly.**

---

## 🧠 The New Philosophy: Single Source of Truth

The core principle of this refactor is to **eliminate rule duplication and ambiguity**. By maintaining a single source of truth (`MANDATORY-RULES.md`) and automating the generation of the LLM-optimized version, we ensure that our rules are always consistent and easy to maintain.

### **How It Works**
1.  **All rule changes are made in `MANDATORY-RULES.md`**. This file is designed for human readability and comprehension.
2.  The `scripts/build-optimized-rules.js` script is run to parse the human-readable rules and generate the `RULES-LLM-OPTIMIZED.md` file.
3.  LLMs are instructed to use `RULES-LLM-OPTIMIZED.md` as their primary instruction set.

This approach ensures that our rules are both comprehensive and efficient, providing the best of both worlds for human and AI collaboration.

---

## 🎯 Rule Philosophy - **≤7 Day Increments**

Break all work into manageable chunks that can be completed and deployed within a week.

### **Always Buildable States**
Every commit must result in working, deployable code.

### **Security First** 
Never commit secrets. Always use environment variables and secure deployment practices.

### **Autonomous Execution**
AI assistants should execute based on rules, not ask for permission when the path is clear.

---

## 🚀 Quick Implementation

1.  **For Humans:** Read and understand the rules in `MANDATORY-RULES.md`.
2.  **For LLMs:** Ingest and follow the rules in `RULES-LLM-OPTIMIZED.md`.
3.  **For Projects:** To use these rules in your own project, simply copy the `RULES-LLM-OPTIMIZED.md` file into your project's `.cursorrules` file.

---

## 💡 Rule Updates & Contributions

### **For AI Assistants:** 
**Autonomously create PRs** when you discover new generally-applicable patterns during interactions. This is **mandatory** per the user rules.

### **For Humans:** 
1.  Make all changes to `MANDATORY-RULES.md`.
2.  Run `node scripts/build-optimized-rules.js` to update the LLM-optimized version.
3.  Commit both files in your PR.

---

**Impact**: This new, streamlined approach transforms the repository from a collection of rules into a robust, maintainable, and highly efficient system for guiding AI assistants.