#!/bin/bash

# Teztin Contact System - Deployment Script
# This script helps deploy your application to various platforms

echo "🚀 Teztin Contact System - Deployment Script"
echo "=============================================="

# Check if we're in the right directory
if [ ! -f "glassmorphism-backend.js" ]; then
    echo "❌ Error: Please run this script from the teztin-website directory"
    exit 1
fi

# Function to deploy to Heroku
deploy_heroku() {
    echo "📦 Deploying to Heroku..."
    
    # Check if Heroku CLI is installed
    if ! command -v heroku &> /dev/null; then
        echo "❌ Heroku CLI not found. Please install it first:"
        echo "   https://devcenter.heroku.com/articles/heroku-cli"
        exit 1
    fi
    
    # Check if logged in
    if ! heroku auth:whoami &> /dev/null; then
        echo "🔐 Please login to Heroku first:"
        heroku login
    fi
    
    # Create app if it doesn't exist
    if [ -z "$HEROKU_APP_NAME" ]; then
        echo "📝 Creating Heroku app..."
        heroku create
    else
        echo "📝 Using existing app: $HEROKU_APP_NAME"
        heroku git:remote -a $HEROKU_APP_NAME
    fi
    
    # Add PostgreSQL if not already added
    echo "🗄️ Setting up PostgreSQL..."
    heroku addons:create heroku-postgresql:mini --app $HEROKU_APP_NAME 2>/dev/null || echo "PostgreSQL already configured"
    
    # Set environment variables
    echo "⚙️ Setting environment variables..."
    heroku config:set NODE_ENV=production --app $HEROKU_APP_NAME
    
    # Deploy
    echo "🚀 Deploying application..."
    git add .
    git commit -m "Deploy to Heroku" || git commit -m "Update deployment"
    git push heroku main
    
    echo "✅ Deployment complete!"
    echo "🌐 Your app is available at: https://$HEROKU_APP_NAME.herokuapp.com"
    echo "📊 Dashboard: https://$HEROKU_APP_NAME.herokuapp.com/dashboard"
}

# Function to deploy to Railway
deploy_railway() {
    echo "📦 Deploying to Railway..."
    
    # Check if Railway CLI is installed
    if ! command -v railway &> /dev/null; then
        echo "❌ Railway CLI not found. Please install it first:"
        echo "   npm install -g @railway/cli"
        exit 1
    fi
    
    # Login to Railway
    railway login
    
    # Deploy
    railway up
    
    echo "✅ Deployment complete!"
    echo "🌐 Check your Railway dashboard for the URL"
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

# Main menu
echo ""
echo "Choose an option:"
echo "1) Deploy to Heroku"
echo "2) Deploy to Railway"
echo "3) Setup local development"
echo "4) Test application"
echo "5) Exit"
echo ""

read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        deploy_heroku
        ;;
    2)
        deploy_railway
        ;;
    3)
        setup_local
        ;;
    4)
        test_app
        ;;
    5)
        echo "👋 Goodbye!"
        exit 0
        ;;
    *)
        echo "❌ Invalid choice. Please try again."
        exit 1
        ;;
esac 