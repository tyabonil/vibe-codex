# 🌿 Branch Naming Guide

## Quick Reference

### ✅ Correct Format
```
{type}/issue-{number}-{description}
```

### Types
- `feature` - New functionality
- `bugfix` - Bug fixes
- `hotfix` - Urgent production fixes

## Examples

### ✅ CORRECT Branch Names
```bash
feature/issue-61-healthcare-ai-blog
feature/issue-123-add-user-authentication
bugfix/issue-145-fix-compliance-check
hotfix/issue-99-security-patch
```

### ❌ INCORRECT Branch Names
```bash
issue-61-healthcare-ai-blog          # Missing 'feature/' prefix
feature-issue-61-blog                # Use '/' not '-' after type
feature/61-blog                      # Missing 'issue-' before number
add-new-feature                      # No issue reference
feature/issue-61                     # No description
FEATURE/issue-61-blog               # Type must be lowercase
feature/issue-61-Add New Feature    # No spaces or capitals in description
```

## Common Mistakes & Solutions

### 1. Missing Type Prefix
**❌ Wrong:** `issue-61-healthcare-ai-blog`  
**✅ Correct:** `feature/issue-61-healthcare-ai-blog`  
**Why:** The type prefix helps categorize the work

### 2. Wrong Separator After Type
**❌ Wrong:** `feature-issue-61-blog`  
**✅ Correct:** `feature/issue-61-blog`  
**Why:** Use forward slash `/` after type, not hyphen

### 3. Missing 'issue-' Before Number
**❌ Wrong:** `feature/61-blog`  
**✅ Correct:** `feature/issue-61-blog`  
**Why:** Consistent pattern for parsing

### 4. Spaces or Special Characters
**❌ Wrong:** `feature/issue-61-Add New Feature!`  
**✅ Correct:** `feature/issue-61-add-new-feature`  
**Why:** Use only lowercase letters, numbers, and hyphens

## How to Rename a Branch

If you've already created a branch with the wrong name:

```bash
# Rename locally
git branch -m old-branch-name feature/issue-123-proper-name

# Delete old remote branch (if pushed)
git push origin --delete old-branch-name

# Push with new name
git push -u origin feature/issue-123-proper-name
```

## Branch Name Validation

### Pre-push Hook
Install the branch validator to catch errors before pushing:
```bash
cp hooks/branch-name-validator.sh .git/hooks/pre-push
chmod +x .git/hooks/pre-push
```

### Manual Validation
Test if your branch name is valid:
```bash
./hooks/branch-name-validator.sh
```

## Tips for Good Descriptions

1. **Be concise but descriptive**
   - ✅ `user-authentication`
   - ❌ `auth`
   - ❌ `implement-complete-user-authentication-system-with-oauth`

2. **Use hyphens for word separation**
   - ✅ `add-payment-gateway`
   - ❌ `addPaymentGateway`
   - ❌ `add_payment_gateway`

3. **Focus on the what, not the how**
   - ✅ `email-notifications`
   - ❌ `use-sendgrid-for-emails`

## Automated Helpers

### Error Messages
The PR validation will now show:
- Your incorrect branch name
- The required format
- A suggested correction
- Examples of valid names

### Pre-push Validation
The pre-push hook will:
- Block pushes with invalid names
- Show exactly what's wrong
- Suggest a corrected name
- Provide rename commands

## FAQ

**Q: What if I'm working on something without an issue?**  
A: Create an issue first. Every code change should start with an issue.

**Q: Can I use other types like 'chore' or 'docs'?**  
A: Currently only feature/bugfix/hotfix are supported. Use 'feature' for other work.

**Q: What if my description is really long?**  
A: Keep it under 50 characters. Use the issue for detailed descriptions.

**Q: Can I use UPPERCASE?**  
A: No, always use lowercase for consistency.

---

*Following these conventions helps maintain a clean, organized repository and enables better automation.*