#!/usr/bin/env node

// Test the interactive menu
const { loadConfig, loadRegistry, saveConfig } = require('./lib/config/loader');
const { interactiveRuleConfig } = require('./lib/menu/interactive');

async function test() {
  try {
    console.log('Loading configuration...');
    const config = await loadConfig();
    const registry = await loadRegistry();
    
    console.log('Launching interactive menu...');
    const result = await interactiveRuleConfig(config, registry);
    
    if (result.action === 'save') {
      await saveConfig(config);
      console.log('Configuration saved!');
    } else {
      console.log('Configuration cancelled.');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

test();