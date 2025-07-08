/**
 * GitHub module - GitHub workflow and integration rules
 */

module.exports = {
  name: 'github',
  description: 'GitHub workflow and integration rules',
  
  rules: [
    {
      id: 'pr-template',
      description: 'Pull request template exists',
      level: 'warning'
    },
    {
      id: 'issue-templates',
      description: 'Issue templates exist',
      level: 'warning'
    },
    {
      id: 'branch-protection',
      description: 'Branch protection rules configured',
      level: 'info'
    }
  ],
  
  validate(context, config) {
    const violations = [];
    
    // TODO: Implement GitHub-specific validation
    
    return violations;
  }
};