#!/bin/bash

# Setup Branch Cleanup Automation
# Installs hooks and configures automated branch cleanup

set -e

# Colors for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧹 Setting up Branch Cleanup Automation...${NC}"

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
    local source_file="hooks/post-merge-cleanup.sh"
    local target_file="$HOOKS_DIR/$hook_name"
    
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

# Install post-merge hook
echo -e "${BLUE}📥 Installing post-merge hook...${NC}"
install_hook "post-merge"

# Create configuration file
CONFIG_FILE=".git/branch-cleanup.config"
if [ ! -f "$CONFIG_FILE" ]; then
    cat > "$CONFIG_FILE" << EOF
# Branch Cleanup Configuration
# Set to false to disable automatic cleanup
BRANCH_CLEANUP_ENABLED=true

# Cleanup settings
AUTO_DELETE_MERGED=true
PRESERVE_RECENT_DAYS=7
CONFIRM_BEFORE_DELETE=false
EOF
    echo -e "${GREEN}✅ Created configuration file at $CONFIG_FILE${NC}"
fi

# Test the cleanup script
echo -e "${BLUE}🧪 Testing cleanup script...${NC}"
if [ -f "scripts/cleanup-branches.sh" ]; then
    echo -e "${CYAN}Running dry-run to test functionality...${NC}"
    ./scripts/cleanup-branches.sh --dry-run
    echo -e "${GREEN}✅ Cleanup script test completed${NC}"
else
    echo -e "${YELLOW}⚠️  Warning: cleanup script not found at scripts/cleanup-branches.sh${NC}"
fi

echo -e "${GREEN}✨ Branch cleanup automation installed successfully!${NC}"
echo -e "${BLUE}ℹ️  The system will:${NC}"
echo -e "  • Automatically delete merged branches after pulls/merges"
echo -e "  • Clean up remote tracking branches"
echo -e "  • Provide manual cleanup via scripts/cleanup-branches.sh"
echo -e "  • Run GitHub Actions for remote branch cleanup"
echo -e ""
echo -e "${YELLOW}💡 Manual cleanup options:${NC}"
echo -e "  ./scripts/cleanup-branches.sh                 # Interactive cleanup"
echo -e "  ./scripts/cleanup-branches.sh --dry-run       # Preview what would be deleted"
echo -e "  ./scripts/cleanup-branches.sh --force         # Cleanup without prompts"
echo -e "  ./scripts/cleanup-branches.sh --local-only    # Only clean local branches"
echo -e ""
echo -e "${YELLOW}💡 Configuration:${NC}"
echo -e "  export BRANCH_CLEANUP_ENABLED=false          # Disable automatic cleanup"
echo -e "  Edit $CONFIG_FILE                            # Customize settings"
echo -e ""
echo -e "${YELLOW}💡 To uninstall:${NC}"
echo -e "  rm $HOOKS_DIR/post-merge"
echo -e "  rm $CONFIG_FILE"