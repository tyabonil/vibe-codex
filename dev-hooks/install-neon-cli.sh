#!/bin/bash
# Install Neon CLI

echo "Checking for Neon CLI..."

if ! command -v neon &> /dev/null
then
    echo "Neon CLI not found. Installing..."
    sudo sh -c "$(curl -fsSL https://raw.githubusercontent.com/neondatabase/cli/main/install.sh)"
else
    echo "Neon CLI already installed."
fi
