# Error Handler Agent Instructions

When you encounter an error that you cannot immediately solve or provide a working solution for, you must deploy the research agent to find proven solutions.

## **Error Deployment Triggers**

Deploy researcher.md when you encounter:
- External service errors (API failures, HTTP 403/404/429, authentication issues)
- Library/dependency errors you don't have immediate solutions for
- Performance problems requiring optimization techniques
- Integration challenges with third-party services
- Any error where you would normally say "this might be due to..." without a concrete solution

## **Error Handler Protocol**

### **Step 1: Describe the Failing Code**
Provide the exact code section that's triggering the error:
```
**Failing Code Section:**
File: /path/to/file.py
Lines: 120-130

```python
# The specific code that's failing
cmd = [
    yt_dlp_cmd,
    '--write-auto-sub',
    '--sub-lang', 'en',
    '--sub-format', 'vtt',
    '--skip-download',
    '-o', os.path.join(temp_dir, '%(id)s.%(ext)s'),
    video_url
]
result = subprocess.run(cmd, capture_output=True, text=True)
if result.returncode != 0:
    logger.error(f"Failed to download transcript: {result.stderr}")
    return None
```
```

### **Step 2: Describe the Error**
Provide complete error details:
```
**Error Details:**
- Error Type: HTTP 403 Forbidden
- Full Error Message: "ERROR: [download] Got error: HTTP Error 403: Forbidden, ERROR: fragment 1 not found, unable to continue"
- Environment: Python script using yt-dlp to download YouTube subtitles
- Command: yt-dlp --write-auto-sub --sub-lang en --sub-format vtt --skip-download
- Context: Automated video transcript extraction from YouTube
- Reproducible: Yes, happens consistently with video ID av0Lsz3KkSE
```

### **Step 3: Deploy Researcher**
State exactly this:
```
**Deploying researcher.md to research this error.**

Please research solutions for this yt-dlp HTTP 403 error and provide proven fixes that others have successfully used.
```

## **Complete Example Walkthrough**

**Scenario:** New chat encounters the yt-dlp 403 error we just fixed.

**What the new chat should do:**

1. **Recognize the trigger**: "I'm getting an HTTP 403 error from yt-dlp and don't have an immediate solution"

2. **Follow the protocol exactly:**

```
I've encountered an error that requires research to resolve properly.

**Failing Code Section:**
File: /mnt/d/Projects/Ai/Idea-Launch/Projects/CheckVid/checkvid_full_auto.py
Lines: 120-135

```python
cmd = [
    yt_dlp_cmd,
    '--write-auto-sub',
    '--sub-lang', 'en',
    '--sub-format', 'vtt',
    '--skip-download',
    '-o', os.path.join(temp_dir, '%(id)s.%(ext)s'),
    video_url
]

logger.info(f"Downloading transcript for {video_id}...")
result = subprocess.run(cmd, capture_output=True, text=True)

if result.returncode != 0:
    logger.error(f"Failed to download transcript: {result.stderr}")
    return None
```

**Error Details:**
- Error Type: HTTP 403 Forbidden
- Full Error Message: "ERROR: [download] Got error: HTTP Error 403: Forbidden, ERROR: fragment 1 not found, unable to continue"
- Environment: Python script using yt-dlp to download YouTube subtitles
- Command: yt-dlp --write-auto-sub --sub-lang en --sub-format vtt --skip-download
- Context: Automated video transcript extraction from YouTube
- Reproducible: Yes, happens consistently with specific video IDs
- User can manually access the video but automated tools cannot

**Deploying researcher.md to research this error.**

Please research solutions for this yt-dlp HTTP 403 error and provide proven fixes that others have successfully used to bypass YouTube's anti-automation measures.
```

3. **User responds**: "Research this error" (loading researcher.md)

4. **Researcher provides structured solutions** with:
   - User-agent spoofing examples
   - Cookie-based authentication
   - Alternative extraction methods
   - Code examples from GitHub/Stack Overflow
   - Success rates and implementation guidance

5. **Original agent implements solutions** systematically based on research findings

## **Key Success Factors**

1. **Complete Error Context**: Always provide the exact code, full error message, and environment details
2. **Explicit Research Request**: Always state "Deploying researcher.md to research this error"
3. **Structured Implementation**: Follow researcher's recommendations systematically
4. **Documentation**: Record what worked for future reference

## **What NOT to Do**

❌ Don't say "This might be due to..." without deploying research
❌ Don't provide general explanations without concrete solutions
❌ Don't skip the research step for external service errors
❌ Don't implement random fixes without research validation

## **Success Metrics**

✅ Error gets researched with proven solutions
✅ Multiple implementation approaches provided
✅ Solution implemented successfully
✅ Process documented for future reference

---

**Remember: A new chat won't know about previous discussions. This protocol ensures systematic error resolution regardless of chat history.**