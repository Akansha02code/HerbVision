#!/usr/bin/env bash
# exit on error
set -o errexit

# Install frontend dependencies and build
npm install
npm run build

# Install backend dependencies
pip install -r backend/requirements.txt
