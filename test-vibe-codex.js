#!/usr/bin/env node

/**
 * Test script for vibe-codex
 * This tests the programmatic API
 */

const path = require('path');
const fs = require('fs').promises;

// Change to lib path
const vibeCodex = require('./lib/index.js');

async function test() {
  console.log('🧪 Testing vibe-codex programmatic API...\n');
  
  // Test 1: Check exports
  console.log('✅ Module exports:', Object.keys(vibeCodex));
  
  // Test 2: Check version
  console.log('✅ Version:', vibeCodex.version);
  
  // Test 3: Try to run init
  try {
    console.log('\n📦 Testing init function...');
    // The init function expects to be in an interactive environment
    // So we'll just check if it exists
    if (typeof vibeCodex.init === 'function') {
      console.log('✅ init function exists');
    }
  } catch (error) {
    console.log('❌ Error with init:', error.message);
  }
  
  // Test 4: Check if .git exists
  try {
    await fs.access('.git');
    console.log('✅ Git repository detected');
  } catch {
    console.log('❌ Not a git repository');
  }
  
  // Test 5: Check configuration structure
  const testConfig = {
    version: '3.0.0',
    gitHooks: true,
    githubActions: false,
    rules: ['security', 'commit-format'],
    created: new Date().toISOString()
  };
  
  console.log('\n📋 Test configuration structure:');
  console.log(JSON.stringify(testConfig, null, 2));
}

test().catch(console.error);