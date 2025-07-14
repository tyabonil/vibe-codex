/**
 * Advanced hooks configuration
 */

const advancedHooks = {
  'issue-tracking': {
    name: 'Issue Tracking Hooks',
    description: 'Automatically track and update issue progress',
    hooks: [
      {
        file: 'issue-progress-tracker.sh',
        type: 'post-commit',
        description: 'Track issue progress after commits'
      },
      {
        file: 'issue-reminder-pre-commit.sh',
        type: 'pre-commit',
        description: 'Remind about issue updates before commit'
      },
      {
        file: 'issue-reminder-post-commit.sh',
        type: 'post-commit',
        description: 'Remind about issue updates after commit'
      },
      {
        file: 'issue-reminder-pre-push.sh',
        type: 'pre-push',
        description: 'Check issue status before push'
      }
    ]
  },
  
  'pr-management': {
    name: 'Pull Request Management',
    description: 'Automate PR health checks and reviews',
    hooks: [
      {
        file: 'pr-health-check.sh',
        type: 'pre-push',
        description: 'Check PR health before push'
      },
      {
        file: 'pr-review-check.sh',
        type: 'pre-push',
        description: 'Ensure PR has required reviews'
      },
      {
        file: 'pre-issue-close.sh',
        type: 'pre-push',
        description: 'Validate before closing issues'
      }
    ]
  },
  
  'quality-gates': {
    name: 'Quality Gates',
    description: 'Enforce code quality standards',
    hooks: [
      {
        file: 'test-coverage-validator.sh',
        type: 'pre-push',
        description: 'Validate test coverage thresholds'
      },
      {
        file: 'security-pre-commit.sh',
        type: 'pre-commit',
        description: 'Run security checks before commit'
      }
    ]
  },
  
  'context-management': {
    name: 'Context Management',
    description: 'Keep project context files up to date',
    hooks: [
      {
        file: 'monitor-context.sh',
        type: 'post-commit',
        description: 'Monitor and update PROJECT_CONTEXT.md'
      }
    ]
  }
};

/**
 * Get all advanced hook categories
 */
function getCategories() {
  return Object.keys(advancedHooks);
}

/**
 * Get hooks for specific categories
 */
function getHooksForCategories(categories) {
  const hooks = [];
  
  categories.forEach(category => {
    if (advancedHooks[category]) {
      hooks.push(...advancedHooks[category].hooks);
    }
  });
  
  return hooks;
}

/**
 * Get all available advanced hooks
 */
function getAllHooks() {
  const allHooks = [];
  
  Object.values(advancedHooks).forEach(category => {
    allHooks.push(...category.hooks);
  });
  
  return allHooks;
}

module.exports = {
  advancedHooks,
  getCategories,
  getHooksForCategories,
  getAllHooks
};