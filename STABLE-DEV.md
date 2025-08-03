# Stable Development Environment Guide

## 🚨 CRITICAL: Preventing System Crashes

The Next.js dev server can get into corrupted states that cause system crashes. Follow this guide for stable development.

## ✅ **Stable Development Commands**

### **Primary Development Workflow:**
```bash
# 1. ALWAYS start with clean slate
npm run dev:safe

# 2. If that fails, use full reset
npm run reset && npm run dev:safe
```

### **Available Stable Scripts:**
- `npm run dev:safe` - Kills port + cleans cache + starts dev server
- `npm run dev:clean` - Cleans cache + regenerates Prisma + starts dev  
- `npm run build:clean` - Clean build for production testing
- `npm run kill-port` - Force kill any process using port 3001
- `npm run reset` - Nuclear option: clean + reinstall + generate

## 🚨 **When Dev Server Gets Unstable:**

### **Symptoms of Instability:**
- Port 3001 already in use errors
- Webpack module resolution errors  
- 500 internal server errors on API routes
- Build works but dev server crashes
- Cannot kill dev server with Ctrl+C

### **Recovery Steps (In Order):**
1. **First**: `Ctrl+C` to stop dev server
2. **Then**: `npm run kill-port` (kills any stuck processes)
3. **Then**: `npm run clean` (removes corrupted .next cache)
4. **Finally**: `npm run dev` (restart clean)

### **Nuclear Option (System Getting Sluggish):**
```bash
npm run reset  # Clean everything + reinstall
npm run dev    # Start fresh
```

## 🔧 **Technical Root Causes:**

1. **Next.js .next Cache Corruption**: Hot reload can corrupt webpack cache
2. **Port Not Released**: Dev server doesn't always release port 3001 cleanly  
3. **Prisma Client Issues**: Schema changes without regeneration
4. **Memory Leaks**: Long-running dev sessions consume system resources
5. **File Locks**: Windows file locks prevent clean shutdowns

## ⚡ **Best Practices:**

### **Before Each Coding Session:**
- Start with `npm run dev:safe` 
- Verify http://localhost:3001/api/role-models works
- Test one API endpoint before making changes

### **After Making Changes:**
- Test functionality immediately after TypeScript fixes
- Run `npm run build:clean` before pushing to catch errors
- Use production testing when local dev is unstable

### **Daily Maintenance:**
- Run `npm run reset` once per day to prevent cache buildup
- Close dev server cleanly with Ctrl+C when done
- Monitor system resources during development

## 🚫 **Never Do This:**
- Force kill node.exe from Task Manager (causes file locks)
- Delete .next folder manually while dev server running
- Run multiple dev servers simultaneously  
- Ignore "port already in use" errors and use different ports

## 📝 **Quick Reference:**
```bash
# Starting development
npm run dev:safe

# If something breaks
npm run kill-port && npm run clean && npm run dev

# Before pushing to production  
npm run build:clean

# Daily reset (prevent cache buildup)
npm run reset && npm run dev
```

This workflow prevents the crashes that require full system reboots.