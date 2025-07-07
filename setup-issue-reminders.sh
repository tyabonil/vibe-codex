#!/bin/bash

# Setup script for issue reminder hooks
# This script installs git hooks that remind developers to update issues

set -e

# Colors for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔧 Setting up issue reminder hooks...${NC}"

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${RED}❌ Error: Not in a git repository${NC}"
    exit 1
fi

# Get the git hooks directory
HOOKS_DIR=$(git rev-parse --git-dir)/hooks

# Create hooks directory if it doesn't exist
mkdir -p "$HOOKS_DIR"

# Function to install a hook
install_hook() {
    local hook_name=$1
    local source_file="hooks/issue-reminder-${hook_name}.sh"
    local target_file="$HOOKS_DIR/${hook_name}"
    
    if [ ! -f "$source_file" ]; then
        echo -e "${YELLOW}⚠️  Warning: $source_file not found${NC}"
        return 1
    fi
    
    # Check if hook already exists
    if [ -f "$target_file" ]; then
        echo -e "${YELLOW}📝 Backing up existing $hook_name hook to ${hook_name}.backup${NC}"
        cp "$target_file" "${target_file}.backup"
    fi
    
    # Copy the hook
    cp "$source_file" "$target_file"
    chmod +x "$target_file"
    
    echo -e "${GREEN}✅ Installed $hook_name hook${NC}"
}

# Install the hooks
echo -e "${BLUE}📥 Installing hooks...${NC}"

install_hook "post-commit"
install_hook "pre-commit"
install_hook "pre-push"

# Install branch name validator as pre-push hook
if [ -f "hooks/branch-name-validator.sh" ]; then
    echo -e "${BLUE}🌿 Installing branch name validator...${NC}"
    # If pre-push already exists, combine them
    if [ -f "$HOOKS_DIR/pre-push" ]; then
        # Create a wrapper that calls both
        cat > "$HOOKS_DIR/pre-push-combined" << 'EOF'
#!/bin/bash
# Combined pre-push hook

# First run branch validation
if [ -f "$(git rev-parse --git-dir)/../hooks/branch-name-validator.sh" ]; then
    "$(git rev-parse --git-dir)/../hooks/branch-name-validator.sh"
    if [ $? -ne 0 ]; then
        exit 1
    fi
fi

# Then run issue reminder
if [ -f "$(git rev-parse --git-dir)/pre-push-original" ]; then
    "$(git rev-parse --git-dir)/pre-push-original" "$@"
fi
EOF
        mv "$HOOKS_DIR/pre-push" "$HOOKS_DIR/pre-push-original"
        mv "$HOOKS_DIR/pre-push-combined" "$HOOKS_DIR/pre-push"
        chmod +x "$HOOKS_DIR/pre-push"
        chmod +x "$HOOKS_DIR/pre-push-original"
    else
        cp "hooks/branch-name-validator.sh" "$HOOKS_DIR/pre-push"
        chmod +x "$HOOKS_DIR/pre-push"
    fi
    echo -e "${GREEN}✅ Branch name validator installed${NC}"
fi

# Create a config file for enabling/disabling reminders
CONFIG_FILE=".git/issue-reminders.config"
if [ ! -f "$CONFIG_FILE" ]; then
    cat > "$CONFIG_FILE" << EOF
# Issue Reminder Configuration
# Set to false to disable reminders
ISSUE_REMINDER_ENABLED=true

# Reminder settings
REMIND_ON_FIRST_COMMIT=true
REMIND_ON_PUSH=true
REMIND_ON_PR_CREATE=true
EOF
    echo -e "${GREEN}✅ Created configuration file at $CONFIG_FILE${NC}"
fi

echo -e "${GREEN}✨ Issue reminder hooks installed successfully!${NC}"
echo -e "${BLUE}ℹ️  The hooks will:${NC}"
echo -e "  • Remind you to update issues after your first commit"
echo -e "  • Check for PR creation before pushing"
echo -e "  • Ensure issues are linked to PRs"
echo -e ""
echo -e "${YELLOW}💡 To disable reminders temporarily:${NC}"
echo -e "  export ISSUE_REMINDER_ENABLED=false"
echo -e ""
echo -e "${YELLOW}💡 To uninstall:${NC}"
echo -e "  rm $HOOKS_DIR/post-commit"
echo -e "  rm $HOOKS_DIR/pre-commit"
echo -e "  rm $HOOKS_DIR/pre-push"