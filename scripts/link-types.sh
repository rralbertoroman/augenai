#!/bin/bash

# Navigate to the types package
cd packages/types

# Install dependencies and build the package
npm install
npm run build

# Create a global link
npm link

# Go to the web app and link the package
cd ../../apps/web
npm link @augenai/types
