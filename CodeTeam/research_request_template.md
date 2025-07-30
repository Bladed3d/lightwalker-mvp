# Standard Research Request Template

Use this template when requesting validation research from the Researcher agent. This ensures you get comprehensive, actionable research that validates your approach and helps you avoid common pitfalls.

## Research Request Format

```markdown
## Research Request

**Agent**: [Your Role - e.g., Lead Programmer, UI Designer, etc.]
**Date**: [Current Date]

### Objective
[Clearly describe what you're trying to accomplish]

### Specific Research Needed
[Exactly what examples, validation, or references you need]
- Example: "Find 5 GitHub repositories implementing OAuth2 authentication in Python with FastAPI"
- Example: "Find high-converting SaaS landing pages with A/B testing results"
- Example: "Find database schema designs for multi-tenant applications handling 100K+ users"

### Key Questions to Answer
1. [Specific question 1]
2. [Specific question 2]
3. [Specific question 3]

### Success Criteria
[What would make this research valuable and actionable for your work]

### Current Approach
[Brief description of your current plan/approach that needs validation]

### Constraints/Requirements
[Any specific technical, budget, or timeline constraints to consider]

### Priority Level
- [ ] High - Blocking my work, need ASAP
- [ ] Medium - Important for quality, need within 24 hours  
- [ ] Low - Nice to have, can wait 2-3 days
```

## Example Research Requests

### Lead Programmer Example
```markdown
## Research Request

**Agent**: Lead Programmer
**Date**: 2025-01-14

### Objective
Implement secure user authentication system for our SaaS application

### Specific Research Needed
Find 5 GitHub repositories implementing OAuth2 authentication in Python with FastAPI, focusing on:
- JWT token management
- Refresh token handling
- Rate limiting implementation
- Security best practices

### Key Questions to Answer
1. What are the most secure JWT token expiration strategies?
2. How do successful apps handle refresh token rotation?
3. What rate limiting patterns prevent brute force attacks?
4. What are common security vulnerabilities to avoid?

### Success Criteria
Research provides proven code examples I can adapt, security checklists to follow, and performance benchmarks to meet

### Current Approach
Planning to use FastAPI-Users library with JWT tokens, Redis for session storage, and custom middleware for rate limiting

### Constraints/Requirements
- Must support 10K+ concurrent users
- Need GDPR compliance
- Budget for additional security tools if needed

### Priority Level
- [x] High - Blocking my work, need ASAP
```

### UI Designer Example
```markdown
## Research Request

**Agent**: UI Designer
**Date**: 2025-01-14

### Objective
Design a user onboarding flow that maximizes completion rates

### Specific Research Needed
Find 5 successful SaaS onboarding flows with completion rate data, focusing on:
- Progressive disclosure techniques
- Motivational design elements
- Mobile-first responsive patterns
- Accessibility considerations

### Key Questions to Answer
1. What onboarding completion rates should we target?
2. How many steps is optimal for B2B SaaS onboarding?
3. What design elements increase motivation to complete?
4. How do top apps handle mobile onboarding?

### Success Criteria
Research provides specific design patterns with conversion data, accessibility examples, and mobile optimization strategies

### Current Approach
Planning 4-step progressive onboarding with tooltips, progress indicators, and contextual help

### Constraints/Requirements
- Must work on mobile devices
- Need WCAG 2.1 AA compliance
- Integration with existing design system

### Priority Level
- [x] Medium - Important for quality, need within 24 hours
```

## Quick Reference Guide

### When to Request Research
- Before starting any significant work
- When you're unsure about best practices
- When you need to validate your approach
- When you want to avoid reinventing solutions
- When success metrics or benchmarks would help

### What Makes a Good Research Request
- **Specific**: Exact examples or data you need
- **Actionable**: Research you can immediately apply
- **Measurable**: Includes metrics, benchmarks, or success data
- **Constrained**: Clear scope and requirements
- **Urgent**: Appropriate priority level set

### Research Request Checklist
- [ ] Objective is clear and specific
- [ ] Research needs are detailed and actionable
- [ ] Key questions will guide the research effectively
- [ ] Success criteria are measurable
- [ ] Current approach provides context
- [ ] Constraints are realistic and complete
- [ ] Priority level matches actual needs

Remember: Good research requests save time for everyone and result in better validation. Be specific about what you need and how you'll use it!