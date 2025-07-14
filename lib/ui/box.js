/**
 * Box drawing utility for formatted CLI output
 */

const chalk = require("chalk");

/**
 * Create a box around content
 * @param {Object} options - Box options
 * @param {string} options.title - Box title
 * @param {string} options.content - Box content
 * @param {number} options.padding - Internal padding
 * @param {string} options.borderColor - Border color
 * @param {string} options.borderStyle - Border style (single, double, round)
 * @returns {string} Formatted box
 */
function box(options = {}) {
  const {
    title = "",
    content = "",
    padding = 1,
    borderColor = "white",
    borderStyle = "single",
  } = options;

  const borders = {
    single: {
      topLeft: "┌",
      topRight: "┐",
      bottomLeft: "└",
      bottomRight: "┘",
      horizontal: "─",
      vertical: "│",
    },
    double: {
      topLeft: "╔",
      topRight: "╗",
      bottomLeft: "╚",
      bottomRight: "╝",
      horizontal: "═",
      vertical: "║",
    },
    round: {
      topLeft: "╭",
      topRight: "╮",
      bottomLeft: "╰",
      bottomRight: "╯",
      horizontal: "─",
      vertical: "│",
    },
  };

  const border = borders[borderStyle] || borders.single;
  const lines = content.split("\n");

  // Calculate box width
  const titleLength = title ? title.length + 2 : 0;
  const maxContentLength = Math.max(
    ...lines.map((line) => stripAnsi(line).length),
  );
  const boxWidth = Math.max(titleLength, maxContentLength) + padding * 2 + 2;

  // Apply color
  const colorize = chalk[borderColor] || chalk.white;

  // Build top border
  let result = "";
  if (title) {
    const titlePadding = Math.floor((boxWidth - titleLength - 2) / 2);
    result += colorize(
      border.topLeft + border.horizontal.repeat(titlePadding) + " ",
    );
    result += chalk.bold(title);
    result += colorize(
      " " +
        border.horizontal.repeat(boxWidth - titlePadding - titleLength - 2) +
        border.topRight,
    );
  } else {
    result += colorize(
      border.topLeft + border.horizontal.repeat(boxWidth - 2) + border.topRight,
    );
  }
  result += "\n";

  // Add padding lines
  for (let i = 0; i < padding; i++) {
    result +=
      colorize(border.vertical) +
      " ".repeat(boxWidth - 2) +
      colorize(border.vertical) +
      "\n";
  }

  // Add content lines
  lines.forEach((line) => {
    const lineLength = stripAnsi(line).length;
    const leftPadding = padding;
    const rightPadding = boxWidth - lineLength - leftPadding - 2;

    result +=
      colorize(border.vertical) +
      " ".repeat(leftPadding) +
      line +
      " ".repeat(rightPadding) +
      colorize(border.vertical) +
      "\n";
  });

  // Add padding lines
  for (let i = 0; i < padding; i++) {
    result +=
      colorize(border.vertical) +
      " ".repeat(boxWidth - 2) +
      colorize(border.vertical) +
      "\n";
  }

  // Build bottom border
  result += colorize(
    border.bottomLeft +
      border.horizontal.repeat(boxWidth - 2) +
      border.bottomRight,
  );

  return result;
}

/**
 * Strip ANSI color codes from string
 */
function stripAnsi(str) {
  return str.replace(/\u001b\[[0-9;]*m/g, "");
}

/**
 * Create a simple divider
 */
function divider(options = {}) {
  const { length = 50, character = "─", color = "gray" } = options;

  return chalk[color](character.repeat(length));
}

/**
 * Create a header with dividers
 */
function header(text, options = {}) {
  const { width = 50, color = "blue" } = options;

  const padding = Math.floor((width - text.length - 2) / 2);
  const line = "═".repeat(width);

  return chalk[color](
    [
      line,
      "║" +
        " ".repeat(padding) +
        chalk.bold(text) +
        " ".repeat(width - padding - text.length - 2) +
        "║",
      line,
    ].join("\n"),
  );
}

module.exports = {
  box,
  divider,
  header,
};
