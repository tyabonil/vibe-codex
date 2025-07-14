// Test advanced hooks functionality
const { advancedHooks, getCategories, getHooksForCategories } = require('./lib/config/advanced-hooks');

console.log('=== Testing Advanced Hooks Configuration ===\n');

// Test categories
console.log('Available categories:');
const categories = getCategories();
categories.forEach(cat => {
  console.log(`  - ${cat}: ${advancedHooks[cat].name}`);
});

// Test getting hooks for specific categories
console.log('\n\nHooks for issue-tracking:');
const issueHooks = getHooksForCategories(['issue-tracking']);
issueHooks.forEach(hook => {
  console.log(`  - ${hook.file} (${hook.type}): ${hook.description}`);
});

console.log('\n\nHooks for pr-management:');
const prHooks = getHooksForCategories(['pr-management']);
prHooks.forEach(hook => {
  console.log(`  - ${hook.file} (${hook.type}): ${hook.description}`);
});

console.log('\n\nAll hooks count:', getHooksForCategories(categories).length);