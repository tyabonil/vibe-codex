#!/bin/bash

# Post-deploy verification hook
# Verifies deployment success and rule compliance after PR merges

echo "🚀 Post-Deploy Verification"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Get deployment info
BRANCH=${1:-main}
DEPLOYMENT_URL=""

echo "📋 Checking deployment for branch: $BRANCH"
echo ""

# Check if we can detect deployment platform
if [ -f "vercel.json" ] || [ -f ".vercel/project.json" ]; then
    echo "🔍 Detected Vercel deployment"
    
    # Get latest deployment URL
    if command -v vercel &> /dev/null; then
        DEPLOYMENT_URL=$(vercel ls --scope=$(cat .vercel/project.json | jq -r .orgId) 2>/dev/null | grep "$BRANCH" | head -1 | awk '{print $2}' || echo "")
    fi
    
elif [ -f ".github/workflows"*"deploy"* ]; then
    echo "🔍 Detected GitHub Actions deployment"
    
elif [ -f "netlify.toml" ]; then
    echo "🔍 Detected Netlify deployment"
    
else
    echo "⚠️  Deployment platform not auto-detected"
fi

# Basic health checks
echo "🏥 Running health checks..."
echo ""

if [ -n "$DEPLOYMENT_URL" ]; then
    echo "🌐 Testing deployment URL: $DEPLOYMENT_URL"
    
    # Check if URL responds
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$DEPLOYMENT_URL" 2>/dev/null || echo "000")
    
    if [ "$HTTP_STATUS" = "200" ]; then
        echo "✅ Service responding (200 OK)"
    else
        echo "❌ Service health check failed (HTTP $HTTP_STATUS)"
        exit 1
    fi
    
    # Check for basic security headers
    HEADERS=$(curl -s -I "$DEPLOYMENT_URL" 2>/dev/null || echo "")
    
    if echo "$HEADERS" | grep -qi "x-frame-options"; then
        echo "✅ Security headers present"
    else
        echo "⚠️  Security headers missing"
    fi
    
else
    echo "⚠️  No deployment URL found, skipping URL checks"
fi

# Rule compliance checks in production
echo ""
echo "🔍 Verifying rule compliance..."

# Check for exposed secrets in public files
if [ -d "public" ] || [ -d "dist" ] || [ -d "build" ]; then
    echo "🔐 Scanning for exposed secrets..."
    
    SECRETS_FOUND=0
    
    # Check common patterns in built files
    for dir in public dist build; do
        if [ -d "$dir" ]; then
            # Look for API keys, tokens in JS files
            if find "$dir" -name "*.js" -exec grep -l "api[_-]\?key\|token\|secret" {} \; 2>/dev/null | head -1; then
                echo "❌ Potential secrets found in $dir"
                ((SECRETS_FOUND++))
            fi
        fi
    done
    
    if [ $SECRETS_FOUND -eq 0 ]; then
        echo "✅ No secrets exposed in build files"
    fi
fi

# Check environment variables are properly configured
echo ""
echo "🔧 Environment configuration check..."

if [ -f ".env.example" ]; then
    echo "✅ .env.example found"
else
    echo "⚠️  No .env.example found"
fi

# Test key application endpoints if we have a URL
if [ -n "$DEPLOYMENT_URL" ]; then
    echo ""
    echo "🧪 Testing key endpoints..."
    
    # Test API health if available
    API_HEALTH=$(curl -s "${DEPLOYMENT_URL}/api/health" 2>/dev/null || curl -s "${DEPLOYMENT_URL}/health" 2>/dev/null || echo "")
    
    if [ -n "$API_HEALTH" ]; then
        echo "✅ API endpoint responding"
    else
        echo "ℹ️  No API health endpoint found"
    fi
fi

echo ""
echo "📊 Deployment verification summary:"
echo "   - Service status: $([ "$HTTP_STATUS" = "200" ] && echo "✅ Healthy" || echo "❌ Failed")"
echo "   - Security headers: $(echo "$HEADERS" | grep -qi "x-frame-options" && echo "✅ Present" || echo "⚠️  Missing")"
echo "   - Secrets scan: $([ $SECRETS_FOUND -eq 0 ] && echo "✅ Clean" || echo "❌ Issues found")"
echo ""

if [ "$HTTP_STATUS" = "200" ] && [ $SECRETS_FOUND -eq 0 ]; then
    echo "🎉 Deployment verified successfully!"
    exit 0
else
    echo "❌ Deployment verification failed"
    exit 1
fi