# Basic Security Rules

## RULE-SEC-001: No Secrets in Code

**Category**: Security  
**Complexity**: Basic  
**Default**: Enabled  

### Description
Prevents committing secrets, API keys, passwords, or other credentials to the repository.

### What it catches
- Patterns like `password = "secret123"`
- API keys: `api_key = "sk-..."`
- Tokens: `token = "ghp_..."`
- Private keys and certificates
- AWS credentials
- Database connection strings with passwords

### Implementation
Pre-commit hook that scans staged files for common secret patterns.

### Configuration
```json
{
  "id": "sec-001",
  "patterns": [
    "password\\s*=\\s*[\"'][^\"']+[\"']",
    "api_key\\s*=\\s*[\"'][^\"']+[\"']",
    "secret\\s*=\\s*[\"'][^\"']+[\"']",
    "private_key",
    "BEGIN RSA PRIVATE KEY"
  ],
  "exclude_paths": [".env.example", ".env.sample", "*.test.js"]
}
```

---

## RULE-SEC-002: Environment File Protection

**Category**: Security  
**Complexity**: Basic  
**Default**: Enabled  

### Description
Ensures environment files (.env) are never committed while requiring .env.example for documentation.

### What it enforces
- Blocks: `.env`, `.env.local`, `.env.production`
- Requires: `.env.example` with all variables documented
- Allows: `.env.example`, `.env.sample`, `.env.template`

### Implementation
- Pre-commit hook blocks actual env files
- Validation that .env.example exists and is complete

---

## RULE-SEC-003: No Private Repository References

**Category**: Security  
**Complexity**: Basic  
**Default**: Enabled  

### Description
Prevents including private repository references in public issues, PRs, or code.

### What it catches
- URLs like `github.com/company/internal-app`
- References to private npm packages
- Internal documentation links

### Why it matters
- Prevents information disclosure
- Maintains security boundaries
- Keeps public repos accessible

### Implementation
Pre-commit hook that scans for private repository patterns in code and markdown files.