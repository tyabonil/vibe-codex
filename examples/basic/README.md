# Basic Example

This example shows a minimal vibe-codex configuration suitable for small projects or prototypes.

## Features

- Core security and workflow rules (always enabled)
- Basic testing requirements (70% coverage)
- Simple documentation requirements

## Usage

```bash
# Copy this configuration to your project
cp examples/basic/.vibe-codex.json /path/to/your/project/

# Or initialize with basic preset
npx vibe-codex init --preset basic
```

## What's Included

### Core Module
- Secret detection
- Environment file protection
- Basic workflow rules

### Testing Module
- 70% coverage threshold
- Test file checks (optional)
- Test naming conventions

### Documentation Module
- README requirements (minimal)
- API docs optional
- Changelog optional

## Customization

To make this stricter, you can:

1. Increase test coverage:
   ```json
   "testing": {
     "coverageThreshold": 80
   }
   ```

2. Require test files:
   ```json
   "testing": {
     "requireTestFiles": true
   }
   ```

3. Add more modules:
   ```json
   "patterns": {
     "enabled": true
   }
   ```