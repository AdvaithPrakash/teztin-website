# GitHub Pages Setup Guide

## Overview
This guide shows you how to host your Teztin website on GitHub Pages for free. Since GitHub Pages only supports static websites, we'll use a simplified version that works with free form services.

## Step 1: Prepare Your Repository

1. **Rename the static file:**
   ```bash
   mv static-version.html index.html
   ```

2. **Commit the changes:**
   ```bash
   git add index.html
   git commit -m "Add static version for GitHub Pages"
   git push origin main
   ```

## Step 2: Enable GitHub Pages

1. **Go to your repository on GitHub**
2. **Click "Settings" tab**
3. **Scroll down to "Pages" section**
4. **Under "Source", select "Deploy from a branch"**
5. **Choose "main" branch**
6. **Click "Save"**

## Step 3: Set Up Form Handling

Since GitHub Pages can't run a backend, we'll use a free form service:

### Option 1: Formspree (Recommended)
1. Go to [Formspree.io](https://formspree.io)
2. Sign up for free
3. Create a new form
4. Copy your form ID
5. Replace `YOUR_FORM_ID` in the HTML with your actual form ID

### Option 2: Netlify Forms
1. Deploy to Netlify (also free)
2. Forms work automatically
3. Get form submissions in Netlify dashboard

## Step 4: Access Your Website

Your website will be available at:
```
https://yourusername.github.io/teztin-website
```

## What You Get

✅ **Free hosting** (unlimited)
✅ **Custom domain** (optional)
✅ **SSL certificate** (automatic)
✅ **Contact form** (with free service)
✅ **Professional URL**
✅ **Auto-deployment** from GitHub

## Limitations

❌ **No database** (GitHub Pages is static only)
❌ **No server-side processing**
❌ **No dashboard** (would need separate backend)
❌ **Form submissions** go to external service

## Alternative: Full Version with Backend

If you want the full version with dashboard and database:

1. **Use Railway** (recommended)
2. **Use Render**
3. **Use Vercel + Supabase**

These platforms support Node.js and databases for free.

## Quick Commands

```bash
# Update your site
git add .
git commit -m "Update website"
git push origin main

# Your site updates automatically!
```

## Support

- **GitHub Pages Docs:** https://docs.github.com/en/pages
- **Formspree Docs:** https://formspree.io/docs
- **Netlify Docs:** https://docs.netlify.com

Your website will be live in minutes with GitHub Pages! 