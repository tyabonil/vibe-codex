# 🤖 Cursor AI - Specific Rules and Idiosyncrasies

## Overview
This document outlines the rules and best practices for using Cursor AI in a development workflow. For a more comprehensive guide to Cursor, please see the [official documentation](https://cursor.sh/docs).

## 🚨 Critical Rules

- **Context is Key**: Always use `@` symbols to provide context to the AI. Use `@file` for single files, `@folder` for directories, and `@code` for specific symbols.
- **Verify, Then Trust**: Never blindly accept suggestions from the AI. Always verify that the suggested code is correct and follows project conventions.
- **Configure for Your Workflow**: Customize the autocomplete delay, suggestion length, and other settings to fit your personal workflow.
- **Use the Right Tool for the Job**: Use Cursor for what it's good at (multi-file refactoring, project-wide code generation) and use other tools for what it's not (simple syntax fixes, security-sensitive code review).

## 🚫 Anti-Patterns to Avoid

- **Never** rely on autocomplete for critical logic without verification.
- **Never** accept suggestions for functions you haven't verified exist.
- **Never** ignore context management - always use `@` symbols when specific.
- **Never** use default settings without optimization for your workflow.
- **Never** let autocomplete interfere with your natural typing patterns.
