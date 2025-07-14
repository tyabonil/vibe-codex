#!/usr/bin/env node

/**
 * Configuration Validator for MANDATORY Rules Checker
 * Validates rules.json configuration file
 */

const fs = require('fs');
const path = require('path');

function validateConfig() {
    console.log('🔍 Validating rules configuration...');
    
    const configPath = path.join(__dirname, '..', 'config', 'rules.json');
    
    try {
        // Check if config file exists
        if (!fs.existsSync(configPath)) {
            console.error('❌ Error: config/rules.json not found');
            process.exit(1);
        }
        
        // Parse JSON
        const configContent = fs.readFileSync(configPath, 'utf8');
        let config;
        
        try {
            config = JSON.parse(configContent);
        } catch (parseError) {
            console.error('❌ Error: Invalid JSON in config/rules.json');
            console.error(parseError.message);
            process.exit(1);
        }
        
        // Validate required sections
        const requiredSections = ['level1', 'level2', 'level3', 'level4'];
        const missingSections = requiredSections.filter(section => !config[section]);
        
        if (missingSections.length > 0) {
            console.error(`❌ Error: Missing required sections: ${missingSections.join(', ')}`);
            process.exit(1);
        }
        
        // Validate Level 1 (Security)
        if (!config.level1.secretPatterns || !Array.isArray(config.level1.secretPatterns)) {
            console.error('❌ Error: level1.secretPatterns must be an array');
            process.exit(1);
        }
        
        // Validate regex patterns
        config.level1.secretPatterns.forEach((pattern, index) => {
            try {
                new RegExp(pattern);
            } catch (regexError) {
                console.error(`❌ Error: Invalid regex pattern at level1.secretPatterns[${index}]: ${pattern}`);
                console.error(regexError.message);
                process.exit(1);
            }
        });
        
        // Validate Level 2 (Workflow)
        if (!config.level2.branchPatterns || !Array.isArray(config.level2.branchPatterns)) {
            console.error('❌ Error: level2.branchPatterns must be an array');
            process.exit(1);
        }
        
        // Validate Level 3 (Quality)
        if (typeof config.level3.testCoverage !== 'number' || config.level3.testCoverage < 0 || config.level3.testCoverage > 100) {
            console.error('❌ Error: level3.testCoverage must be a number between 0 and 100');
            process.exit(1);
        }
        
        // Validate Level 4 (Patterns)
        if (typeof config.level4.maxFileLines !== 'number' || config.level4.maxFileLines < 1) {
            console.error('❌ Error: level4.maxFileLines must be a positive number');
            process.exit(1);
        }
        
        console.log('✅ Configuration validation passed');
        console.log(`📊 Config summary:`);
        console.log(`   - Secret patterns: ${config.level1.secretPatterns.length}`);
        console.log(`   - Branch patterns: ${config.level2.branchPatterns.length}`);
        console.log(`   - Test coverage requirement: ${config.level3.testCoverage}%`);
        console.log(`   - Max file lines: ${config.level4.maxFileLines}`);
        
    } catch (error) {
        console.error('❌ Unexpected error during validation:', error.message);
        process.exit(1);
    }
}

// Run validation if called directly
if (require.main === module) {
    validateConfig();
}

module.exports = { validateConfig };