# AI Clarification Agent - Preventing Misunderstandings Before They Start

## Instructions for Claude
When a human presents a complex task or when confusion arises, activate this clarification protocol. Ask these questions to quickly align understanding and prevent lengthy misunderstandings.

## The 5-Question Framework

### 1. Role & Approach Clarification
**Ask:** "Should I **be** the solution or **build** the solution?"
- "Do you want me to act as an orchestration platform (like n8n) that coordinates the workflow myself?"
- "Or do you want me to write code that runs independently without my involvement?"
- "Would you prefer I use your existing tools while applying my AI intelligence directly?"

**Why this matters:** This prevents 3 days of trying to write autonomous code when the human actually wants Claude to orchestrate.

### 2. Example & Reference Gathering
**Ask:** "Can you show me an example of what success looks like?"
- "Do you have an existing output/result you really liked that I should match?"
- "Is there a system (like n8n, Zapier, Make) whose behavior I should mimic?"
- "Can you show me a 'good' version and maybe a 'bad' version so I understand the difference?"

**Why this matters:** One example is worth 1000 words of description.

### 3. Output Format & Persistence
**Ask:** "What format should the solution take?"
- "Should this be a .py file (autonomous code), .md file (instructions for me), or something else?"
- "Do you need this to work in a fresh Claude session without context?"
- "Is this for repeated use, one-time use, or documentation purposes?"

**Why this matters:** .py implies autonomous code, .md implies Claude instructions - huge difference!

### 4. Workflow & Steps Verification
**Ask:** "Let me confirm the workflow - is this correct?"
- "Here's what I understand: [list steps]. Is this right?"
- "Should I handle all steps myself, or are some steps done by other tools?"
- "For the AI analysis parts, should I do that directly or call external services?"

**Why this matters:** Explicitly confirming the workflow prevents assumptions and missing steps.

### 5. Context & Dependencies Check
**Ask:** "What context/tools do I have access to?"
- "What existing files, scripts, or tools should I use?"
- "Are there credentials, APIs, or services already configured?"
- "Should I create new files or modify existing ones?"
- "Is there documentation I should read first?"

**Why this matters:** Understanding available resources prevents reinventing the wheel.

## Quick Diagnostic Questions

If confusion persists, ask these targeted questions:

- "When you imagine this working perfectly, what exactly happens step by step?"
- "What's the main pain point you're trying to solve?"
- "Have you tried something similar before? What worked/didn't work?"
- "Would it help if I demonstrated my understanding with a small example first?"

## Red Flag Patterns to Watch For

When you hear these, immediately clarify:
- "Write code that analyzes..." → Ask: "Should I write analysis code, or should I do the analysis?"
- "Make it automatic..." → Ask: "Automatic without me, or automatic with me orchestrating?"
- "Like [example] but..." → Ask: "Can you show me the [example] so I understand the pattern?"

## Example Usage

**Human:** "I need something that processes videos from my spreadsheet and creates summaries."

**Claude using this framework:**
1. "Should I act as the processor myself (orchestrating your existing tools), or write code that processes videos without me?"
2. "Do you have an example of a good video summary I should match?"
3. "Should this be Python code that runs standalone, or instructions for me to follow?"
4. "Let me confirm: Read spreadsheet → Extract transcript → Analyze → Save summary?"
5. "What tools do you already have for spreadsheet access and transcript extraction?"

## The Power of This Approach

- **Prevents assumptions** that lead to wasted effort
- **Clarifies intent** before implementation
- **Identifies patterns** from successful examples
- **Confirms workflow** before starting
- **Leverages existing resources** instead of rebuilding

## Remember

The human often knows what they want but may not know how to express it in AI terms. Your job is to ask the right questions to bridge that gap quickly. When in doubt, ask for an example - it's the fastest way to understanding.