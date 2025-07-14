/**
 * Tests for UI box component
 */

const chalk = require("chalk");

// Mock chalk
jest.mock("chalk", () => ({
  blue: jest.fn((text) => text),
  green: jest.fn((text) => text),
  yellow: jest.fn((text) => text),
  red: jest.fn((text) => text),
  gray: jest.fn((text) => text),
  bold: jest.fn((text) => text),
  dim: jest.fn((text) => text),
}));

const { createBox, boxStyles } = require("../../../lib/ui/box");

describe("UI Box Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    console.log = jest.fn();
  });

  test("should export createBox function", () => {
    expect(createBox).toBeDefined();
    expect(typeof createBox).toBe("function");
  });

  test("should export boxStyles object", () => {
    expect(boxStyles).toBeDefined();
    expect(typeof boxStyles).toBe("object");
  });

  test("should create simple box with content", () => {
    const content = "Hello World";
    const box = createBox(content);

    expect(box).toContain(content);
    expect(box).toContain("─"); // box drawing character
  });

  test("should create box with title", () => {
    const content = "Box content";
    const title = "My Box";
    const box = createBox(content, { title });

    expect(box).toContain(content);
    expect(box).toContain(title);
  });

  test("should apply box styles", () => {
    const content = "Styled content";
    const box = createBox(content, { style: "success" });

    expect(chalk.green).toHaveBeenCalled();
  });

  test("should handle multi-line content", () => {
    const content = "Line 1\nLine 2\nLine 3";
    const box = createBox(content);

    const lines = box.split("\n");
    expect(lines.length).toBeGreaterThan(3);
  });

  test("should set custom width", () => {
    const content = "Fixed width";
    const width = 40;
    const box = createBox(content, { width });

    const lines = box.split("\n");
    // Check that box respects width
    lines.forEach((line) => {
      expect(line.length).toBeLessThanOrEqual(width + 4); // +4 for borders
    });
  });

  test("should handle empty content", () => {
    const box = createBox("");
    expect(box).toBeDefined();
    expect(box.length).toBeGreaterThan(0);
  });

  test("should use default style", () => {
    expect(boxStyles.default).toBeDefined();
    expect(boxStyles.success).toBeDefined();
    expect(boxStyles.warning).toBeDefined();
    expect(boxStyles.error).toBeDefined();
    expect(boxStyles.info).toBeDefined();
  });

  test("should handle padding options", () => {
    const content = "Padded content";
    const box = createBox(content, { padding: 2 });

    expect(box).toContain(content);
    const lines = box.split("\n");
    // Should have extra lines for padding
    expect(lines.length).toBeGreaterThan(5);
  });

  test("should center content when specified", () => {
    const content = "Centered";
    const box = createBox(content, { align: "center", width: 30 });

    expect(box).toContain(content);
    // Content should not start at the beginning of the line
    const contentLine = box.split("\n").find((line) => line.includes(content));
    expect(contentLine.indexOf(content)).toBeGreaterThan(5);
  });

  test("should handle invalid style gracefully", () => {
    const content = "Content";
    const box = createBox(content, { style: "invalid" });

    expect(box).toContain(content);
    // Should fall back to default style
  });
});
