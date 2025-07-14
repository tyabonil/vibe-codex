#!/bin/bash

echo "Testing vibe-codex commands..."

# Test help
echo "=== Testing help ==="
node bin/vibe-codex.js --help

# Test version
echo -e "\n=== Testing version ==="
node bin/vibe-codex.js --version

# Test init help
echo -e "\n=== Testing init help ==="
node bin/vibe-codex.js init --help

# Test config help
echo -e "\n=== Testing config help ==="
node bin/vibe-codex.js config --help

# Test validate help
echo -e "\n=== Testing validate help ==="
node bin/vibe-codex.js validate --help

# Test doctor help
echo -e "\n=== Testing doctor help ==="
node bin/vibe-codex.js doctor --help

# Test status help
echo -e "\n=== Testing status help ==="
node bin/vibe-codex.js status --help

echo -e "\nAll command help tests completed!"