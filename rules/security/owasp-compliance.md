# OWASP Security Compliance Rules

## RULE-OWASP-001: Input Validation (OWASP #3)

**Category**: Security  
**Complexity**: Advanced  
**Default**: Enabled  

### Description
Enforces comprehensive input validation to prevent injection attacks (SQL, NoSQL, OS, LDAP).

### Requirements
1. **Validate All Inputs**: Every user input must be validated
2. **Whitelist Approach**: Define allowed values, reject everything else  
3. **Parameterized Queries**: Never concatenate user input into queries
4. **Escape Output**: Context-appropriate escaping for all outputs

### Implementation Patterns
```javascript
// ✅ Good: Parameterized query
const user = await db.query('SELECT * FROM users WHERE id = ?', [userId]);

// ❌ Bad: String concatenation
const user = await db.query(`SELECT * FROM users WHERE id = ${userId}`);

// ✅ Good: Input validation
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ValidationError('Invalid email format');
  }
  return email.toLowerCase().trim();
}
```

### Checks
- No string concatenation in queries
- Input validation functions exist
- Sanitization libraries are used
- Output encoding is applied

---

## RULE-OWASP-002: Authentication & Session Management (OWASP #2)

**Category**: Security  
**Complexity**: Advanced  
**Default**: Enabled  

### Description
Enforces secure authentication and session management practices.

### Requirements
1. **Strong Password Policy**: Minimum complexity requirements
2. **Secure Session Tokens**: Cryptographically random, sufficient length
3. **Session Timeout**: Automatic timeout after inactivity
4. **Secure Transmission**: HTTPS only for auth data

### Implementation Checks
```javascript
// Check for weak session generation
if (code.includes('Math.random()') && code.includes('session')) {
  error('Use crypto.randomBytes() for session tokens, not Math.random()');
}

// Check for password storage
if (code.includes('password') && !code.includes('bcrypt', 'argon2', 'scrypt')) {
  error('Passwords must be hashed with bcrypt, argon2, or scrypt');
}
```

---

## RULE-OWASP-003: Sensitive Data Exposure Prevention (OWASP #6)

**Category**: Security  
**Complexity**: Advanced  
**Default**: Enabled  

### Description
Prevents exposure of sensitive data in logs, errors, or responses.

### What It Prevents
1. **Logging Sensitive Data**: No passwords, tokens, SSNs in logs
2. **Detailed Error Messages**: Generic errors to users
3. **Stack Traces**: Never expose to end users
4. **Data in URLs**: No sensitive data in query parameters

### Patterns Detected
```javascript
// ❌ Bad: Logging sensitive data
console.log(`User ${email} logged in with password ${password}`);

// ✅ Good: Logging without sensitive data
console.log(`User ${email} logged in successfully`);

// ❌ Bad: Detailed error to user
res.json({ error: err.stack });

// ✅ Good: Generic error to user
res.json({ error: 'An error occurred' });
logger.error('Detailed error:', err); // Log full error server-side
```

---

## RULE-OWASP-004: Security Misconfiguration Prevention (OWASP #5)

**Category**: Security  
**Complexity**: Advanced  
**Default**: Enabled  

### Description
Prevents common security misconfigurations in code and dependencies.

### Checks
1. **Default Credentials**: No hardcoded default passwords
2. **Debug Mode**: Ensure debug is disabled in production
3. **Security Headers**: Require security headers implementation
4. **Dependency Scanning**: Check for known vulnerabilities

### Implementation
```json
{
  "id": "owasp-004",
  "checks": {
    "no_default_creds": true,
    "debug_disabled": true,
    "security_headers": [
      "X-Frame-Options",
      "X-Content-Type-Options",
      "Content-Security-Policy"
    ],
    "dependency_audit": true
  }
}
```

### Enforcement
- Pre-commit: Check for hardcoded credentials
- Pre-commit: Verify debug flags are environment-based
- CI/CD: Run dependency vulnerability scans
- Code review: Verify security headers implementation