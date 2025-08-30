#!/bin/bash

echo "🧹 Creating completely clean repository..."

# Step 1: Create backup directory
echo "📦 Creating backup of current secure files..."
mkdir -p ../copa-idp-demo-backup
cp -r . ../copa-idp-demo-backup/
echo "✅ Backup created at ../copa-idp-demo-backup"

# Step 2: Remove git history completely
echo "🗑️ Removing all git history..."
rm -rf .git

# Step 3: Initialize fresh git repository
echo "🆕 Initializing fresh git repository..."
git init
git branch -M main

# Step 4: Add all current files (which are now secure)
echo "📁 Adding secure files to new repository..."
git add .
git commit -m "Initial commit - Secure IDP Demo Application

Features:
- Document upload with progress tracking
- AWS Amplify authentication (configurable)
- Environment-based configuration
- Security protections and pre-commit hooks
- Clean, professional UI matching app branding"

echo "✅ Clean repository created!"
echo ""
echo "📤 Next steps:"
echo "1. Add your GitHub remote:"
echo "   git remote add origin https://github.com/laurencegoolsby/copa-idp-demo"
echo ""
echo "2. Force push to replace the old repository:"
echo "   git push origin --force --all"
echo ""
echo "⚠️  This will completely replace your GitHub repository!"
echo "The old history with sensitive data will be permanently removed."