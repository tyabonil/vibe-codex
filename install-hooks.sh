#!/bin/bash

echo "Installing git hooks..."

# Create the .git/hooks directory if it doesn't exist
mkdir -p .git/hooks

# Create the pre-commit hook
cat > .git/hooks/pre-commit << EOL
#!/bin/bash

echo "Running pre-commit hooks..."

# Run the pr-health-check.sh script
bash hooks/pr-health-check.sh

# Run the security-pre-commit.sh script
bash hooks/security-pre-commit.sh
EOL

# Create the commit-msg hook
cat > .git/hooks/commit-msg << EOL
#!/bin/bash

echo "Running commit-msg hooks..."

# Run the commit-msg-validator.sh script
bash hooks/commit-msg-validator.sh \$1
EOL

# Make the hooks executable
chmod +x .git/hooks/pre-commit
chmod +x .git/hooks/commit-msg

echo "Git hooks installed successfully."
