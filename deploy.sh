#!/bin/bash

# Exit script if any command fails
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting Twinder deployment process...${NC}"

# Build the Frontend
echo -e "${YELLOW}Building frontend...${NC}"
cd packages/frontend
npm run build
echo -e "${GREEN}Frontend build complete!${NC}"

# Build the Backend
echo -e "${YELLOW}Building backend...${NC}"
cd ../backend
npm run build
echo -e "${GREEN}Backend build complete!${NC}"

# Create deployment directory if it doesn't exist
mkdir -p ../../deploy

# Copy frontend dist to public folder in backend
echo -e "${YELLOW}Copying frontend assets to backend...${NC}"
mkdir -p dist/public
cp -r ../frontend/dist/* dist/public/

# Copy backend files to deployment directory
echo -e "${YELLOW}Preparing deployment package...${NC}"
cp -r dist ../../deploy/
cp package.json ../../deploy/
cp .env ../../deploy/ 2>/dev/null || echo -e "${YELLOW}No .env file found, make sure to create one in production${NC}"

echo -e "${GREEN}Deployment package prepared successfully!${NC}"
echo -e "${YELLOW}To deploy, transfer the 'deploy' directory to your server and run:${NC}"
echo -e "  cd deploy"
echo -e "  npm install --production"
echo -e "  npm start"

# Return to the root directory
cd ../..

echo -e "${GREEN}Deployment build process completed!${NC}" 