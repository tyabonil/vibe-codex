/**
 * Main installer module
 */

module.exports = {
  gitHooks: require('./git-hooks'),
  githubActions: require('./github-actions'),
  rules: require('./rules')
};