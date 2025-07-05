#!/bin/bash
# Install Vercel CLI

echo "Checking for Vercel CLI..."

if ! command -v vercel &> /dev/null
then
    echo "Vercel CLI not found. Installing..."
    npm install -g vercel
else
    echo "Vercel CLI already installed."
fi
