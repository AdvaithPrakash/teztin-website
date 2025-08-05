# Render Deployment Guide

## Step 1: Create Render Account
1. Go to https://render.com
2. Sign up with your GitHub account
3. Click "New Web Service"

## Step 2: Connect Repository
1. Select "Connect a repository"
2. Choose your GitHub repository: `AdvaithPrakash/teztin-website`
3. Click "Connect"

## Step 3: Configure Web Service
1. **Name**: `teztin-website`
2. **Environment**: `Node`
3. **Build Command**: `npm install`
4. **Start Command**: `npm start`
5. **Plan**: `Free`

## Step 4: Add PostgreSQL Database
1. Click "New" → "PostgreSQL"
2. **Name**: `teztin-database`
3. **Plan**: `Free`
4. Wait for creation

## Step 5: Connect Database to Web Service
1. Go back to your web service
2. Click "Environment" tab
3. Add environment variable:
   - **Key**: `PG_URL`
   - **Value**: Copy from PostgreSQL service's "Connect" tab

## Step 6: Deploy
1. Click "Create Web Service"
2. Wait for deployment (2-3 minutes)
3. Your app will be available at: `https://your-app-name.onrender.com`

## Step 7: Test
1. Go to your Render URL
2. Submit a test form
3. Check if data appears in PostgreSQL

## Benefits of Render:
- ✅ More reliable than Railway
- ✅ Better error messages
- ✅ Easier debugging
- ✅ Free tier available 