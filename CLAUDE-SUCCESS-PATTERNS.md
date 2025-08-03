# Claude Success Patterns - Proven Approaches That Work

**Principle**: These patterns have been tested and work reliably. Use them confidently.

---

## 🐛 DEBUGGING PATTERNS - PROVEN TECHNIQUES

### Complex State Issues Debugging Pattern ✅
**Use when**: React state appears to update but visual changes don't occur
1. **Add useEffect logging** to track state changes: `useEffect(() => console.log('State changed:', state), [state])`
2. **Add try/catch** around all state updates with error logging
3. **Log before/after** state updates: `console.log('Before:', prev.length, 'After:', updated.length)`
4. **Simplify object creation** - start with minimal fields, add complexity gradually
5. **Check both logs AND visual results** - successful logs don't guarantee visual success
6. **Use TodoWrite tool** to track debugging progress systematically

### React Beautiful DND Issues Pattern ✅  
**Use when**: Drag/drop shows correct logs but doesn't work visually
1. **Check for duplicate event handlers** - React Beautiful DND + HTML5 drag can conflict
2. **Add state tracking** for drag operations: `draggedActivityId`, `isDropTarget`, etc.
3. **Use precise logging** at each step: drag start → drag over → drop → state update → render
4. **Prevent duplicate processing** with unique keys/timestamps
5. **Test time calculations separately** from visual rendering
6. **Ensure React Strict Mode is disabled** for React Beautiful DND compatibility

### Timeline/Positioning Bugs Pattern ✅
**Use when**: Activities positioned incorrectly or outside visible range
1. **Extend timeline to full 24-hour range** by default - don't restrict to business hours
2. **Log position calculations**: pixel position, converted time, final placement
3. **Check time format consistency**: `scheduledTime` vs `time` field naming
4. **Add visual indicators** during drag to show exact drop position
5. **Test with current time** AND future times in different ranges

---

## 🛠️ DEVELOPMENT WORKFLOW PATTERNS

### File Modification Pattern ✅
1. **ALWAYS use Read tool to examine file structure first** (MANDATORY)
2. Copy EXACT text from Read output for Edit tool old_string
3. Use Edit or MultiEdit for changes (never guess file content)
4. Test locally if possible
5. Ask permission before git operations
6. Batch multiple related changes

### Command Execution Pattern ✅
1. Check `CLAUDE-CRITICAL-RULES.md` first
2. Verify in `COMMANDS-LEARNED.md`
3. Use tools (Read/Grep/LS) instead of bash when possible
4. Document outcomes in learned database

### Command Failure Recovery Pattern ✅
1. **Never retry failed command immediately**
2. Check `COMMANDS-LEARNED.md` for documented alternatives
3. Use appropriate tool instead of bash command when possible
4. Execute working alternative in same message
5. Document failure + solution immediately
6. Update commands database with new mapping

### Error Resolution Pattern ✅
1. **AUTO-DETECT** failure from tool error messages
2. **ANALYZE** root cause immediately (don't wait for user to tell you)
3. **STOP** failing approach immediately
4. **DOCUMENT** in `CLAUDE-MISTAKES-LOG.md` automatically
5. **FIND** working alternative from knowledge base or tools
6. **EXECUTE** working alternative in same message
7. **UPDATE** prevention rules in appropriate SOP files
8. **VALIDATE** that you completed all self-learning steps

---

## 📁 FILE SYSTEM PATTERNS

### Reading Files ✅
- **Always use**: Read tool with absolute paths
- **Batch multiple reads**: Use multiple Read calls in single message
- **For large files**: Use offset/limit parameters
- **Never use**: `cat`, `head`, `tail` bash commands

### Searching Code ✅
- **Pattern search**: Use Grep tool with regex patterns
- **File search**: Use Glob tool with patterns like "**/*.ts"
- **Open-ended search**: Use Task tool with general-purpose agent
- **Never use**: `find`, `grep` bash commands

### Directory Operations ✅
- **List contents**: Use LS tool with absolute paths
- **Ignore patterns**: Use ignore parameter with glob patterns
- **Never use**: `ls` bash command

---

## 🚀 BUILD & DEPLOYMENT PATTERNS

### Testing Changes ✅
1. Use `npm run build` (never `npm run dev`)
2. Expect Prisma file locking on Windows → retry once
3. TypeScript errors should be fixed, not ignored
4. Test functionality through web interface when possible

### Git Operations ✅
1. Always ask permission before any git command
2. Use meaningful commit messages with HEREDOC format
3. Batch 3-5 related changes before pushing
4. Include "Generated with Claude Code" footer
5. Co-authored by Claude line in commits

### Problem Resolution ✅
1. Read error messages carefully - they often contain the solution
2. Check if it's a known issue in mistakes log
3. Use tools instead of bash commands for file operations
4. When in doubt, ask rather than assume

---

## 🎯 UI/UX DEVELOPMENT PATTERNS

### Component Modification ✅
1. Read existing component structure first
2. Understand current styling and state management
3. Make minimal changes that don't break existing functionality
4. Test visual changes through screenshots when possible
5. Follow existing patterns and conventions

### API Development ✅
1. Check existing API patterns in codebase
2. Use consistent error handling approaches
3. Add proper TypeScript types
4. Test endpoints through curl or browser when possible
5. Document any new endpoints or changes

### Database Operations ✅
1. Use existing seeding scripts rather than creating new ones
2. Check Prisma schema for field names and types
3. Use JSON.stringify() for array/object fields consistently
4. Test database operations through the application

---

## 💡 LEARNING & DOCUMENTATION PATTERNS

### Knowledge Capture ✅
1. Document failures immediately when they occur
2. Update success patterns after solving problems
3. Cross-reference between knowledge files
4. Keep entries concise but complete
5. Update commands learned database with new findings

### User Communication ✅
1. Be concise and direct in responses
2. Focus on solutions rather than problems
3. Ask permission for major changes
4. Explain complex technical decisions when needed
5. Provide clear status updates on progress

---

## 🖥️ WINDOWS-SPECIFIC PATTERNS

### File Path Handling ✅
- Use backslash format: `D:\projects\...`
- Absolute paths work reliably
- Tools handle path conversion automatically

### Command Line Issues ✅
- Prisma file locking is common → retry builds
- PowerShell vs Command Prompt differences exist
- Git line ending warnings (CRLF) are normal and can be ignored
- Use tools instead of bash commands for better compatibility

### Environment Considerations ✅
- Windows file permissions can cause temporary locks
- Node.js tools generally work well
- File system operations through tools are more reliable than bash

---

## 🤖 MULTI-AGENT ORCHESTRATION PATTERNS

### Sequential Agent Deployment ✅
1. **Identify Dependencies**: Map which agents need outputs from other agents
2. **Phase 1 Launch**: Independent research/analysis agents only
3. **Wait for Completion**: Receive all Phase 1 outputs before proceeding
4. **Phase 2 Launch**: Design/planning agents using Phase 1 results as input
5. **Wait for Completion**: Receive all Phase 2 outputs before proceeding
6. **Phase 3 Launch**: Implementation agents using all prior results as input

### Multi-Agent Task Planning ✅
- **Research → Design → Implementation** sequence for complex features
- Include prior agent outputs in subsequent agent prompts
- Verify handoff dependencies before launching next phase
- Document agent coordination in project management

### Agent Communication Patterns ✅
- Pass specific file paths and outputs between agents
- Reference prior agent deliverables in follow-up prompts
- Create clear handoff documentation for each phase
- Maintain context continuity across agent phases

---

## 🕐 DEVELOPMENT SERVER MONITORING PATTERNS

### Live Server Status Detection ✅
1. **Always add live timestamp indicators to test/development pages**
2. **Use `{currentTime.toLocaleTimeString()}` updating every 1000ms**
3. **Visual indicators**: Distinct color (cyan) + "Server Live" label
4. **Immediate diagnosis**: Timestamp stops = server stopped, timestamp behind = stale cache
5. **Prevention**: Eliminates time waste debugging "broken code" when server is actually stopped

### Server Restart Protocol ✅
1. **Check netstat**: `netstat -ano | findstr :3001` to find process
2. **Kill process**: `taskkill //F //PID [PID]` (double slashes for Git Bash)
3. **Build + Start**: `npm run build && npx next start -p 3001`
4. **Verify**: Check live timestamp is updating on test pages
5. **Never assume code is wrong** until server status is confirmed

---

## 🐛 TIMELINE SYNCHRONIZATION BUG FIX PATTERN ✅

### Critical Timeline Drag Direction Bug (RESOLVED August 2, 2025)
**Problem**: Timeline visual position and time calculation were severely out of sync, showing wrong times (11+ hour offsets) when dragging timeline to center specific times.

**Root Cause Analysis**: The actual bug was NOT in the drag calculation sign, but in implementation differences between working and broken timelines:

1. **Working Timeline**: Uses fixed `4` pixels per minute
2. **Broken Timeline**: Uses variable `pixelsPerMinute` (4-8x zoom)
3. **Core Issue**: The mathematical relationships were correct, but coordinate system implementation needed proper adaptation from working code

**Mathematical Foundation**:
```typescript
// CORRECT coordinate system (timeline position calculation):
// position = -(time_in_minutes * pixelsPerMinute) + centerX + scrollOffset

// CORRECT drag calculation (confirmed working):
// minutesAtCenter = currentTimeMinutes - (scrollOffset / pixelsPerMinute)
```

**Fix Strategy**: 
1. **Adopt Working Logic**: Used exact positioning formula from working timeline
2. **Adapt for Zoom**: Replaced fixed `4` with variable `pixelsPerMinute` 
3. **Maintain Synchronization**: Ensured drag and position calculations use same conversion factor

**Testing Method**: 
1. Set timeline to 8am by dragging to center
2. Verify left panel shows 8am (not 6pm/7pm)
3. Test drag behavior: RIGHT = earlier times, LEFT = later times
4. Verify all zoom levels (4x-8x) maintain synchronization
5. Check DEBUG values match formatted display

**Key Insight**: User intuition expects: Drag RIGHT → see earlier times, Drag LEFT → see later times. The formula `currentTimeMinutes - (scrollOffset / pixelsPerMinute)` provides this relationship.

**Prevention**: 
1. Always copy EXACT working coordinate system before adapting for new features
2. Test UX direction BEFORE complex mathematical analysis
3. Use DEBUG displays to verify calculations match expectations
4. Test both edge cases and normal usage patterns

**Files Fixed**: `src/components/daily-use/GamelikeTimeline.tsx`

---

**IMPORTANT**: Add new successful patterns here immediately after they work. This is our knowledge base for efficient development!