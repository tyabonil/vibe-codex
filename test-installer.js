#!/usr/bin/env node

/**
 * Test the installer directly
 */

const { installHooks, uninstallHooks } = require('./lib/installer.js');
const fs = require('fs').promises;
const path = require('path');

async function test() {
  console.log('🧪 Testing hook installer...\n');
  
  // Change to test project
  process.chdir('test-project');
  
  // Load config
  const config = JSON.parse(await fs.readFile('.vibe-codex.json', 'utf8'));
  console.log('📋 Config:', config);
  
  // Test install
  console.log('\n🔧 Installing hooks...');
  await installHooks(config);
  
  // Check if hooks were created
  console.log('\n📂 Checking installed hooks:');
  const hooksDir = path.join('.git', 'hooks');
  const files = await fs.readdir(hooksDir);
  
  for (const file of files) {
    if (!file.includes('sample')) {
      const stats = await fs.stat(path.join(hooksDir, file));
      console.log(`  - ${file} (${stats.size} bytes)`);
    }
  }
  
  // Read a hook to check content
  console.log('\n📄 Pre-commit hook content:');
  const preCommit = await fs.readFile(path.join(hooksDir, 'pre-commit'), 'utf8');
  console.log(preCommit.substring(0, 200) + '...');
  
  // Test uninstall
  console.log('\n🗑️  Testing uninstall...');
  await uninstallHooks();
  
  console.log('\n✅ Test complete!');
}

test().catch(console.error);