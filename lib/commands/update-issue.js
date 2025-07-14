#!/usr/bin/env node

/**
 * Update GitHub issue with progress
 * Usage: npx vibe-codex update-issue <issue-number> <type> [message]
 */

const IssueProgressUpdater = require("../hooks/issue-progress-updater");
const logger = require("../utils/logger");
const inquirer = require("inquirer");

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 1) {
    logger.error(
      "Usage: npx vibe-codex update-issue <issue-number> [type] [message]",
    );
    logger.info("Types: plan, progress, blocker, completion");
    process.exit(1);
  }

  const issueNumber = parseInt(args[0]);
  let updateType = args[1];
  let message = args.slice(2).join(" ");

  if (isNaN(issueNumber)) {
    logger.error("Invalid issue number:", args[0]);
    process.exit(1);
  }

  // Initialize updater
  const updater = new IssueProgressUpdater();
  await updater.initialize(issueNumber);

  // If no type provided, ask interactively
  if (!updateType) {
    const typeAnswer = await inquirer.prompt([
      {
        type: "list",
        name: "type",
        message: "What type of update would you like to post?",
        choices: [
          { name: "📋 Implementation Plan", value: "plan" },
          { name: "🚧 Progress Update", value: "progress" },
          { name: "🚨 Blocker Encountered", value: "blocker" },
          { name: "✅ Task Completed", value: "completion" },
        ],
      },
    ]);
    updateType = typeAnswer.type;
  }

  // Handle different update types interactively
  switch (updateType) {
    case "plan":
      if (!message) {
        const planAnswers = await inquirer.prompt([
          {
            type: "input",
            name: "description",
            message: "Describe your implementation plan:",
          },
          {
            type: "input",
            name: "approach",
            message: "What is your technical approach?",
          },
          {
            type: "input",
            name: "tasks",
            message: "List the main tasks (comma-separated):",
          },
        ]);

        await updater.postPlan({
          description: planAnswers.description,
          approach: planAnswers.approach,
          tasks: planAnswers.tasks
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
        });
      } else {
        await updater.postUpdate("plan", message);
      }
      break;

    case "progress":
      if (!message) {
        // Get current todo status
        const todoStatus = await updater.getTodoStatus();

        const progressAnswers = await inquirer.prompt([
          {
            type: "checkbox",
            name: "completed",
            message: "What have you completed?",
            choices: todoStatus?.recentlyCompleted || [],
            default: todoStatus?.recentlyCompleted || [],
          },
          {
            type: "input",
            name: "inProgress",
            message: "What are you currently working on?",
            default: todoStatus?.currentTask || "",
          },
          {
            type: "input",
            name: "notes",
            message: "Any additional notes?",
          },
        ]);

        await updater.postProgress({
          completed: progressAnswers.completed,
          inProgress: progressAnswers.inProgress,
          next: todoStatus?.upcomingTasks.slice(0, 3) || [],
          notes: progressAnswers.notes,
        });
      } else {
        await updater.postUpdate("progress", message);
      }
      break;

    case "blocker":
      if (!message) {
        const blockerAnswers = await inquirer.prompt([
          {
            type: "input",
            name: "issue",
            message: "What is blocking you?",
          },
          {
            type: "input",
            name: "context",
            message: "Provide more context:",
          },
          {
            type: "input",
            name: "attempted",
            message: "What solutions have you tried? (comma-separated):",
          },
          {
            type: "input",
            name: "needsHelp",
            message: "What help do you need?",
          },
        ]);

        await updater.postBlocker({
          issue: blockerAnswers.issue,
          context: blockerAnswers.context,
          attempted: blockerAnswers.attempted
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
          needsHelp: blockerAnswers.needsHelp,
        });
      } else {
        await updater.postUpdate("blocker", message);
      }
      break;

    case "completion":
      if (!message) {
        const completionAnswers = await inquirer.prompt([
          {
            type: "input",
            name: "overview",
            message: "Summarize what was accomplished:",
          },
          {
            type: "input",
            name: "implemented",
            message: "List implemented features (comma-separated):",
          },
          {
            type: "confirm",
            name: "tested",
            message: "Have all tests been written and are passing?",
          },
          {
            type: "input",
            name: "pr",
            message: "PR number or URL (if created):",
          },
        ]);

        await updater.postCompletion({
          overview: completionAnswers.overview,
          implemented: completionAnswers.implemented
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
          tested: completionAnswers.tested
            ? "All tests written and passing"
            : "Tests pending",
          pr: completionAnswers.pr,
        });
      } else {
        await updater.postUpdate("completion", message);
      }
      break;

    default:
      logger.error("Invalid update type:", updateType);
      logger.info("Valid types: plan, progress, blocker, completion");
      process.exit(1);
  }

  // Show update history
  const history = await updater.getUpdateHistory();
  if (history.length > 0) {
    logger.info("\n📊 Update History:");
    history.slice(-5).forEach((update) => {
      logger.info(`  ${update.timestamp} - ${update.type} update`);
    });
  }

  // Ask about auto-updates
  if (updateType !== "completion") {
    const autoAnswer = await inquirer.prompt([
      {
        type: "confirm",
        name: "enableAuto",
        message: "Enable automatic progress updates?",
        default: false,
      },
    ]);

    if (autoAnswer.enableAuto) {
      updater.autoUpdate = true;
      updater.startAutoUpdate();
      logger.info("🔄 Automatic updates enabled (every 5 minutes)");
      logger.info("The process will continue running. Press Ctrl+C to stop.");

      // Keep process running
      process.on("SIGINT", () => {
        updater.stopAutoUpdate();
        logger.info("\n👋 Stopped automatic updates");
        process.exit(0);
      });
    }
  }
}

// Run if called directly
if (require.main === module) {
  main().catch((error) => {
    logger.error("Error:", error.message);
    process.exit(1);
  });
}

module.exports = { main };
