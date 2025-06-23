# 🚨 Expo Web Build Error Patterns & Solutions

## 📋 **Critical Build Failure Patterns**

**Context:** Discovered during Squad app deployment crisis where `npx expo export --platform web` was consistently failing with exit code 1, causing 100% deployment failures.

---

## 🎯 **Pattern 1: Missing Web Dependencies**

### **Error Signature:**
```bash
CommandError: It looks like you're trying to use web support but don't have the required dependencies installed.
Please install react-dom@18.2.0, @expo/metro-runtime@~3.2.3
```

### **Root Cause:**
Expo web builds require specific dependencies that are not included by default.

### **Solution:**
```json
{
  "dependencies": {
    "react-dom": "18.2.0",
    "@expo/metro-runtime": "~3.2.3"
  }
}
```

### **Prevention:**
- Always include web dependencies when setting up Expo projects
- Use `expo install react-dom` to get compatible versions
- Verify dependencies before deploying to web platforms

---

## 🎯 **Pattern 2: TypeScript Compilation Errors**

### **Error Signature:**
```bash
Error: Command "npx expo export --platform web" exited with 1
(No specific TypeScript error shown in build logs)
```

### **Root Cause:**
Invalid React component props that don't match TypeScript interfaces cause silent compilation failures.

### **Example Issue:**
```typescript
// ❌ WRONG: Props not in component interface
<SimpleAuthProvider autoRefresh={true} refreshInterval={5 * 60 * 1000}>

// ✅ CORRECT: Only valid props
<SimpleAuthProvider>
```

### **Solution:**
1. Run `npx tsc --noEmit` locally to identify TypeScript errors
2. Ensure all component props match their TypeScript interfaces exactly
3. Remove or add props to match component definitions

### **Prevention:**
- Enable TypeScript strict mode in tsconfig.json
- Use TypeScript-aware editors with real-time error checking
- Run type checking in CI/CD before web builds

---

## 🎯 **Pattern 3: Metro Bundler ConfigError**

### **Error Signature:**
```bash
ConfigError: Cannot resolve entry file: The `main` field defined in your `package.json` points to an unresolvable or non-existent path.
```

### **Root Cause:**
Package.json main field points to wrong file extension or non-existent file.

### **Common Issues:**
```json
// ❌ WRONG: File doesn't exist
"main": "index.js"

// ✅ CORRECT: Actual entry file
"main": "index.ts"
```

### **Solution:**
1. Check if entry file actually exists
2. Update package.json main field to match actual file
3. Ensure entry file extension matches package.json

### **Prevention:**
- Verify entry point exists when setting up projects
- Use consistent file extensions throughout project
- Test builds locally before deploying

---

## 🎯 **Pattern 4: Vercel Framework Detection Issues**

### **Error Signature:**
```bash
Error: Route "app/api/auth/[...nextauth]/route.ts" does not match the required types of a Next.js Route.
"authOptions" is not a valid Route export field.
```

### **Root Cause:**
Vercel auto-detects Expo React Native projects as Next.js, causing incorrect build commands.

### **Solution:**
```json
// vercel.json
{
  "framework": null,
  "buildCommand": "expo export -p web",
  "outputDirectory": "dist",
  "rewrites": [
    {"source": "/:path*", "destination": "/"}
  ]
}
```

### **Prevention:**
- Always set "framework": null for Expo projects
- Use proper Expo build commands in deployment config
- Test Vercel deployments with small changes first

---

## 🔧 **Diagnostic Workflow**

### **When `npx expo export --platform web` fails:**

1. **Check Dependencies:**
   ```bash
   npm list react-dom @expo/metro-runtime
   ```

2. **Verify TypeScript:**
   ```bash
   npx tsc --noEmit
   ```

3. **Check Entry Point:**
   ```bash
   # Verify main field in package.json matches actual file
   cat package.json | grep "main"
   ls -la index.*
   ```

4. **Test Local Build:**
   ```bash
   npm run build:web
   # Should generate dist/ folder successfully
   ```

5. **Verify Vercel Config:**
   ```bash
   cat vercel.json | grep framework
   # Should be null for Expo projects
   ```

---

## 📊 **Impact Metrics**

**Before Pattern Application:**
- 100% build failure rate
- Complete app inaccessibility
- Deployment pipeline blocked

**After Pattern Application:**
- 100% build success rate
- Full app functionality restored
- Reliable deployment pipeline

---

## 🛡️ **Prevention Checklist**

- [ ] Web dependencies installed (`react-dom`, `@expo/metro-runtime`)
- [ ] TypeScript compilation clean (`npx tsc --noEmit`)
- [ ] Package.json main field matches actual entry file
- [ ] Vercel framework set to null for Expo projects
- [ ] Local build test passes (`expo export -p web`)

---

## 🔗 **Related Patterns**

- **Cross-platform development:** Ensure web-specific configurations don't break mobile builds
- **Dependency management:** Use `expo install` for compatibility-checked packages
- **CI/CD integration:** Include TypeScript checking in build pipelines
- **Platform detection:** Handle web vs mobile platform differences gracefully

---

**Impact:** These patterns resolve the most common causes of Expo web build failures, enabling reliable cross-platform deployment pipelines.