# Software Engineering Principles Rules

## RULE-ENG-001: SOLID Principles Enforcement

**Category**: Quality  
**Complexity**: Advanced  
**Default**: Disabled  

### Description
Enforces SOLID principles for maintainable object-oriented code.

### Principles Checked

#### Single Responsibility Principle (SRP)
- Classes should have one reason to change
- Functions should do one thing well
- Modules should have clear boundaries

```javascript
// ❌ Bad: Multiple responsibilities
class UserManager {
  createUser() { }
  sendEmail() { }
  generateReport() { }
  validateInput() { }
}

// ✅ Good: Single responsibility
class UserService {
  createUser() { }
}
class EmailService {
  sendEmail() { }
}
```

#### Open/Closed Principle (OCP)
- Open for extension, closed for modification
- Use inheritance and composition over modification

#### Dependency Inversion Principle (DIP)
- Depend on abstractions, not concretions
- High-level modules shouldn't depend on low-level modules

### Configuration
```json
{
  "id": "eng-001",
  "max_class_methods": 7,
  "max_function_lines": 20,
  "require_interfaces": true
}
```

---

## RULE-ENG-002: Test-Driven Development (TDD)

**Category**: Quality  
**Complexity**: Advanced  
**Default**: Disabled  

### Description
Enforces Test-Driven Development practices following the Three Laws of TDD.

### The Three Laws
1. **Law 1**: Write no production code until you have written a failing unit test
2. **Law 2**: Write no more of a unit test than is sufficient to fail
3. **Law 3**: Write no more production code than is sufficient to pass the failing test

### Enforcement
- Check test files exist before implementation files
- Verify tests were committed before implementation
- Ensure incremental test/code commits
- Flag large code additions without tests

### F.I.R.S.T. Test Principles
- **Fast**: Tests run quickly
- **Independent**: Tests don't depend on each other
- **Repeatable**: Same results every time
- **Self-Validating**: Clear pass/fail
- **Timely**: Written just before code

---

## RULE-ENG-003: Clean Code Standards

**Category**: Quality  
**Complexity**: Advanced  
**Default**: Disabled  

### Description
Enforces clean code principles for readability and maintainability.

### Standards Enforced

#### Meaningful Names
- Use intention-revealing names
- Avoid mental mapping
- Use pronounceable names
- Use searchable names

```javascript
// ❌ Bad
const d = new Date();
const yrs = calcYrs(u.bd);

// ✅ Good
const currentDate = new Date();
const userAgeInYears = calculateAge(user.birthDate);
```

#### Function Standards
- Small functions (≤20 lines)
- Do one thing
- One level of abstraction
- Descriptive names
- Few arguments (≤3)

#### Comment Standards
- Code should be self-documenting
- Comments explain "why" not "what"
- No commented-out code
- Update comments with code

### Configuration
```json
{
  "id": "eng-003",
  "max_function_length": 20,
  "max_parameters": 3,
  "max_nesting_depth": 3,
  "require_const_for_immutable": true
}
```

---

## RULE-ENG-004: Design Pattern Compliance

**Category**: Quality  
**Complexity**: Advanced  
**Default**: Disabled  

### Description
Encourages use of appropriate design patterns and prevents anti-patterns.

### Patterns Encouraged
1. **Factory Pattern**: For complex object creation
2. **Observer Pattern**: For event handling
3. **Strategy Pattern**: For algorithm selection
4. **Dependency Injection**: For loose coupling

### Anti-Patterns Detected
1. **God Object**: Classes doing too much
2. **Spaghetti Code**: Tangled control flow
3. **Copy-Paste Programming**: Duplicate code
4. **Magic Numbers**: Hardcoded values

### Detection Examples
```javascript
// Detect God Object
if (classMethodCount > 20 || classLineCount > 500) {
  warn("Class may be a God Object - consider splitting responsibilities");
}

// Detect Magic Numbers
if (/\b\d{2,}\b/.test(code) && !isConstDeclaration) {
  warn("Magic number detected - use named constants");
}
```