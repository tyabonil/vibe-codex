#!/bin/bash
# Setup script for review bots

echo "🤖 Setting up Review Bots..."

# Make CLI scripts executable
chmod +x bin/*.js

# Create symlinks if needed
if [ ! -L "/usr/local/bin/hater-bot" ]; then
  npm link
fi

echo "✅ Review Bots setup complete!"
echo ""
echo "Available commands:"
echo "  - hater-bot [files...]     # Run the Hater Bot"
echo "  - white-knight-bot [files...] # Run the White Knight Bot"
echo "  - balance-bot [files...]   # Run the Balance Bot"
echo "  - review-bots [files...]   # Run all three bots"