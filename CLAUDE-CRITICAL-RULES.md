# 🚨 CLAUDE CRITICAL RULES - CHECK FIRST, ALWAYS!

## ❌ NEVER DO THESE COMMANDS:
- **NEVER use `npm run dev`** → Use `npm run build` instead (Prisma file lock issues)
- **NEVER use `find`, `grep`, `cat`, `ls` bash commands** → Use Read, Grep, LS tools instead
- **NEVER install react-router-dom** → Breaks Vercel deployment with pnpm lockfile conflicts

## ❌ NEVER DO THESE ACTIONS:
- **NEVER push to git without asking first** → Always batch multiple changes together
- **NEVER deploy without permission** → Remember Vercel 100/day limit
- **NEVER create new seeding scripts** → Use existing `scripts/seed-role-models.ts`
- **NEVER open multiple development ports on Windows** → SYSTEM CRASH RISK - Clear existing port first
- **NEVER use `taskkill /F /IM node.exe`** → KILLS THIS CHAT - Instead: 1) Check port usage with `netstat -ano | findstr :3001`, 2) Close specific PID with `taskkill //F //PID [number]` (note: double forward slashes), 3) Start server only on port 3001

## ✅ ALWAYS DO THESE FIRST:
- **CHECK this file before ANY system command**
- **READ file content with Read tool before ANY Edit operation** (MANDATORY)
- **ASK permission** before git push, deployment, or major changes
- **USE TOOLS**: Read instead of cat, Grep instead of grep, LS instead of ls
- **BATCH CHANGES**: Wait for 3-5 related changes before pushing

## 🖥️ WINDOWS-SPECIFIC:
- Expect Prisma file locking during builds → Retry once, then continue
- Use backslash paths: `D:\projects\...`
- PowerShell may require different syntax than Unix commands

---
**CRITICAL**: If you violate any rule above, STOP and update this file with the lesson learned!