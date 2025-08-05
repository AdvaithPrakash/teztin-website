#!/bin/bash

# Teztin Contact System - PDF Conversion Script
# This script converts the HTML deployment guide to PDF

echo "📄 Converting Deployment Guide to PDF..."

# Check if we're in the right directory
if [ ! -f "DEPLOYMENT_GUIDE.html" ]; then
    echo "❌ Error: Please run this script from the teztin-website directory"
    exit 1
fi

# Function to convert using wkhtmltopdf
convert_wkhtmltopdf() {
    echo "🔄 Converting using wkhtmltopdf..."
    
    if command -v wkhtmltopdf &> /dev/null; then
        wkhtmltopdf --page-size A4 --margin-top 20 --margin-bottom 20 --margin-left 20 --margin-right 20 \
            --header-html '<html><head><style>body{font-family:Arial;font-size:12px;color:#666;text-align:center;}</style></head><body>Teztin Contact System - Deployment Guide</body></html>' \
            --footer-html '<html><head><style>body{font-family:Arial;font-size:10px;color:#666;text-align:center;}</style></head><body>Page [page] of [topage]</body></html>' \
            DEPLOYMENT_GUIDE.html DEPLOYMENT_GUIDE.pdf
        
        if [ $? -eq 0 ]; then
            echo "✅ PDF created successfully: DEPLOYMENT_GUIDE.pdf"
        else
            echo "❌ Error creating PDF with wkhtmltopdf"
        fi
    else
        echo "❌ wkhtmltopdf not found. Please install it first:"
        echo "   macOS: brew install wkhtmltopdf"
        echo "   Ubuntu: sudo apt-get install wkhtmltopdf"
        echo "   Windows: Download from https://wkhtmltopdf.org/"
    fi
}

# Function to convert using Chrome/Chromium
convert_chrome() {
    echo "🔄 Converting using Chrome/Chromium..."
    
    if command -v google-chrome &> /dev/null; then
        google-chrome --headless --disable-gpu --print-to-pdf="DEPLOYMENT_GUIDE.pdf" \
            --print-to-pdf-no-header file://$(pwd)/DEPLOYMENT_GUIDE.html
    elif command -v chromium-browser &> /dev/null; then
        chromium-browser --headless --disable-gpu --print-to-pdf="DEPLOYMENT_GUIDE.pdf" \
            --print-to-pdf-no-header file://$(pwd)/DEPLOYMENT_GUIDE.html
    elif command -v /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome &> /dev/null; then
        /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --headless --disable-gpu \
            --print-to-pdf="DEPLOYMENT_GUIDE.pdf" --print-to-pdf-no-header \
            file://$(pwd)/DEPLOYMENT_GUIDE.html
    else
        echo "❌ Chrome/Chromium not found"
        return 1
    fi
    
    if [ $? -eq 0 ]; then
        echo "✅ PDF created successfully: DEPLOYMENT_GUIDE.pdf"
    else
        echo "❌ Error creating PDF with Chrome/Chromium"
    fi
}

# Function to convert using pandoc
convert_pandoc() {
    echo "🔄 Converting using pandoc..."
    
    if command -v pandoc &> /dev/null; then
        pandoc DEPLOYMENT_GUIDE.html -o DEPLOYMENT_GUIDE.pdf --pdf-engine=wkhtmltopdf
        if [ $? -eq 0 ]; then
            echo "✅ PDF created successfully: DEPLOYMENT_GUIDE.pdf"
        else
            echo "❌ Error creating PDF with pandoc"
        fi
    else
        echo "❌ pandoc not found. Please install it first:"
        echo "   macOS: brew install pandoc"
        echo "   Ubuntu: sudo apt-get install pandoc"
        echo "   Windows: Download from https://pandoc.org/"
    fi
}

# Function to open HTML in browser for manual conversion
open_browser() {
    echo "🌐 Opening HTML in browser for manual conversion..."
    
    if command -v open &> /dev/null; then
        open DEPLOYMENT_GUIDE.html
    elif command -v xdg-open &> /dev/null; then
        xdg-open DEPLOYMENT_GUIDE.html
    else
        echo "❌ Could not open browser automatically"
        echo "📝 Please open DEPLOYMENT_GUIDE.html in your browser and print to PDF"
    fi
    
    echo "📋 Instructions for manual conversion:"
    echo "1. Open DEPLOYMENT_GUIDE.html in your browser"
    echo "2. Press Ctrl+P (or Cmd+P on Mac)"
    echo "3. Select 'Save as PDF'"
    echo "4. Save as 'DEPLOYMENT_GUIDE.pdf'"
}

# Main conversion logic
echo "Choose conversion method:"
echo "1) wkhtmltopdf (recommended)"
echo "2) Chrome/Chromium"
echo "3) pandoc"
echo "4) Open in browser for manual conversion"
echo "5) Exit"
echo ""

read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        convert_wkhtmltopdf
        ;;
    2)
        convert_chrome
        ;;
    3)
        convert_pandoc
        ;;
    4)
        open_browser
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

# Check if PDF was created
if [ -f "DEPLOYMENT_GUIDE.pdf" ]; then
    echo ""
    echo "🎉 PDF conversion completed!"
    echo "📄 File: DEPLOYMENT_GUIDE.pdf"
    echo "📏 Size: $(du -h DEPLOYMENT_GUIDE.pdf | cut -f1)"
    
    # Offer to open the PDF
    read -p "Would you like to open the PDF? (y/n): " open_pdf
    if [ "$open_pdf" = "y" ] || [ "$open_pdf" = "Y" ]; then
        if command -v open &> /dev/null; then
            open DEPLOYMENT_GUIDE.pdf
        elif command -v xdg-open &> /dev/null; then
            xdg-open DEPLOYMENT_GUIDE.pdf
        else
            echo "❌ Could not open PDF automatically"
        fi
    fi
else
    echo ""
    echo "⚠️ PDF was not created. Please try manual conversion:"
    open_browser
fi 