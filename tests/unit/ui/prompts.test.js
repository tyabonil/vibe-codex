/**
 * Tests for UI prompts
 */

const inquirer = require("inquirer");
const chalk = require("chalk");

// Mock dependencies
jest.mock("inquirer");
jest.mock("chalk", () => ({
  blue: jest.fn((text) => text),
  green: jest.fn((text) => text),
  yellow: jest.fn((text) => text),
  red: jest.fn((text) => text),
  gray: jest.fn((text) => text),
  bold: jest.fn((text) => text),
  cyan: jest.fn((text) => text),
}));

const prompts = require("../../../lib/ui/prompts");

describe("UI Prompts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should export prompt functions", () => {
    expect(prompts.confirmPrompt).toBeDefined();
    expect(prompts.selectPrompt).toBeDefined();
    expect(prompts.inputPrompt).toBeDefined();
    expect(prompts.multiSelectPrompt).toBeDefined();
  });

  describe("confirmPrompt", () => {
    test("should show confirmation prompt", async () => {
      inquirer.prompt.mockResolvedValue({ confirm: true });

      const result = await prompts.confirmPrompt("Are you sure?");

      expect(inquirer.prompt).toHaveBeenCalledWith([
        {
          type: "confirm",
          name: "confirm",
          message: "Are you sure?",
          default: false,
        },
      ]);
      expect(result).toBe(true);
    });

    test("should use custom default value", async () => {
      inquirer.prompt.mockResolvedValue({ confirm: false });

      const result = await prompts.confirmPrompt("Continue?", true);

      expect(inquirer.prompt).toHaveBeenCalledWith([
        {
          type: "confirm",
          name: "confirm",
          message: "Continue?",
          default: true,
        },
      ]);
      expect(result).toBe(false);
    });
  });

  describe("selectPrompt", () => {
    test("should show select prompt with choices", async () => {
      const choices = ["Option 1", "Option 2", "Option 3"];
      inquirer.prompt.mockResolvedValue({ selection: "Option 2" });

      const result = await prompts.selectPrompt("Choose one:", choices);

      expect(inquirer.prompt).toHaveBeenCalledWith([
        {
          type: "list",
          name: "selection",
          message: "Choose one:",
          choices: choices,
        },
      ]);
      expect(result).toBe("Option 2");
    });

    test("should handle choice objects", async () => {
      const choices = [
        { name: "First", value: 1 },
        { name: "Second", value: 2 },
      ];
      inquirer.prompt.mockResolvedValue({ selection: 2 });

      const result = await prompts.selectPrompt("Pick:", choices);

      expect(result).toBe(2);
    });
  });

  describe("inputPrompt", () => {
    test("should show input prompt", async () => {
      inquirer.prompt.mockResolvedValue({ input: "user input" });

      const result = await prompts.inputPrompt("Enter name:");

      expect(inquirer.prompt).toHaveBeenCalledWith([
        {
          type: "input",
          name: "input",
          message: "Enter name:",
        },
      ]);
      expect(result).toBe("user input");
    });

    test("should use default value", async () => {
      inquirer.prompt.mockResolvedValue({ input: "default" });

      const result = await prompts.inputPrompt("Name:", "default");

      expect(inquirer.prompt).toHaveBeenCalledWith([
        {
          type: "input",
          name: "input",
          message: "Name:",
          default: "default",
        },
      ]);
    });

    test("should validate input", async () => {
      const validate = jest.fn().mockReturnValue(true);
      inquirer.prompt.mockResolvedValue({ input: "valid" });

      await prompts.inputPrompt("Input:", "", validate);

      expect(inquirer.prompt).toHaveBeenCalledWith([
        {
          type: "input",
          name: "input",
          message: "Input:",
          validate: validate,
        },
      ]);
    });
  });

  describe("multiSelectPrompt", () => {
    test("should show checkbox prompt", async () => {
      const choices = ["A", "B", "C"];
      inquirer.prompt.mockResolvedValue({ selections: ["A", "C"] });

      const result = await prompts.multiSelectPrompt(
        "Select multiple:",
        choices,
      );

      expect(inquirer.prompt).toHaveBeenCalledWith([
        {
          type: "checkbox",
          name: "selections",
          message: "Select multiple:",
          choices: choices,
        },
      ]);
      expect(result).toEqual(["A", "C"]);
    });

    test("should handle pre-selected choices", async () => {
      const choices = [
        { name: "A", checked: true },
        { name: "B", checked: false },
        { name: "C", checked: true },
      ];
      inquirer.prompt.mockResolvedValue({ selections: ["A", "C"] });

      const result = await prompts.multiSelectPrompt("Select:", choices);

      expect(result).toEqual(["A", "C"]);
    });
  });

  test("should handle prompt errors", async () => {
    inquirer.prompt.mockRejectedValue(new Error("User cancelled"));

    await expect(prompts.confirmPrompt("Test?")).rejects.toThrow(
      "User cancelled",
    );
  });

  test("should format messages with chalk", async () => {
    inquirer.prompt.mockResolvedValue({ confirm: true });

    await prompts.confirmPrompt("Styled message", false, { style: "warning" });

    // Check that styling was attempted
    expect(chalk.yellow).toHaveBeenCalled();
  });
});
