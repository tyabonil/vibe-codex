# PROJECT CONTEXT: vibe-codex

## Core Purpose (WHY)

vibe-codex exists to help development teams - especially those using AI assistants - maintain code quality, security, and workflow consistency through automated git hooks and development rules. It evolved from cursor_rules, recognizing that AI coding assistants need guardrails to prevent reward hacking, context loss, and deviation from project goals.

The project aims to be a comprehensive, menu-driven tool that allows teams to select and configure rules and hooks appropriate to their needs - from simple security checks to complex AI development workflows.

## What Success Looks Like

- Developers can quickly install and configure appropriate rules/hooks for their project type
- AI assistants stay aligned with project goals and don't drift into reward hacking
- Code quality and security are enforced automatically
- Configuration is shareable and reproducible across teams
- Both simple and complex workflows are supported through opt-in selection

## Anti-Patterns to Avoid

- **Over-simplification**: Reducing to just "5 simple rules" when teams need comprehensive options
- **One-size-fits-all**: Forcing all users into the same workflow
- **Hidden complexity**: Making advanced features inaccessible
- **Loss of purpose**: Becoming "functional but useless" by forgetting why teams need these tools

## Project Values

1. **Flexibility through choice** - Menu-driven selection, not forced adoption
2. **Progressive complexity** - Simple by default, powerful when needed  
3. **AI-awareness** - Rules that understand how LLMs can drift from goals
4. **Reproducibility** - JSON configs that can be shared and version controlled
5. **Context preservation** - Ensuring work always ties back to project purpose