#!/usr/bin/env node

/**
 * Optimized Rules Builder for LLM Ingestion
 *
 * This script reads the comprehensive, human-readable `MANDATORY-RULES.md`
 * and generates a token-efficient, structured `RULES-LLM-OPTIMIZED.md`
 * file specifically for LLM consumption.
 */

const fs = require('fs');
const path = require('path');
const {
    marked
} = require('marked');

function buildOptimizedRules() {
    console.log('🚀 Building LLM-optimized rules...');

    const sourcePath = path.join(__dirname, '..', 'MANDATORY-RULES.md');
    const outputPath = path.join(__dirname, '..', 'RULES-LLM-OPTIMIZED.md');

    try {
        const markdown = fs.readFileSync(sourcePath, 'utf8');
        const optimizedContent = parseAndOptimize(markdown);
        fs.writeFileSync(outputPath, optimizedContent, 'utf8');
        console.log(`✅ LLM-optimized rules built successfully: ${outputPath}`);
    } catch (error) {
        console.error('❌ Error building optimized rules:', error.message);
        process.exit(1);
    }
}

function parseAndOptimize(markdown) {
    const tokens = marked.lexer(markdown);
    let optimized = '# LLM-OPTIMIZED RULES (TOKENIZED)\n\n';

    tokens.forEach(token => {
        if (token.type === 'heading') {
            optimized += `${'#'.repeat(token.depth)} ${token.text}\n`;
        } else if (token.type === 'list') {
            token.items.forEach(item => {
                optimized += `- ${item.text}\n`;
            });
        }
    });

    return optimized;
}

if (require.main === module) {
    buildOptimizedRules();
}

module.exports = {
    buildOptimizedRules
};
