#!/bin/bash
# Install AWS CLI

echo "Checking for AWS CLI..."

if ! command -v aws &> /dev/null
then
    echo "AWS CLI not found. Installing..."
    curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
    unzip awscliv2.zip
    sudo ./aws/install
else
    echo "AWS CLI already installed."
fi
