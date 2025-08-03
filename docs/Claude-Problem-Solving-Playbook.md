# Claude Problem-Solving Playbook for Lightwalker™

## CRITICAL: How to Debug AI Integration Issues

When a new Claude encounters AI/LLM problems, follow this EXACT methodology:

### Step 1: Isolate the Problem Layers
**Never assume it's just one issue!** AI problems usually have multiple layers:

1. **Infrastructure Layer**: API keys, network, endpoints
2. **Model Layer**: Model reliability, response format, rate limits  
3. **Data Layer**: Input/output format alignment
4. **Semantic Layer**: Language mismatch between user input and system expectations

**Action**: Test each layer independently before assuming the problem is in one place.

### Step 2: Create Minimal Reproducible Tests
**Before debugging complex UI flows, test the API directly:**

```bash
# Test 1: Basic API connectivity
curl -X POST http://localhost:3001/api/ai-character-creation \
  -H "Content-Type: application/json" \
  -d '{"userInput": "test"}'

# Test 2: Specific failing case  
curl -X POST http://localhost:3001/api/ai-character-creation \
  -H "Content-Type: application/json" \
  -d '{"userInput": "I want to learn forgiveness"}'

# Test 3: Search endpoint separately
curl -X POST http://localhost:3001/api/semantic-search \
  -H "Content-Type: application/json" \
  -d '{"keywords": ["forgiving"], "searchQuery": "forgiveness"}'
```

### Step 3: Use the LLM Reliability Test Framework
**ALWAYS test model reliability before deep debugging:**

```bash
# Test current model
curl -X POST http://localhost:3001/api/test-llm-reliability \
  -d '{"model": "openai/gpt-4o-mini", "testCount": 4}'

# Test alternative models
curl -X POST http://localhost:3001/api/test-llm-reliability \
  -d '{"model": "deepseek/deepseek-r1:free", "testCount": 4}'
```

**Interpretation**:
- Success rate <50% = Model/prompt problem
- Response time >3s = Model too slow for UX
- JSON errors = Model formatting issues

### Step 4: The Semantic Alignment Check
**Most critical insight from the 8-hour debugging nightmare:**

When AI extracts keywords but search returns no results, check for **language form mismatches**:

- User language: "I want forgiveness" (noun)
- Database structure: "Reconcilingly Forgiving" (adjective)
- **Solution**: Train AI to extract matching forms

**Debug approach**:
1. Check what AI extracted: `{"keywords": ["forgiveness"]}`
2. Check what's in database: Search for "forgiveness" manually
3. Find the mismatch: Database has "forgiving" not "forgiveness"
4. Fix prompt: "use adjective forms (forgiving not forgiveness)"

### Step 5: Root Cause vs. Symptom Analysis

**Learn from our 8-hour mistake:**

**❌ What we debugged (symptoms):**
- JSON parsing errors
- API response formats  
- Rate limiting issues
- TypeScript errors
- Model configurations

**✅ What we should have found first (root cause):**
- User says "forgiveness" → AI extracts "forgiveness" → Database has "forgiving" → No match

**The methodology**: Always trace the data flow end-to-end before diving into technical details.

## Specific Lightwalker™ Debugging Checklist

When AI search shows "no results found":

### Quick Diagnosis (5 minutes max):
1. ✅ Test AI extraction directly: `/api/ai-character-creation`
2. ✅ Test search directly: `/api/semantic-search`  
3. ✅ Check database has data: `/api/role-models`
4. ✅ Manual keyword search: Try exact database terms

### If AI extraction works but search fails:
**This is the semantic mismatch issue!**
- Compare extracted keywords vs. database attribute names
- Look for noun/adjective mismatches
- Fix with better prompt instructions

### If AI extraction fails:
**This is the model/prompt issue!**
- Test model reliability: `/api/test-llm-reliability`
- Check for JSON parsing errors in logs
- Try different model or improve prompts

## The Meta-Lesson: Systematic > Trial-and-Error

**❌ Trial-and-error approach:**
- Try different models randomly
- Adjust prompts without testing
- Debug UI before testing APIs
- Assume single root cause

**✅ Systematic approach:**
- Test each layer independently  
- Use reliability framework
- Trace data flow end-to-end
- Assume multiple issues until proven otherwise

## Teaching This to New Claude Sessions

### In your initial prompt to new Claude:
```
Before debugging any AI integration issues:

1. Read docs/Claude-Problem-Solving-Playbook.md
2. Use /api/test-llm-reliability to test model performance
3. Test APIs directly with curl before testing UI
4. Check for semantic mismatches between user language and database structure
5. Time-box debugging: if no progress in 2 hours, escalate or switch approaches

Key insight: The 8-hour DeepSeek R1 debugging nightmare was caused by both model unreliability AND semantic mismatches. Always check both.
```

### Update CLAUDE.md with this section:
```markdown
## CRITICAL DEBUGGING METHODOLOGY

When encountering AI/search issues, follow the systematic approach in docs/Claude-Problem-Solving-Playbook.md.

**Never spend more than 2 hours debugging without:**
1. Testing model reliability with /api/test-llm-reliability
2. Testing APIs independently with curl
3. Checking for semantic alignment between user input and database structure

**The lesson**: We spent 8 hours debugging DeepSeek R1 when the real issues were model unreliability + semantic mismatches. This playbook prevents that mistake.
```

This way, any new Claude will have the systematic methodology to avoid the 8-hour debugging trap!