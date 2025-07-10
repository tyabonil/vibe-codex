/**
 * GitHub Issue Progress Updater
 * Integrates with vibe-codex to automatically update GitHub issues with progress
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const path = require('path');
const fs = require('fs').promises;
const logger = require('../utils/logger');

const execAsync = promisify(exec);

class IssueProgressUpdater {
  constructor(options = {}) {
    this.enabled = options.enabled !== false;
    this.autoUpdate = options.autoUpdate || false;
    this.updateInterval = options.updateInterval || 300000; // 5 minutes
    this.issueNumber = null;
    this.lastUpdate = null;
    this.updateTimer = null;
    this.hookPath = path.join(process.cwd(), '.claude/hooks/update-issue-progress.sh');
  }

  /**
   * Initialize the updater with an issue number
   * @param {number} issueNumber - GitHub issue number
   */
  async initialize(issueNumber) {
    if (!this.enabled) {
      logger.debug('Issue progress updater is disabled');
      return;
    }

    this.issueNumber = issueNumber;
    logger.info(`📋 Initialized issue progress updater for issue #${issueNumber}`);

    // Check if hook script exists
    try {
      await fs.access(this.hookPath);
    } catch (error) {
      logger.warn('⚠️ Issue progress update hook not found. Creating it...');
      await this.createHookScript();
    }

    // Start auto-update timer if enabled
    if (this.autoUpdate) {
      this.startAutoUpdate();
    }
  }

  /**
   * Post an update to the issue
   * @param {string} type - Update type: plan, progress, blocker, completion
   * @param {string} message - Update message
   */
  async postUpdate(type, message) {
    if (!this.enabled || !this.issueNumber) {
      logger.debug('Cannot post update: updater not initialized or disabled');
      return;
    }

    try {
      logger.info(`📤 Posting ${type} update to issue #${this.issueNumber}`);
      
      const command = `"${this.hookPath}" ${this.issueNumber} ${type} "${message}"`;
      const { stdout, stderr } = await execAsync(command);
      
      if (stderr) {
        logger.error(`❌ Error posting update: ${stderr}`);
        return false;
      }

      logger.success(`✅ Successfully posted ${type} update`);
      this.lastUpdate = new Date();
      return true;
    } catch (error) {
      logger.error(`❌ Failed to post update: ${error.message}`);
      return false;
    }
  }

  /**
   * Post implementation plan
   * @param {Object} plan - Implementation plan details
   */
  async postPlan(plan) {
    const message = this.formatPlan(plan);
    return await this.postUpdate('plan', message);
  }

  /**
   * Post progress update
   * @param {Object} progress - Progress details
   */
  async postProgress(progress) {
    const message = this.formatProgress(progress);
    return await this.postUpdate('progress', message);
  }

  /**
   * Post blocker
   * @param {Object} blocker - Blocker details
   */
  async postBlocker(blocker) {
    const message = this.formatBlocker(blocker);
    return await this.postUpdate('blocker', message);
  }

  /**
   * Post completion update
   * @param {Object} summary - Completion summary
   */
  async postCompletion(summary) {
    const message = this.formatCompletion(summary);
    this.stopAutoUpdate();
    return await this.postUpdate('completion', message);
  }

  /**
   * Format plan object into message
   */
  formatPlan(plan) {
    const parts = [];
    
    if (plan.description) {
      parts.push(plan.description);
    }
    
    if (plan.tasks && Array.isArray(plan.tasks)) {
      parts.push('\n**Tasks:**');
      plan.tasks.forEach((task, index) => {
        parts.push(`${index + 1}. ${task}`);
      });
    }
    
    if (plan.approach) {
      parts.push(`\n**Approach:** ${plan.approach}`);
    }
    
    return parts.join('\n');
  }

  /**
   * Format progress object into message
   */
  formatProgress(progress) {
    const parts = [];
    
    if (progress.completed && progress.completed.length > 0) {
      parts.push('**Completed:**');
      progress.completed.forEach(item => {
        parts.push(`- ✅ ${item}`);
      });
    }
    
    if (progress.inProgress) {
      parts.push(`\n**Currently working on:** ${progress.inProgress}`);
    }
    
    if (progress.next && progress.next.length > 0) {
      parts.push('\n**Next steps:**');
      progress.next.forEach(item => {
        parts.push(`- 📋 ${item}`);
      });
    }
    
    if (progress.notes) {
      parts.push(`\n**Notes:** ${progress.notes}`);
    }
    
    return parts.join('\n');
  }

  /**
   * Format blocker object into message
   */
  formatBlocker(blocker) {
    const parts = [];
    
    if (blocker.issue) {
      parts.push(`**Issue:** ${blocker.issue}`);
    }
    
    if (blocker.context) {
      parts.push(`\n**Context:** ${blocker.context}`);
    }
    
    if (blocker.attempted && blocker.attempted.length > 0) {
      parts.push('\n**Attempted solutions:**');
      blocker.attempted.forEach(attempt => {
        parts.push(`- ❌ ${attempt}`);
      });
    }
    
    if (blocker.needsHelp) {
      parts.push(`\n**Help needed:** ${blocker.needsHelp}`);
    }
    
    return parts.join('\n');
  }

  /**
   * Format completion object into message
   */
  formatCompletion(summary) {
    const parts = [];
    
    if (summary.overview) {
      parts.push(summary.overview);
    }
    
    if (summary.implemented && summary.implemented.length > 0) {
      parts.push('\n**Implemented:**');
      summary.implemented.forEach(item => {
        parts.push(`- ✅ ${item}`);
      });
    }
    
    if (summary.tested) {
      parts.push(`\n**Testing:** ${summary.tested}`);
    }
    
    if (summary.pr) {
      parts.push(`\n**Pull Request:** ${summary.pr}`);
    }
    
    return parts.join('\n');
  }

  /**
   * Start automatic progress updates
   */
  startAutoUpdate() {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
    }

    logger.info(`🔄 Starting automatic progress updates every ${this.updateInterval / 1000}s`);
    
    this.updateTimer = setInterval(async () => {
      // Get current todo status
      const todoStatus = await this.getTodoStatus();
      
      if (todoStatus && todoStatus.hasChanges) {
        await this.postProgress({
          completed: todoStatus.recentlyCompleted,
          inProgress: todoStatus.currentTask,
          next: todoStatus.upcomingTasks.slice(0, 3),
          notes: 'Automatic progress update'
        });
      }
    }, this.updateInterval);
  }

  /**
   * Stop automatic updates
   */
  stopAutoUpdate() {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
      this.updateTimer = null;
      logger.info('🛑 Stopped automatic progress updates');
    }
  }

  /**
   * Get current todo status
   */
  async getTodoStatus() {
    try {
      const todoPath = path.join(process.cwd(), '.claude/todos.json');
      const data = await fs.readFile(todoPath, 'utf8');
      const todos = JSON.parse(data);
      
      const completed = todos.filter(t => t.status === 'completed');
      const inProgress = todos.filter(t => t.status === 'in_progress');
      const pending = todos.filter(t => t.status === 'pending');
      
      // Check if there have been changes since last update
      const hasChanges = this.lastUpdate ? 
        todos.some(t => new Date(t.updatedAt) > this.lastUpdate) : true;
      
      return {
        hasChanges,
        recentlyCompleted: completed
          .filter(t => !this.lastUpdate || new Date(t.updatedAt) > this.lastUpdate)
          .map(t => t.content),
        currentTask: inProgress[0]?.content || null,
        upcomingTasks: pending.map(t => t.content),
        stats: {
          completed: completed.length,
          inProgress: inProgress.length,
          pending: pending.length
        }
      };
    } catch (error) {
      logger.debug('Could not read todo status:', error.message);
      return null;
    }
  }

  /**
   * Create the hook script if it doesn't exist
   */
  async createHookScript() {
    const scriptContent = await fs.readFile(
      path.join(__dirname, '../../templates/hooks/update-issue-progress.sh'),
      'utf8'
    );
    
    const hookDir = path.dirname(this.hookPath);
    await fs.mkdir(hookDir, { recursive: true });
    await fs.writeFile(this.hookPath, scriptContent);
    await fs.chmod(this.hookPath, '755');
    
    logger.success('✅ Created issue progress update hook');
  }

  /**
   * Get update history for the current issue
   */
  async getUpdateHistory() {
    try {
      const logPath = path.join(process.cwd(), '.claude/issue_updates.log');
      const logContent = await fs.readFile(logPath, 'utf8');
      const updates = logContent
        .split('\n')
        .filter(line => line.includes(`issue #${this.issueNumber}`))
        .map(line => {
          const match = line.match(/\[(.*?)\] Updated issue #(\d+) with (\w+) update/);
          if (match) {
            return {
              timestamp: match[1],
              issueNumber: match[2],
              type: match[3]
            };
          }
          return null;
        })
        .filter(Boolean);
        
      return updates;
    } catch (error) {
      return [];
    }
  }

  /**
   * Check if an update is needed based on time or changes
   */
  shouldUpdate() {
    if (!this.lastUpdate) return true;
    
    const timeSinceLastUpdate = Date.now() - this.lastUpdate.getTime();
    return timeSinceLastUpdate > this.updateInterval;
  }
}

module.exports = IssueProgressUpdater;