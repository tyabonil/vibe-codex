/**
 * Package manager detection and compatibility utilities
 */
const fs = require('fs-extra');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

/**
 * Detect which package manager is being used in the project
 */
async function detectPackageManager(projectPath = process.cwd()) {
  const checks = [
    { file: 'yarn.lock', manager: 'yarn' },
    { file: 'pnpm-lock.yaml', manager: 'pnpm' },
    { file: 'package-lock.json', manager: 'npm' },
    { file: 'bun.lockb', manager: 'bun' }
  ];

  for (const check of checks) {
    if (await fs.pathExists(path.join(projectPath, check.file))) {
      return check.manager;
    }
  }

  // Default to npm if no lock file found
  return 'npm';
}

/**
 * Check if a command is available in the system
 */
async function commandExists(command) {
  try {
    await execAsync(`command -v ${command}`);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check npx availability and version
 */
async function checkNpxAvailability() {
  try {
    const { stdout } = await execAsync('npm --version');
    const npmVersion = stdout.trim();
    const [major, minor] = npmVersion.split('.').map(Number);
    
    // npx comes bundled with npm 5.2.0+
    if (major > 5 || (major === 5 && minor >= 2)) {
      return { available: true, npmVersion };
    }
    
    // Check if npx is installed separately
    const npxExists = await commandExists('npx');
    return { available: npxExists, npmVersion, separate: npxExists };
  } catch (error) {
    return { available: false, error: error.message };
  }
}

/**
 * Get the appropriate run command for the detected package manager
 */
function getRunCommand(packageManager, isGlobal = false) {
  const commands = {
    npm: isGlobal ? 'npx' : 'npx --no-install',
    yarn: isGlobal ? 'yarn dlx' : 'yarn',
    pnpm: isGlobal ? 'pnpm dlx' : 'pnpm exec',
    bun: isGlobal ? 'bunx' : 'bun run'
  };

  return commands[packageManager] || commands.npm;
}

/**
 * Get installation instructions for vibe-codex
 */
function getInstallInstructions(packageManager) {
  const instructions = {
    npm: {
      local: 'npm install --save-dev vibe-codex',
      global: 'npm install -g vibe-codex'
    },
    yarn: {
      local: 'yarn add --dev vibe-codex',
      global: 'yarn global add vibe-codex'
    },
    pnpm: {
      local: 'pnpm add -D vibe-codex',
      global: 'pnpm add -g vibe-codex'
    },
    bun: {
      local: 'bun add -d vibe-codex',
      global: 'bun add -g vibe-codex'
    }
  };

  return instructions[packageManager] || instructions.npm;
}

/**
 * Generate a cross-platform hook script
 */
async function generateCrossPlatformHook(command, options = {}) {
  const packageManager = await detectPackageManager();
  const npxInfo = await checkNpxAvailability();
  
  let script = '#!/bin/sh\n\n';
  
  // Add package manager detection
  script += `# Detected package manager: ${packageManager}\n`;
  script += `# NPX available: ${npxInfo.available}\n\n`;
  
  // Add the command with appropriate fallbacks
  if (npxInfo.available) {
    script += `# Using npx (npm ${npxInfo.npmVersion})\n`;
    script += `npx --no-install ${command}\n`;
  } else {
    // Fallback for older npm versions
    const runCmd = getRunCommand(packageManager, false);
    script += `# Using ${packageManager} fallback\n`;
    script += `${runCmd} ${command}\n`;
  }
  
  return script;
}

/**
 * Validate package manager setup
 */
async function validateSetup() {
  const errors = [];
  const warnings = [];
  
  // Check Node.js
  try {
    const { stdout } = await execAsync('node --version');
    const nodeVersion = stdout.trim();
    const major = parseInt(nodeVersion.slice(1).split('.')[0]);
    
    if (major < 14) {
      errors.push(`Node.js version ${nodeVersion} is too old. Please upgrade to v14 or higher.`);
    }
  } catch {
    errors.push('Node.js is not installed or not in PATH');
  }
  
  // Check npm
  const npxInfo = await checkNpxAvailability();
  if (!npxInfo.available) {
    warnings.push('npx is not available. Git hooks will use fallback methods.');
    if (npxInfo.npmVersion) {
      warnings.push(`npm ${npxInfo.npmVersion} is installed but npx is not available. Consider upgrading npm.`);
    }
  }
  
  // Check package manager
  const packageManager = await detectPackageManager();
  const pmExists = await commandExists(packageManager);
  
  if (!pmExists && packageManager !== 'npm') {
    warnings.push(`Lock file suggests ${packageManager} but it's not installed.`);
  }
  
  return { errors, warnings, packageManager, npxAvailable: npxInfo.available };
}

module.exports = {
  detectPackageManager,
  commandExists,
  checkNpxAvailability,
  getRunCommand,
  getInstallInstructions,
  generateCrossPlatformHook,
  validateSetup
};