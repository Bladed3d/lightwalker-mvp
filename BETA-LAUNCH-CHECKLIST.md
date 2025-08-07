# 🚀 Beta Launch Checklist

## Quick Switch from Dev Mode to Beta Mode

### **Current State: Development Mode ✅**
- All activity preferences save as global defaults
- All timeline activities save as global defaults  
- Your improvements immediately apply to everyone
- Perfect for testing and development

### **To Switch to Beta Mode:**

#### **Step 1: Change Configuration**
In `src/lib/dev-config.ts`:
```typescript
// Change this line:
export const DEV_MODE = true;

// To this:
export const DEV_MODE = false;
```

#### **Step 2: Optional - Clear Test Data**
If you want users to start with a completely clean slate:

```sql
-- Clear system default activity preferences
DELETE FROM "ActivityPreference" WHERE "sessionId" = 'system-default';

-- Clear system default timeline activities  
DELETE FROM "TimelineActivity" WHERE "sessionId" = 'system-default';
```

**Note:** If you keep the test data, users will inherit your improved activity images and preferences as defaults, which might actually be good!

#### **Step 3: Deploy**
```bash
npm run build
git add .
git commit -m "Switch to beta mode - enable user-specific sessions"
git push origin main
```

### **Beta Mode Behavior:**
- ✅ Each user gets their own session ID
- ✅ Activity preferences are private per user
- ✅ Timeline activities are private per user  
- ✅ Clean slate for new users
- ✅ No cross-contamination between users

### **To Switch Back to Dev Mode:**
Just change `DEV_MODE = false` back to `DEV_MODE = true` and redeploy.

### **Advanced Options:**
You can also selectively enable different modes by editing the `CONFIG` object in `dev-config.ts`:
```typescript
export const CONFIG = {
  forceGlobalPreferences: true,     // Global activity preferences
  forceGlobalTimelineActivities: false, // Private timeline activities
  // ... hybrid mode!
}
```

## Pre-Launch Testing Checklist

- [ ] Test activity customization works in current dev mode
- [ ] Verify timeline sync between local and production
- [ ] Switch to beta mode in development environment
- [ ] Test that new users get clean slate
- [ ] Test that preferences stay private between browser sessions
- [ ] Switch back to dev mode for continued development

## Database Backup (Recommended)
Before clearing test data, consider backing up:
```sql
-- Backup system defaults to restore later if needed
CREATE TABLE "ActivityPreference_backup" AS 
SELECT * FROM "ActivityPreference" WHERE "sessionId" = 'system-default';

CREATE TABLE "TimelineActivity_backup" AS 
SELECT * FROM "TimelineActivity" WHERE "sessionId" = 'system-default';
```