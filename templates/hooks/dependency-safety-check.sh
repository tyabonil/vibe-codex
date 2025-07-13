#!/bin/bash
# vibe-codex dependency safety check
# Checks for vulnerable dependencies in package managers

set -e

# Colors for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 Checking dependency safety...${NC}"

# Track if any vulnerabilities found
VULNS_FOUND=false

# Check if running in CI or pre-commit context
if [ "${VIBE_CODEX_HOOK_TYPE}" = "pre-commit" ] || [ "${CI}" = "true" ]; then
    FAIL_ON_VULN=true
else
    FAIL_ON_VULN=false
fi

# Check npm/yarn/pnpm projects
if [ -f "package-lock.json" ] || [ -f "yarn.lock" ] || [ -f "pnpm-lock.yaml" ]; then
    if command -v npm >/dev/null 2>&1 && [ -f "package-lock.json" ]; then
        echo -e "${BLUE}Checking npm dependencies...${NC}"
        
        # Run npm audit
        AUDIT_OUTPUT=$(npm audit --json 2>/dev/null || echo '{"vulnerabilities":{}}')
        
        # Parse vulnerabilities count
        VULNS=$(echo "$AUDIT_OUTPUT" | grep -o '"total":[0-9]*' | grep -o '[0-9]*' || echo "0")
        VULNS=${VULNS:-0}  # Default to 0 if empty
        
        if [ "$VULNS" -gt 0 ]; then
            echo -e "${RED}❌ Found $VULNS vulnerable dependencies!${NC}"
            
            # Show summary
            HIGH=$(echo "$AUDIT_OUTPUT" | grep -o '"high":[0-9]*' | grep -o '[0-9]*' || echo "0")
            HIGH=${HIGH:-0}
            CRITICAL=$(echo "$AUDIT_OUTPUT" | grep -o '"critical":[0-9]*' | grep -o '[0-9]*' || echo "0")
            CRITICAL=${CRITICAL:-0}
            
            if [ "$CRITICAL" -gt 0 ]; then
                echo -e "${RED}   Critical: $CRITICAL${NC}"
            fi
            if [ "$HIGH" -gt 0 ]; then
                echo -e "${RED}   High: $HIGH${NC}"
            fi
            
            echo -e "${YELLOW}Run 'npm audit' for details${NC}"
            VULNS_FOUND=true
        else
            echo -e "${GREEN}✅ No vulnerabilities found in npm dependencies${NC}"
        fi
    elif command -v yarn >/dev/null 2>&1 && [ -f "yarn.lock" ]; then
        echo -e "${BLUE}Checking yarn dependencies...${NC}"
        
        # Yarn audit returns non-zero on vulnerabilities
        if yarn audit --json 2>/dev/null | grep -q '"type":"auditAdvisory"'; then
            echo -e "${RED}❌ Vulnerable dependencies found!${NC}"
            echo -e "${YELLOW}Run 'yarn audit' for details${NC}"
            VULNS_FOUND=true
        else
            echo -e "${GREEN}✅ No vulnerabilities found in yarn dependencies${NC}"
        fi
    elif command -v pnpm >/dev/null 2>&1 && [ -f "pnpm-lock.yaml" ]; then
        echo -e "${BLUE}Checking pnpm dependencies...${NC}"
        
        # pnpm audit returns non-zero on vulnerabilities
        if ! pnpm audit --json 2>/dev/null >/dev/null; then
            echo -e "${RED}❌ Vulnerable dependencies found!${NC}"
            echo -e "${YELLOW}Run 'pnpm audit' for details${NC}"
            VULNS_FOUND=true
        else
            echo -e "${GREEN}✅ No vulnerabilities found in pnpm dependencies${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  Package manager not found or not supported${NC}"
        echo -e "${YELLOW}   Install npm, yarn, or pnpm to check for vulnerabilities${NC}"
    fi
fi

# Check Python projects
if [ -f "requirements.txt" ] || [ -f "Pipfile.lock" ] || [ -f "poetry.lock" ]; then
    if command -v pip-audit >/dev/null 2>&1; then
        echo -e "${BLUE}Checking Python dependencies...${NC}"
        
        if [ -f "requirements.txt" ]; then
            if ! pip-audit -r requirements.txt --format json 2>/dev/null | grep -q '"vulnerabilities": \[\]'; then
                echo -e "${RED}❌ Vulnerable Python dependencies found!${NC}"
                echo -e "${YELLOW}Run 'pip-audit' for details${NC}"
                VULNS_FOUND=true
            else
                echo -e "${GREEN}✅ No vulnerabilities found in Python dependencies${NC}"
            fi
        fi
    else
        echo -e "${YELLOW}⚠️  pip-audit not installed${NC}"
        echo -e "${YELLOW}   Install with: pip install pip-audit${NC}"
    fi
fi

# Check Ruby projects
if [ -f "Gemfile.lock" ]; then
    if command -v bundle-audit >/dev/null 2>&1; then
        echo -e "${BLUE}Checking Ruby dependencies...${NC}"
        
        if ! bundle-audit check 2>/dev/null; then
            echo -e "${RED}❌ Vulnerable Ruby dependencies found!${NC}"
            echo -e "${YELLOW}Run 'bundle-audit' for details${NC}"
            VULNS_FOUND=true
        else
            echo -e "${GREEN}✅ No vulnerabilities found in Ruby dependencies${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  bundle-audit not installed${NC}"
        echo -e "${YELLOW}   Install with: gem install bundler-audit${NC}"
    fi
fi

# Summary
if [ "$VULNS_FOUND" = true ]; then
    echo -e ""
    echo -e "${RED}🚨 Security vulnerabilities detected in dependencies!${NC}"
    echo -e "${YELLOW}Please update vulnerable packages before committing.${NC}"
    
    if [ "$FAIL_ON_VULN" = true ]; then
        exit 1
    else
        echo -e "${YELLOW}⚠️  Continuing despite vulnerabilities (not in pre-commit context)${NC}"
    fi
else
    echo -e ""
    echo -e "${GREEN}✅ All dependency checks passed!${NC}"
fi

exit 0