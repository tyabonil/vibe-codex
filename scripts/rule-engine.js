// Legacy stub for backward compatibility
// The mandatory rules system has been replaced by vibe-codex
// This file exists only to prevent breaking existing workflows

class RuleEngine {
  constructor() {
    console.log('⚠️  Legacy rule engine - please migrate to vibe-codex');
  }
  
  async checkLevel1Security() { 
    return []; // No violations - system is deprecated
  }
  
  async checkLevel2Workflow() { 
    return []; // No violations - system is deprecated
  }
  
  async checkLevel3Quality() { 
    return []; // No violations - system is deprecated
  }
  
  async checkLevel4Patterns() { 
    return []; // No violations - system is deprecated
  }
  
  async runAllChecks() {
    return {
      violations: [],
      level1: [],
      level2: [],
      level3: [],
      level4: [],
      criticalCount: 0,
      score: 10
    };
  }
}

module.exports = RuleEngine;