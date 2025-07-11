# Basic Documentation Rules

## RULE-DOC-001: README Required

**Category**: Documentation  
**Complexity**: Basic  
**Default**: Enabled  

### Description
Ensures project has a README file with minimum required sections.

### Required Sections
- Project title and description
- Installation instructions
- Usage examples
- License information

### Implementation
Pre-commit check that validates README.md exists and contains required sections.

### Configuration
```json
{
  "id": "doc-001",
  "required_sections": [
    "## Installation",
    "## Usage",
    "## License"
  ],
  "min_length": 100
}
```

---

## RULE-DOC-002: Code Comments for Complex Logic

**Category**: Documentation  
**Complexity**: Basic  
**Default**: Disabled  

### Description
Requires comments for complex functions and logic.

### What triggers requirement
- Functions longer than 20 lines
- Cyclomatic complexity > 10
- Regular expressions
- Complex algorithms

### Example
```javascript
// ✅ Good: Complex logic explained
// Calculate compound interest using the formula A = P(1 + r/n)^(nt)
// where P = principal, r = rate, n = compounds per period, t = time
function calculateCompoundInterest(principal, rate, compounds, time) {
  // ... implementation
}

// ❌ Bad: Complex regex with no explanation
const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
```

---

## RULE-DOC-003: Update Documentation with Code

**Category**: Documentation  
**Complexity**: Basic  
**Default**: Enabled  

### Description
When changing functionality, corresponding documentation must be updated.

### What it checks
- API changes require API doc updates
- New features require README updates
- Breaking changes require migration guide
- Configuration changes require config doc updates

### Implementation
Pre-commit hook that checks if code changes have corresponding doc changes when needed.