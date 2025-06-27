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
    const lines = markdown.split('\n');
    let optimized = '# LLM-OPTIMIZED RULES (TOKENIZED)\n\n';
    let currentSection = '';

    for (const line of lines) {
        if (line.startsWith('## ⚡')) {
            currentSection = line.replace('## ⚡', '').trim();
            optimized += `## ${currentSection}\n`;
        } else if (line.startsWith('###')) {
            const subsection = line.replace('###', '').trim();
            optimized += `### ${subsection}\n`;
        } else if (line.startsWith('-')) {
            const rule = line.replace('-', '').trim();
            optimized += `- ${rule}\n`;
        } else if (line.startsWith('```markdown')) {
            // Skip markdown blocks
        } else if (line.startsWith('```')) {
            // Skip code blocks
        } else if (line.trim() !== '') {
            // Keep other lines
            optimized += `${line}\n`;
        }
    }

    return optimized;
}

if (require.main === module) {
    buildOptimizedRules();
}

module.exports = { buildOptimizedRules };