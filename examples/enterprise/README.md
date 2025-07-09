# Enterprise Example

This example demonstrates a comprehensive vibe-codex configuration suitable for enterprise projects with strict quality requirements.

## Features

- All modules enabled with strict settings
- 90% test coverage requirement
- Comprehensive documentation requirements
- Security scanning and dependency management
- Docker/Kubernetes deployment validation
- Strict code organization patterns

## Usage

```bash
# Copy this configuration to your project
cp examples/enterprise/.vibe-codex.json /path/to/your/project/

# Or initialize with enterprise preset
npx vibe-codex init --preset enterprise
```

## What's Included

### Core Module
- Strict branch naming (includes ticket prefixes)
- Issue reference requirements
- Enhanced secret detection

### Testing Module
- 90% coverage threshold
- Mandatory test files for all source
- Comprehensive test patterns

### GitHub & GitHub Workflow
- All GitHub best practices enforced
- Required workflows: CI, Security, CodeQL
- Dependency automation
- 30-minute workflow timeout

### Deployment Module
- Docker and Kubernetes validation
- Health check requirements
- Environment variable documentation
- Build process validation

### Documentation Module
- 12 required README sections
- API documentation mandatory
- JSDoc enforcement
- 1000+ character README
- Changelog maintenance

### Patterns Module
- 300 line file limit
- 40 line function limit
- Complexity limit of 8
- Strict naming conventions
- Index file requirements

## Customization

### For Microservices

Add service-specific configuration:

```json
"deployment": {
  "platforms": ["docker", "kubernetes"],
  "microservices": {
    "serviceNamePattern": "^[a-z-]+$",
    "requireServiceMesh": true
  }
}
```

### For Monorepos

Adjust patterns for monorepo structure:

```json
"patterns": {
  "monorepo": true,
  "packageNaming": "^@company/[a-z-]+$"
}
```

### For Regulated Industries

Add compliance requirements:

```json
"compliance": {
  "enabled": true,
  "standards": ["SOC2", "HIPAA"],
  "requireAuditLog": true
}
```

## CI/CD Integration

This configuration works well with:

1. GitHub Actions (via github-workflow module)
2. GitLab CI
3. Jenkins
4. CircleCI
5. Azure DevOps

Example GitHub Actions workflow:

```yaml
name: Enterprise CI
on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npx vibe-codex validate --ci
```

## Performance Considerations

With all modules enabled, validation may take longer. Optimize by:

1. Using ignore patterns effectively
2. Running parallel validation
3. Validating only changed files in development
4. Using module-specific validation during development

## Migration Path

Moving from basic to enterprise:

1. Start with core modules
2. Gradually increase thresholds
3. Add modules one at a time
4. Train team on new requirements
5. Use warnings before errors

## Team Adoption

1. Run in warning mode initially
2. Fix existing violations gradually
3. Enable enforcement in CI first
4. Add pre-commit hooks last
5. Provide team training

## Monitoring

Track metrics over time:

- Coverage trends
- Rule violation frequency
- Time to fix violations
- Team compliance rate

## Support

For enterprise support options, contact the maintainers.