# 🤖 LLM-Specific Rules and Behavioral Patterns

## Overview
This directory contains specialized rules for different Large Language Models (LLMs) used in agentic coding workflows. Each LLM has unique behaviors, strengths, weaknesses, and idiosyncrasies that require tailored approaches.

## 📋 Available LLM Rule Sets

### 🔷 [Claude (Anthropic)](./claude-anthropic-rules.md)
**Best For**: Complex reasoning, architecture decisions, large codebase analysis
- **Key Issues**: Over-cautious safety refusals, extreme verbosity, context management
- **Critical Triggers**: Think modes, conciseness constraints, educational framing
- **Success Pattern**: Planning + reasoning tasks, security analysis

### 🔷 [GPT-4/OpenAI Models](./gpt4-openai-rules.md)
**Best For**: Balanced performance, when speed matters over perfection
- **Key Issues**: Context window confusion, recent model degradation, outdated SDKs
- **Critical Warnings**: o4-mini-high and o3 significantly degraded, avoid for complex tasks
- **Success Pattern**: Iterative development, simple to moderate complexity

### 🔷 [Cursor AI](./cursor-ai-rules.md)
**Best For**: IDE integration, multi-file refactoring, rapid prototyping
- **Key Issues**: Autocomplete clutter, function hallucination, model selection impact
- **Critical Configuration**: @-symbols for context, .cursorrules setup, MCP integration
- **Success Pattern**: Project-wide development, context-aware suggestions

### 🔷 [GitHub Copilot](./github-copilot-rules.md)
**Best For**: Boilerplate generation, common patterns, learning assistance
- **Key Issues**: 40% security vulnerability rate, logical vs syntactic correctness
- **Critical Warning**: NEVER accept security code without manual review
- **Success Pattern**: Standard patterns with thorough testing and security scanning

### 🔷 [Cline (VS Code Extension)](./cline-rules.md)
**Best For**: Model flexibility, complex multi-phase projects, cost optimization
- **Key Issues**: Model-agnostic quality variance, manual context management, over-autonomy
- **Critical Setup**: API key management, model routing, step-by-step confirmation
- **Success Pattern**: Human-in-the-loop workflows with model specialization

## 🎯 Quick Reference: When to Use Which LLM

| Task Type | Primary Choice | Alternative | Avoid |
|-----------|---------------|-------------|-------|
| **Architecture Planning** | Claude (think mode) | GPT-4 | Copilot, o4-mini-high |
| **Security Analysis** | Claude (educational framing) | Manual review | Copilot (40% vuln rate) |
| **Large Codebase Refactoring** | Cursor AI (@-symbols) | Cline (multi-model) | GPT-4 (context limits) |
| **Simple Syntax Fixes** | GPT-4o | Copilot (with review) | Claude (too verbose) |
| **Learning New Frameworks** | Cursor AI (with MCP) | Copilot | GPT-4 (outdated knowledge) |
| **Cost-Sensitive Development** | Cline (model routing) | GPT-3.5-turbo | GPT-4 (expensive) |
| **Real-time Autocomplete** | Cursor AI | Copilot | Cline (too much overhead) |
| **Multi-language Projects** | Cursor AI (rules) | Cline (model selection) | Single-model tools |

## 🚨 Universal LLM Safety Rules

Regardless of which LLM you're using, ALWAYS follow these safety protocols:

### 🔴 Level 1: STOP - Security Critical
- **NEVER** accept security-related code without manual review
- **NEVER** use LLM-generated code for authentication/authorization without testing
- **NEVER** trust LLM suggestions for cryptographic implementations
- **ALWAYS** run SAST tools on any generated code before production

### 🟡 Level 2: Mandatory Verification
- **ALWAYS** test edge cases and error conditions
- **ALWAYS** verify function/API existence before using
- **ALWAYS** check for logical correctness, not just syntactic correctness
- **ALWAYS** review for project architectural compliance

### 🟢 Level 3: Best Practices
- **Document** which LLM generated which code for debugging
- **Version control** before accepting large LLM changes
- **Monitor** costs and usage patterns across different models
- **Experiment** with different models for different task types

## 📊 LLM Comparison Matrix

| Feature | Claude | GPT-4 | Cursor AI | Copilot | Cline |
|---------|--------|-------|-----------|---------|-------|
| **Context Window** | Large (200k) | Medium* (60k usable) | Medium (project-aware) | Small (local files) | Variable (by model) |
| **Security Awareness** | High (sometimes over-cautious) | Medium | Medium | Low (40% vuln rate) | Variable (by model) |
| **Code Quality** | High (verbose) | Medium-High | High (with setup) | Medium (needs review) | Variable (by model) |
| **Setup Complexity** | Low | Low | Medium | Low | High |
| **Cost** | Medium-High | Medium-High | Subscription | Subscription | Variable |
| **Model Flexibility** | No | No | Limited | No | High |
| **Real-time Support** | No | No | Yes | Yes | No |
| **IDE Integration** | Limited | Limited | Deep | Deep | VS Code only |

*GPT-4 context limits are significantly lower than advertised

## 🔧 Implementation Strategies

### 1. Single-LLM Workflow
Choose one LLM and optimize entirely around its strengths:
```markdown
Example: Claude-focused workflow
- Use Claude for all reasoning and planning
- Configure for conciseness and educational framing
- Implement thinking triggers throughout
- Manual security review for all outputs
```

### 2. Multi-LLM Workflow
Use different LLMs for different phases:
```markdown
Example: Specialized workflow
- Planning: Claude (think hard mode)
- Implementation: Cursor AI (with project context)
- Review: Manual security analysis
- Documentation: GPT-4o (speed focused)
```

### 3. Hybrid Workflow
Combine LLM assistance with traditional development:
```markdown
Example: Safety-first hybrid
- LLM for boilerplate and ideation
- Manual implementation of critical logic
- Automated testing and security scanning
- Human oversight at all decision points
```

## 📚 Learning Resources

### Essential Reading
1. **Security Research**: Review studies on LLM code generation vulnerabilities
2. **Model Documentation**: Read official docs for your chosen LLM(s)
3. **Community Patterns**: Follow LLM-specific communities and forums
4. **Academic Papers**: Stay updated on LLM coding capabilities research

### Hands-On Learning
1. **Benchmark Testing**: Test your chosen LLM on your specific use cases
2. **Security Testing**: Run SAST tools on generated code samples
3. **Cost Analysis**: Track actual costs vs productivity gains
4. **Team Adoption**: Document lessons learned for team knowledge sharing

## 🔄 Keeping Rules Updated

These rules are based on 2025 research and community findings. LLM capabilities evolve rapidly:

- **Monthly**: Review new model releases and capability updates
- **Quarterly**: Re-evaluate model selection for different task types  
- **Annually**: Conduct comprehensive security and cost analysis
- **Continuously**: Document new patterns and anti-patterns discovered

## 🤝 Contributing to These Rules

Found new patterns or issues? Contribute improvements:

1. **Create Issue**: Document the specific LLM behavior observed
2. **Research**: Gather evidence and examples
3. **Test**: Validate mitigation strategies
4. **Document**: Follow the established pattern format
5. **Submit PR**: Include examples and verification steps

---

*Last Updated: Based on LLM behavior analysis through 2025*
*Next Review: Quarterly update cycle*