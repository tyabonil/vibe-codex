/**
 * Core module - Essential rules for all projects
 */

module.exports = {
  name: 'core',
  description: 'Essential rules for all projects',
  
  rules: [
    {
      id: 'no-secrets',
      description: 'No secrets or API keys in code',
      level: 'error'
    },
    {
      id: 'gitignore',
      description: 'Proper .gitignore file exists',
      level: 'error'
    },
    {
      id: 'readme',
      description: 'README.md file exists',
      level: 'warning'
    },
    {
      id: 'project-context',
      description: 'PROJECT_CONTEXT.md file exists',
      level: 'warning'
    }
  ],
  
  validate(context) {
    const violations = [];
    
    // TODO: Implement actual validation logic
    
    return violations;
  }
};