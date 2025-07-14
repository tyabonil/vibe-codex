/**
 * Git platform factory and manager
 */

const GitHubPlatform = require("./github");
// Future: const GitLabPlatform = require('./gitlab');
// Future: const BitbucketPlatform = require('./bitbucket');
// Future: const GenericGitPlatform = require('./generic');

class PlatformManager {
  constructor(config = {}) {
    this.config = config;
    this.platforms = {
      github: GitHubPlatform,
      // Future: gitlab: GitLabPlatform,
      // Future: bitbucket: BitbucketPlatform,
      // Future: generic: GenericGitPlatform
    };
    this.activePlatform = null;
  }

  /**
   * Detect and initialize the appropriate git platform
   * @returns {Promise<GitPlatform>} Initialized platform instance
   */
  async detect() {
    // Check each platform in order
    for (const [name, PlatformClass] of Object.entries(this.platforms)) {
      const platform = new PlatformClass(this.config[name] || {});

      if (await platform.isAvailable()) {
        await platform.initialize();
        this.activePlatform = platform;
        return platform;
      }
    }

    throw new Error("No supported git platform detected");
  }

  /**
   * Get a specific platform by name
   * @param {string} platformName - Platform name
   * @returns {Promise<GitPlatform>} Initialized platform instance
   */
  async getPlatform(platformName) {
    if (!this.platforms[platformName]) {
      throw new Error(`Unknown platform: ${platformName}`);
    }

    const PlatformClass = this.platforms[platformName];
    const platform = new PlatformClass(this.config[platformName] || {});

    if (!(await platform.isAvailable())) {
      throw new Error(`Platform ${platformName} is not available`);
    }

    await platform.initialize();
    return platform;
  }

  /**
   * Get the active platform
   * @returns {GitPlatform} Active platform instance
   */
  getActivePlatform() {
    if (!this.activePlatform) {
      throw new Error("No platform has been initialized");
    }
    return this.activePlatform;
  }

  /**
   * List all available platforms
   * @returns {Promise<Array>} List of available platform names
   */
  async listAvailable() {
    const available = [];

    for (const [name, PlatformClass] of Object.entries(this.platforms)) {
      const platform = new PlatformClass(this.config[name] || {});
      if (await platform.isAvailable()) {
        available.push(name);
      }
    }

    return available;
  }
}

// Export the platform manager and base class
module.exports = {
  PlatformManager,
  GitPlatform: require("./base"),
};
