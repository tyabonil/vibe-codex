// Legacy stub for backward compatibility
// The mandatory rules system has been replaced by vibe-codex
// This file exists only to prevent breaking existing workflows

class RuleEngine {
  constructor() {
    // Legacy stub - intentionally empty
  }
  
  async checkLevel1Security() { 
    try {
      return []; // No violations - system is deprecated
    } catch (e) {
      return [];
    }
  }
  
  async checkLevel2Workflow() { 
    try {
      return []; // No violations - system is deprecated
    } catch (e) {
      return [];
    }
  }
  
  async checkLevel3Quality() { 
    try {
      return []; // No violations - system is deprecated
    } catch (e) {
      return [];
    }
  }
  
  async checkLevel4Patterns() { 
    try {
      return []; // No violations - system is deprecated
    } catch (e) {
      return [];
    }
  }
  
  async runAllChecks() {
    try {
      return {
        violations: [],
        level1: [],
        level2: [],
        level3: [],
        level4: [],
        criticalCount: 0,
        score: 10
      };
    } catch (e) {
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
}

module.exports = RuleEngine;