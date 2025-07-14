/**
 * Tests for simplified menu system
 */

const { mainMenu } = require("../../lib/menu");
const inquirer = require("inquirer");

// Mock dependencies
jest.mock("inquirer");
jest.mock("../../lib/commands", () => ({
  init: jest.fn(),
  config: jest.fn(),
  uninstall: jest.fn(),
}));

describe("Menu System", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock console methods
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("mainMenu", () => {
    it("should display main menu with correct options", async () => {
      // Mock user selecting exit
      inquirer.prompt.mockResolvedValueOnce({ action: "exit" });

      // Mock process.exit
      const mockExit = jest.spyOn(process, "exit").mockImplementation(() => {});

      await mainMenu();

      expect(inquirer.prompt).toHaveBeenCalledWith([
        {
          type: "list",
          name: "action",
          message: "What would you like to do?",
          choices: expect.arrayContaining([
            expect.objectContaining({ value: "init" }),
            expect.objectContaining({ value: "config" }),
            expect.objectContaining({ value: "view" }),
            expect.objectContaining({ value: "uninstall" }),
            expect.objectContaining({ value: "exit" }),
          ]),
          pageSize: 10,
        },
      ]);

      expect(mockExit).toHaveBeenCalledWith(0);
    });

    it("should call init command when selected", async () => {
      const { init } = require("../../lib/commands");

      // Mock user selecting init then exit
      inquirer.prompt
        .mockResolvedValueOnce({ action: "init" })
        .mockResolvedValueOnce({ action: "exit" });

      const mockExit = jest.spyOn(process, "exit").mockImplementation(() => {});

      await mainMenu();

      expect(init).toHaveBeenCalled();
      expect(mockExit).toHaveBeenCalledWith(0);
    });

    it("should call config command when selected", async () => {
      const { config } = require("../../lib/commands");

      // Mock user selecting config then exit
      inquirer.prompt
        .mockResolvedValueOnce({ action: "config" })
        .mockResolvedValueOnce({ action: "exit" });

      const mockExit = jest.spyOn(process, "exit").mockImplementation(() => {});

      await mainMenu();

      expect(config).toHaveBeenCalled();
    });

    it("should call uninstall command when selected", async () => {
      const { uninstall } = require("../../lib/commands");

      // Mock user selecting uninstall then exit
      inquirer.prompt
        .mockResolvedValueOnce({ action: "uninstall" })
        .mockResolvedValueOnce({ action: "exit" });

      const mockExit = jest.spyOn(process, "exit").mockImplementation(() => {});

      await mainMenu();

      expect(uninstall).toHaveBeenCalled();
    });

    it("should handle view config option", async () => {
      const fs = require("fs").promises;
      jest.spyOn(fs, "access").mockRejectedValue(new Error("File not found"));

      // Mock user selecting view then exit
      inquirer.prompt
        .mockResolvedValueOnce({ action: "view" })
        .mockResolvedValueOnce({ action: "exit" });

      const mockExit = jest.spyOn(process, "exit").mockImplementation(() => {});

      await mainMenu();

      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining("No configuration found"),
      );
    });
  });
});
