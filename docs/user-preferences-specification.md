# Lightwalker User Preferences & Customization Specification

*Complete user control over all interaction patterns and timing*

## CORE PRINCIPLE: USER SOVEREIGNTY

**Everything Must Be User-Controlled**: No interaction, timing, or communication happens without explicit user permission and customization. Users have granular control over their Lightwalker experience.

---

## 1. Communication Frequency Controls

### Message Frequency Settings
- **Silent Mode**: No proactive messages (user initiates all contact)
- **Minimal**: 1 message per day at user-chosen time
- **Moderate**: 2-3 messages per day at user-chosen times
- **Active**: 4-6 messages per day at user-chosen times
- **Companion Mode**: Throughout day based on user's activity patterns

### Timing Customization
- **Morning Window**: User sets preferred time range (e.g., 7:30-9:00am)
- **Midday Window**: User sets preferred time range (e.g., 12:00-2:00pm)
- **Evening Window**: User sets preferred time range (e.g., 6:00-8:00pm)
- **Weekend Adjustments**: Different schedule for weekends
- **Do Not Disturb**: User-defined blackout periods
- **Time Zone Awareness**: Automatic adjustment for travel/relocation

### Context-Based Triggers
- **Stress Detection**: Only message during difficult times if user opts in
- **Success Celebration**: Only celebrate wins if user wants acknowledgment
- **Random Inspiration**: User chooses if they want surprise messages
- **Activity-Based**: Link messages to user's calendar/activity patterns (opt-in)

---

## 2. Content & Sharing Preferences

### Message Type Controls
**Users choose which types of content they want to receive:**

- ✅/❌ **Gratitude Modeling**: "I'm appreciating..."
- ✅/❌ **Situational Responses**: "When I encounter..."
- ✅/❌ **Wisdom Sharing**: "I'm reflecting on..."
- ✅/❌ **Activity Updates**: "I'm currently..."
- ✅/❌ **Learning Moments**: "I discovered..."
- ✅/❌ **Compassion Practice**: "I'm sending loving thoughts..."

### Interaction Style Preferences
- **Conversation Length**: Brief check-ins vs. deeper discussions
- **Question Frequency**: How often Lightwalker asks reflective questions
- **Personal Sharing**: How much of user's life Lightwalker references
- **Philosophical Depth**: Surface-level wisdom vs. deep spiritual insights
- **Emotional Intensity**: Gentle support vs. more intense transformation work

### Viral/Social Sharing Controls
- **Friend Invitations**: Complete opt-in for all referral suggestions
- **Gift Sharing**: User controls when Lightwalker offers to send inspiration to others
- **Timing Sensitivity**: User sets when they're open to sharing suggestions
- **Message Review**: User can review/edit all outbound messages before sending
- **Contact Management**: User controls which friends can be suggested for sharing

---

## 3. Always-Alive System Preferences

### Discovery Settings
- **Status Visibility**: How often user can check "What's my Lightwalker doing?"
- **Activity Types**: User chooses which activities their Lightwalker engages in
- **Surprise Factor**: Level of spontaneity vs. predictability user prefers
- **Visual Elements**: Imagery, animations, and visual richness preferences

### Gamification Controls
- **Points System**: Opt-in for light points and achievement tracking
- **NFT Generation**: Choose whether to create mystical artwork rewards
- **Progress Tracking**: Level of detail in transformation milestone tracking
- **Celebration Style**: How achievements and growth are acknowledged

### Contribution Opportunities
- **Activity Invitations**: When Lightwalker invites user to participate
- **Reflection Prompts**: Frequency of deeper sharing requests
- **Service Projects**: Invitations to send compassion or help others
- **Learning Together**: Joint exploration of wisdom or personal growth topics

---

## 4. Privacy & Boundary Settings

### Data Sharing Preferences
- **Conversation Memory**: How long Lightwalker remembers past interactions
- **Pattern Recognition**: Whether Lightwalker notes behavioral trends
- **External Integration**: Connection to calendars, apps, or other data sources
- **Analytics Participation**: Contribution to product improvement research

### Emotional Boundaries
- **Crisis Support Level**: How much support during difficult times
- **Intensity Management**: Maximum emotional depth of interactions
- **Trigger Awareness**: Topics or situations to avoid or approach carefully
- **Recovery Space**: Automatic gentle mode after difficult conversations

### Professional Boundaries
- **Work Integration**: Whether Lightwalker references career or professional growth
- **Time Boundaries**: Separation between work hours and personal growth time
- **Goal Alignment**: Connection between professional and personal development goals

---

## 5. Preference Management Interface

### Setup Experience
- **Guided Preference Setting**: Step-by-step customization during onboarding
- **Quick Start Options**: Preset preference bundles (Gentle, Moderate, Intensive)
- **Evolution Path**: Preferences that automatically adjust as user grows
- **Trial Periods**: Test different settings before committing

### Ongoing Adjustment
- **Easy Access**: Preferences always accessible with 2 clicks maximum
- **Real-Time Changes**: Immediate effect when preferences are modified
- **Temporary Adjustments**: "Just for today" or "This week only" options
- **Smart Suggestions**: Lightwalker notices patterns and suggests preference updates

### Advanced Customization
- **Conditional Logic**: "On weekdays, be minimal; on weekends, be more active"
- **Mood-Based**: Different preferences for different emotional states
- **Seasonal Adjustments**: Preferences that shift with time of year or life circumstances
- **Learning Adaptation**: System learns user's response patterns and suggests optimizations

---

## 6. Default Settings Philosophy

### Conservative Defaults
- **Start Minimal**: Begin with less communication, let users request more
- **Opt-In Everything**: No feature is active without explicit user permission
- **Gentle Introduction**: Gradually introduce capabilities as user becomes comfortable
- **Respect Overwhelm**: Easy "too much" feedback leads to automatic adjustment

### Progressive Enhancement
- **Week 1**: Basic daily check-ins only
- **Week 2**: Add one additional interaction type if user wants it
- **Week 3**: Introduce always-alive discovery features
- **Week 4**: Offer gamification and sharing features
- **Month 2+**: Full customization based on established preferences

---

## 7. Emergency Preference Controls

### Instant Adjustments
- **Pause All**: Stop all proactive communication immediately
- **Crisis Mode**: Switch to minimal, supportive-only interactions
- **Overwhelm Protection**: Automatic reduction if user shows stress signals
- **Break Mode**: Temporary complete silence for specified period

### Recovery Protocols
- **Gentle Return**: Gradual reintroduction of preferred interaction levels
- **Preference Reset**: Easy return to previously comfortable settings
- **Support Check**: Caring inquiry about what caused need for emergency adjustment

---

## 8. Technical Implementation Requirements

### Database Schema Extensions
```sql
-- User preferences table
CREATE TABLE user_preferences (
    user_id UUID REFERENCES users(id),
    message_frequency VARCHAR(20), -- 'silent', 'minimal', 'moderate', 'active', 'companion'
    morning_window_start TIME,
    morning_window_end TIME,
    midday_window_start TIME,
    midday_window_end TIME,
    evening_window_start TIME,
    evening_window_end TIME,
    content_types JSONB, -- Array of enabled content types
    sharing_enabled BOOLEAN DEFAULT false,
    gamification_enabled BOOLEAN DEFAULT false,
    always_alive_enabled BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### Real-Time Preference Engine
- **Immediate Response**: All preference changes take effect instantly
- **Validation Logic**: Ensure preference combinations make sense
- **Conflict Resolution**: Handle contradictory preferences gracefully
- **Performance Optimization**: Fast preference checking for all interactions

### User Experience Integration
- **Seamless Access**: Preference controls integrated naturally into main interface
- **Visual Feedback**: Clear indication of current settings and their effects
- **Contextual Help**: Explanation of what each preference controls
- **Undo Functionality**: Easy reversal of unwanted preference changes

---

This comprehensive preference system ensures that Lightwalker feels like a personalized companion rather than an intrusive app, giving users complete sovereignty over their growth journey while maintaining the power of the modeling approach.

*This specification should be implemented in Phase 4 and continuously refined based on user feedback and behavior patterns.*