#!/bin/bash

# Teztin Contact System - Free Hosting Deployment Script
# This script helps deploy your application to free hosting platforms

echo "🚀 Teztin Contact System - Free Hosting Deployment"
echo "=================================================="

# Check if we're in the right directory
if [ ! -f "glassmorphism-backend.js" ]; then
    echo "❌ Error: Please run this script from the teztin-website directory"
    exit 1
fi

# Function to deploy to Railway (Recommended)
deploy_railway() {
    echo "📦 Deploying to Railway (FREE)..."
    
    # Check if Railway CLI is installed
    if ! command -v railway &> /dev/null; then
        echo "❌ Railway CLI not found. Installing..."
        npm install -g @railway/cli
    fi
    
    # Login to Railway
    echo "🔐 Logging into Railway..."
    railway login
    
    # Initialize Railway project
    echo "📝 Initializing Railway project..."
    railway init
    
    # Deploy
    echo "🚀 Deploying to Railway..."
    railway up
    
    echo "✅ Railway deployment complete!"
    echo "🌐 Check your Railway dashboard for the URL"
    echo "📊 Dashboard will be available at: https://your-app.railway.app/dashboard"
}

# Function to deploy to Render
deploy_render() {
    echo "📦 Deploying to Render (FREE)..."
    
    echo "📋 Instructions for Render deployment:"
    echo "1. Go to https://render.com"
    echo "2. Sign up with GitHub"
    echo "3. Create new Web Service"
    echo "4. Connect your GitHub repository"
    echo "5. Add PostgreSQL database (free tier)"
    echo "6. Set environment variables:"
    echo "   - NODE_ENV=production"
    echo "   - DB_HOST=your-render-db-host"
    echo "   - DB_PORT=5432"
    echo "   - DB_NAME=your-db-name"
    echo "   - DB_USER=your-db-user"
    echo "   - DB_PASSWORD=your-db-password"
    echo "7. Deploy!"
    
    echo ""
    echo "🌐 Your app will be available at: https://your-app.onrender.com"
}

# Function to deploy to Vercel + Supabase
deploy_vercel_supabase() {
    echo "📦 Deploying to Vercel + Supabase (FREE)..."
    
    # Check if Vercel CLI is installed
    if ! command -v vercel &> /dev/null; then
        echo "❌ Vercel CLI not found. Installing..."
        npm install -g vercel
    fi
    
    echo "📋 Instructions for Supabase setup:"
    echo "1. Go to https://supabase.com"
    echo "2. Create account and new project"
    echo "3. Get database connection details"
    echo "4. Set environment variables in Vercel"
    
    # Deploy to Vercel
    echo "🚀 Deploying to Vercel..."
    vercel
    
    echo "✅ Vercel deployment complete!"
    echo "🌐 Check your Vercel dashboard for the URL"
}

# Function to setup local development
setup_local() {
    echo "🔧 Setting up local development environment..."
    
    # Install dependencies
    npm install
    
    # Copy environment file
    if [ ! -f ".env" ]; then
        cp glassmorphism.env .env
        echo "📝 Created .env file from template"
    fi
    
    echo "✅ Local setup complete!"
    echo "🚀 Run 'npm start' to start the server"
    echo "🌐 Visit http://localhost:3001/dashboard"
}

# Function to test the application
test_app() {
    echo "🧪 Testing application..."
    
    # Start server in background
    npm start &
    SERVER_PID=$!
    
    # Wait for server to start
    sleep 5
    
    # Test endpoints
    echo "📊 Testing dashboard..."
    curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/dashboard
    
    echo "📋 Testing API..."
    curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/contacts
    
    # Stop server
    kill $SERVER_PID
    
    echo "✅ Testing complete!"
}

# Function to show free hosting options
show_options() {
    echo ""
    echo "🎯 FREE HOSTING OPTIONS:"
    echo "========================"
    echo ""
    echo "1) Railway (RECOMMENDED)"
    echo "   - 500 hours/month free"
    echo "   - Built-in PostgreSQL"
    echo "   - Custom domains"
    echo "   - Easy deployment"
    echo ""
    echo "2) Render"
    echo "   - 750 hours/month free"
    echo "   - PostgreSQL included"
    echo "   - Custom domains"
    echo "   - Auto-deploy from GitHub"
    echo ""
    echo "3) Vercel + Supabase"
    echo "   - Unlimited hosting"
    echo "   - 500MB database free"
    echo "   - Great performance"
    echo "   - Real-time features"
    echo ""
    echo "4) Local Development"
    echo "   - Test locally first"
    echo "   - No deployment needed"
    echo ""
    echo "5) Test Application"
    echo "   - Test endpoints"
    echo "   - Verify functionality"
    echo ""
    echo "6) Exit"
    echo ""
}

# Main menu
show_options

read -p "Enter your choice (1-6): " choice

case $choice in
    1)
        deploy_railway
        ;;
    2)
        deploy_render
        ;;
    3)
        deploy_vercel_supabase
        ;;
    4)
        setup_local
        ;;
    5)
        test_app
        ;;
    6)
        echo "👋 Goodbye!"
        exit 0
        ;;
    *)
        echo "❌ Invalid choice. Please try again."
        exit 1
        ;;
esac

echo ""
echo "🎉 Free hosting setup complete!"
echo "📄 For detailed instructions, see: FREE_HOSTING_GUIDE.html"
echo "💰 Total cost: $0" 