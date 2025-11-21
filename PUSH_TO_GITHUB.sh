#!/bin/bash

# NearMe - Push to GitHub Script
# ================================

echo "🚀 NearMe - GitHub Push Script"
echo "================================"
echo ""

# Change to project directory
cd "/Users/bruuu/Downloads/NearMe-Frontend-Spec-codebase (1)"

echo "📊 Current Status:"
echo "---------------"
git log --oneline -3
echo ""

echo "📍 Remote Repository:"
echo "------------------"
git remote -v
echo ""

echo "🌿 Current Branch:"
echo "----------------"
git branch
echo ""

echo "📦 Files Ready to Push:"
echo "---------------------"
echo "✅ 98 files committed"
echo "✅ 31,343+ lines of code"
echo "✅ 3 commits prepared"
echo ""

echo "🔐 AUTHENTICATION REQUIRED"
echo "=========================="
echo ""
echo "⚠️  GitHub requires authentication to push code."
echo ""
echo "Choose your authentication method:"
echo ""
echo "1️⃣  Personal Access Token (Recommended)"
echo "   • Visit: https://github.com/settings/tokens"
echo "   • Click 'Generate new token (classic)'"
echo "   • Select scope: ✅ repo"
echo "   • Copy the token"
echo ""
echo "2️⃣  GitHub CLI"
echo "   • Install: brew install gh"
echo "   • Run: gh auth login"
echo ""
echo "3️⃣  SSH Keys (if already configured)"
echo "   • Already set up? Just push!"
echo ""

read -p "👉 Press ENTER when you're ready to push (or Ctrl+C to cancel)..."

echo ""
echo "🚀 Pushing to GitHub..."
echo ""

# Attempt to push
git push -u origin main

# Check if push was successful
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ SUCCESS! Your code is now on GitHub!"
    echo "=========================================="
    echo ""
    echo "🌐 Repository: https://github.com/ashaheem32/Nearme_Ai"
    echo ""
    echo "📋 Next Steps:"
    echo "1. Visit your repository on GitHub"
    echo "2. Verify all files are there"
    echo "3. Deploy to Vercel:"
    echo "   • Go to: https://vercel.com/"
    echo "   • Click 'Import Project'"
    echo "   • Select your GitHub repo"
    echo "   • Add environment variables"
    echo "   • Click 'Deploy'"
    echo ""
    echo "🎉 Your NearMe app will be live in ~3 minutes!"
    echo ""
else
    echo ""
    echo "❌ Push failed - Authentication required"
    echo "========================================"
    echo ""
    echo "📝 SETUP INSTRUCTIONS:"
    echo ""
    echo "Option 1: Personal Access Token"
    echo "-------------------------------"
    echo "1. Visit: https://github.com/settings/tokens"
    echo "2. Generate new token (classic)"
    echo "3. Select: ✅ repo (full control)"
    echo "4. Copy the token"
    echo "5. Run this script again"
    echo "6. When prompted:"
    echo "   Username: ashaheem32"
    echo "   Password: [paste your token]"
    echo ""
    echo "Option 2: GitHub CLI (Easier)"
    echo "-----------------------------"
    echo "1. Install: brew install gh"
    echo "2. Authenticate: gh auth login"
    echo "3. Run this script again"
    echo ""
    echo "Option 3: Manual Push"
    echo "--------------------"
    echo "cd \"/Users/bruuu/Downloads/NearMe-Frontend-Spec-codebase (1)\""
    echo "git push -u origin main"
    echo ""
    echo "For detailed help, see: DEPLOYMENT_GUIDE.md"
    echo ""
fi
