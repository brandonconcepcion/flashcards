#!/bin/bash

# Study Flashcards - Quick Deployment Script

echo "🚀 Building Study Flashcards for deployment..."

# Build the project
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo ""
    echo "📁 Your built files are in the 'dist' folder"
    echo ""
    echo "🌐 Ready to deploy! Choose your preferred method:"
    echo ""
    echo "1. Netlify (Recommended):"
    echo "   - Go to https://netlify.com"
    echo "   - Drag and drop the 'dist' folder"
    echo "   - Your site will be live instantly!"
    echo ""
    echo "2. Vercel:"
    echo "   - Go to https://vercel.com"
    echo "   - Upload the 'dist' folder"
    echo ""
    echo "3. GitHub Pages:"
    echo "   - Push to GitHub"
    echo "   - Enable Pages in repo settings"
    echo ""
    echo "📖 See DEPLOYMENT.md for detailed instructions"
    echo ""
    echo "🎉 Your flashcards app is ready to go live!"
else
    echo "❌ Build failed. Please check the errors above."
    exit 1
fi
