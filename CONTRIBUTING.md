# Contributing to vibe-codex

We love your input! We want to make contributing to vibe-codex as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## Development Process

We use GitHub to host code, to track issues and feature requests, as well as accept pull requests.

1. Fork the repo and create your branch from `main`.
2. If you've added code that should be tested, add tests.
3. If you've changed APIs, update the documentation.
4. Ensure the test suite passes.
5. Make sure your code lints.
6. Issue that pull request!

## Pull Request Process

1. Update the README.md with details of changes to the interface, this includes new environment variables, exposed ports, useful file locations and container parameters.
2. Update the docs/ with any new features or changed behavior.
3. Increase the version numbers in any examples files and the README.md to the new version that this Pull Request would represent.
4. The PR will be merged once you have the sign-off of at least one maintainer.

## Any contributions you make will be under the MIT Software License

In short, when you submit code changes, your submissions are understood to be under the same [MIT License](http://choosealicense.com/licenses/mit/) that covers the project. Feel free to contact the maintainers if that's a concern.

## Report bugs using GitHub's [issues](https://github.com/tyabonil/vibe-codex/issues)

We use GitHub issues to track public bugs. Report a bug by [opening a new issue](https://github.com/tyabonil/vibe-codex/issues/new); it's that easy!

**Great Bug Reports** tend to have:

- A quick summary and/or background
- Steps to reproduce
  - Be specific!
  - Give sample code if you can
- What you expected would happen
- What actually happens
- Notes (possibly including why you think this might be happening, or stuff you tried that didn't work)

## Use a Consistent Coding Style

* 2 spaces for indentation rather than tabs
* You can try running `npm run lint` for style unification

## License

By contributing, you agree that your contributions will be licensed under its MIT License.

## Setting up your development environment

1. Clone your fork:
   ```bash
   git clone https://github.com/YOUR-USERNAME/vibe-codex.git
   cd vibe-codex
   ```

2. Install dependencies:
   ```bash
   cd vibe-codex
   npm install
   ```

3. Create a branch:
   ```bash
   git checkout -b feature/issue-XXX-description
   ```

4. Make your changes and test:
   ```bash
   npm test
   npm run lint
   ```

5. Commit your changes following our commit message convention:
   ```bash
   git commit -m "feat: add new validation rule for X"
   ```

## Commit Message Convention

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation only changes
- `style:` - Changes that don't affect the meaning of the code
- `refactor:` - Code change that neither fixes a bug nor adds a feature
- `test:` - Adding missing tests or correcting existing tests
- `chore:` - Changes to the build process or auxiliary tools


## Questions?

Feel free to open an issue with the label "question" if you have any questions about contributing!