#!/bin/bash

# Check if PHP is installed
if ! command -v php &> /dev/null; then
    echo "Error: PHP is not installed or not in your PATH"
    exit 1
fi

# Check if Composer is installed
if ! command -v composer &> /dev/null; then
    echo "Warning: Composer is not installed or not in your PATH"
    echo "You may need to install dependencies manually with 'php composer.phar install'"
fi

# Install dependencies if vendor directory doesn't exist
if [ ! -d "vendor" ]; then
    echo "Installing dependencies..."
    composer install
fi

# Create .env file from example if it doesn't exist
if [ ! -f ".env" ] && [ -f ".env.example" ]; then
    echo "Creating .env file from .env.example..."
    cp .env.example .env
    echo "Please update the .env file with your actual credentials"
fi

# Start PHP development server
echo "Starting PHP development server at http://localhost:8000"
echo "Press Ctrl+C to stop the server"
php -S localhost:8000