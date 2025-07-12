# Issue #281: Improve review bot rules to handle wrapped console statements

## Goal
Update the review bot rules to intelligently detect when console statements are properly wrapped in environment checks, reducing false positives while maintaining code quality standards.

## Analysis

Current issues:
1. Bot flags ALL console statements as HIGH priority
2. Doesn't recognize environment-wrapped console statements
3. Doesn't understand CLI tools need console output
4. Creates noise that reduces the value of bot feedback

## Implementation Plan

1. [ ] Create helper function to detect wrapped console statements
2. [ ] Update hater-bot.js console detection logic
3. [ ] Add exceptions for CLI entry points
4. [ ] Test the improved detection
5. [ ] Update bot documentation

## Work Started
Beginning with analyzing the current console detection code in hater-bot.js.

## Changes Made

1. Enhanced console detection in `hater-bot.js`:
   - Added `findUnwrappedConsoleStatements()` helper method
   - Detects environment-wrapped console statements
   - Excludes CLI tools (bin/, *-cli.js)
   - Excludes logger utilities (files with 'logger' or 'log')
   - Excludes test files (.test., .spec., test/)
   - Only flags truly unwrapped console statements as HIGH severity
   - Excessive wrapped consoles (>10) flagged as MEDIUM severity

2. Testing confirmed:
   - Unwrapped consoles: Still flagged as HIGH
   - Wrapped consoles: Not flagged
   - CLI tools: Not flagged
   - Logger utilities: Not flagged

This reduces false positives while maintaining code quality standards.