#!/bin/bash

# Factory Pulse - Vercel Deployment Script
# This script automates the deployment process to Vercel

set -e  # Exit on any error

echo "🚀 Factory Pulse - Vercel Deployment Script"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    print_error "Vercel CLI is not installed. Installing now..."
    npm i -g vercel
    print_status "Vercel CLI installed successfully"
else
    print_status "Vercel CLI is already installed"
fi

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    print_error "Not in a git repository. Please initialize git first."
    exit 1
fi

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    print_warning "You have uncommitted changes. Committing them now..."
    git add .
    git commit -m "Prepare for Vercel deployment - $(date)"
    print_status "Changes committed successfully"
fi

# Test build locally
print_status "Testing build locally..."
if npm run build; then
    print_status "Local build successful"
else
    print_error "Local build failed. Please fix build issues before deploying."
    exit 1
fi

# Check if environment variables are set
print_status "Checking environment variables..."

if [ -z "$VITE_SUPABASE_URL" ]; then
    print_warning "VITE_SUPABASE_URL not set. You'll need to set this in Vercel dashboard."
fi

if [ -z "$VITE_SUPABASE_ANON_KEY" ]; then
    print_warning "VITE_SUPABASE_ANON_KEY not set. You'll need to set this in Vercel dashboard."
fi

# Login to Vercel (if not already logged in)
print_status "Checking Vercel authentication..."
if ! vercel whoami &> /dev/null; then
    print_warning "Not logged in to Vercel. Please login:"
    vercel login
fi

# Deploy to Vercel
print_status "Deploying to Vercel..."
echo "Choose deployment type:"
echo "1) Preview deployment (vercel)"
echo "2) Production deployment (vercel --prod)"
read -p "Enter choice (1 or 2): " choice

case $choice in
    1)
        print_status "Deploying to preview..."
        vercel
        ;;
    2)
        print_status "Deploying to production..."
        vercel --prod
        ;;
    *)
        print_error "Invalid choice. Exiting."
        exit 1
        ;;
esac

print_status "Deployment completed!"
print_warning "Don't forget to:"
echo "  - Set environment variables in Vercel dashboard"
echo "  - Test all functionality on the live site"
echo "  - Check Supabase connection"
echo "  - Verify file uploads work"

echo ""
print_status "Deployment script completed successfully! 🎉"
