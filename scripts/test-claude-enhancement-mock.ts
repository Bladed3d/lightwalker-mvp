#!/usr/bin/env npx tsx

// Mock Claude Enhancement Test Script
// Purpose: Show sample Daily-Do entries without API costs
// Usage: npx tsx scripts/test-claude-enhancement-mock.ts

import { DailyDoItem, AttributeEnhancement } from '../src/types/daily-do-types';

// Sample activities from different role models for testing
const testActivities = [
  {
    roleModel: "Steve Jobs",
    attribute: "Strategic Focus", 
    method: "List 10 priorities, then cross out 7. Only work on the remaining 3."
  },
  {
    roleModel: "Buddha",
    attribute: "Compassionate Wisdom",
    method: "When someone frustrates you, pause and ask 'What pain might be causing them to act this way?'"
  },
  {
    roleModel: "Einstein",
    attribute: "Creative Curiosity",
    method: "Ask 'How does this work?' and 'What if I tried this differently?' about everyday things"
  },
  {
    roleModel: "Marcus Aurelius", 
    attribute: "Stoic Resilience",
    method: "When facing setbacks, ask 'What can I learn from this?' and 'How can I use this to get stronger?'"
  },
  {
    roleModel: "Joan of Arc",
    attribute: "Courageous Action", 
    method: "Speak up for justice even when your voice is shaking or your heart is racing"
  }
];

// Mock Claude responses showing the expected enhancement format
const mockEnhancements: { [key: string]: DailyDoItem[] } = {
  "Steve Jobs - Strategic Focus": [
    {
      id: "sj-sf-001",
      action: "I write down exactly 10 current tasks on a piece of paper using a pen",
      difficulty: 2,
      duration: "3-5 minutes",
      timeOfDay: "morning",
      category: "planning",
      successCriteria: "I have a physical list with exactly 10 written items",
      gamePoints: 2,
      materials: ["pen", "paper"],
      location: "anywhere",
      socialContext: "solo"
    },
    {
      id: "sj-sf-002", 
      action: "I set a 2-minute timer and ask myself 'Does this move my mission forward?' for each of the 3 highest priorities",
      difficulty: 4,
      duration: "2-3 minutes",
      timeOfDay: "morning",
      category: "decision-making",
      successCriteria: "Each priority has a clear yes/no mission alignment answer",
      gamePoints: 4,
      materials: ["timer"],
      location: "quiet-space",
      socialContext: "solo"
    },
    {
      id: "sj-sf-003",
      action: "I physically cross out the 7 lowest-priority items with a red pen while saying 'This is not my focus right now'",
      difficulty: 3,
      duration: "1-2 minutes", 
      timeOfDay: "morning",
      category: "decision-making",
      successCriteria: "7 items are clearly crossed out and I can state my 3 focus areas",
      gamePoints: 3,
      materials: ["red pen"],
      location: "anywhere",
      socialContext: "solo"
    }
  ],

  "Buddha - Compassionate Wisdom": [
    {
      id: "bd-cw-001",
      action: "I take three conscious breaths and pause for 10 seconds when I notice frustration rising",
      difficulty: 2,
      duration: "30 seconds",
      timeOfDay: "anytime",
      category: "mindfulness",
      successCriteria: "I have completed 3 full breaths and paused before responding",
      gamePoints: 2,
      location: "anywhere",
      socialContext: "anytime"
    },
    {
      id: "bd-cw-002",
      action: "I silently ask myself 'What stress, fear, or hurt might be causing this person to act this way?' while looking at them with soft eyes",
      difficulty: 5,
      duration: "1-2 minutes",
      timeOfDay: "anytime", 
      category: "empathy",
      successCriteria: "I have generated at least one compassionate explanation for their behavior",
      gamePoints: 5,
      location: "anywhere",
      socialContext: "with-others"
    },
    {
      id: "bd-cw-003",
      action: "I choose one kind word or gesture to offer this person, even if I don't feel like it",
      difficulty: 6,
      duration: "30 seconds",
      timeOfDay: "anytime",
      category: "compassion",
      successCriteria: "I have offered one specific act of kindness despite my frustration",
      gamePoints: 6,
      location: "anywhere",
      socialContext: "with-others"
    }
  ],

  "Einstein - Creative Curiosity": [
    {
      id: "ae-cc-001",
      action: "I pick one ordinary object I can see right now and ask 'How does this actually work?' for 2 minutes",
      difficulty: 3,
      duration: "2-3 minutes",
      timeOfDay: "anytime",
      category: "curiosity",
      successCriteria: "I have wondered about at least 3 aspects of how the object functions",
      gamePoints: 3,
      location: "anywhere",
      socialContext: "solo"
    },
    {
      id: "ae-cc-002",
      action: "I imagine doing one everyday task in a completely opposite way and think through what would happen",
      difficulty: 4,
      duration: "5-10 minutes",
      timeOfDay: "anytime",
      category: "creative-thinking",
      successCriteria: "I have mentally walked through the entire reversed process and its consequences",
      gamePoints: 4,
      location: "anywhere",
      socialContext: "solo"
    },
    {
      id: "ae-cc-003",
      action: "I write down 3 'What if' questions about something I did today and pick the most interesting one to explore",
      difficulty: 5,
      duration: "5-10 minutes",
      timeOfDay: "evening",
      category: "reflection",
      successCriteria: "I have written 3 questions and spent time thinking about one",
      gamePoints: 5,
      materials: ["pen", "paper"],
      location: "quiet-space",
      socialContext: "solo"
    }
  ],

  "Marcus Aurelius - Stoic Resilience": [
    {
      id: "ma-sr-001",
      action: "I write down exactly what happened (facts only) versus what story I'm telling myself about it",
      difficulty: 4,
      duration: "5-10 minutes",
      timeOfDay: "anytime",
      category: "reflection",
      successCriteria: "I have two separate lists - facts and interpretations - written down",
      gamePoints: 4,
      materials: ["pen", "paper"],
      location: "quiet-space",
      socialContext: "solo"
    },
    {
      id: "ma-sr-002",
      action: "I ask myself 'What specific skill or strength could this experience help me develop?' and name one thing",
      difficulty: 5,
      duration: "2-5 minutes",
      timeOfDay: "anytime",
      category: "growth-mindset",
      successCriteria: "I have identified one concrete skill or strength this situation could build",
      gamePoints: 5,
      location: "anywhere",
      socialContext: "solo"
    },
    {
      id: "ma-sr-003",
      action: "I take one small action right now that moves me forward, even if I don't feel ready",
      difficulty: 7,
      duration: "5-15 minutes",
      timeOfDay: "anytime",
      category: "action",
      successCriteria: "I have completed one concrete step that advances my situation",
      gamePoints: 7,
      location: "anywhere",
      socialContext: "solo"
    }
  ],

  "Joan of Arc - Courageous Action": [
    {
      id: "ja-ca-001",
      action: "I identify one specific injustice I witnessed today and write down exactly what I observed",
      difficulty: 3,
      duration: "3-5 minutes",
      timeOfDay: "evening",
      category: "awareness",
      successCriteria: "I have written a clear description of something unfair I noticed",
      gamePoints: 3,
      materials: ["pen", "paper"],
      location: "quiet-space",
      socialContext: "solo"
    },
    {
      id: "ja-ca-002",
      action: "I practice saying my truth out loud to myself 3 times, focusing on steady breathing and clear words",
      difficulty: 5,
      duration: "2-5 minutes",
      timeOfDay: "anytime",
      category: "courage-building",
      successCriteria: "I have spoken my position clearly 3 times with controlled breathing",
      gamePoints: 5,
      location: "private-space",
      socialContext: "solo"
    },
    {
      id: "ja-ca-003",
      action: "I speak up about one small injustice in my immediate environment, starting with 'I notice that...'",
      difficulty: 8,
      duration: "2-10 minutes",
      timeOfDay: "anytime",
      category: "courageous-action",
      successCriteria: "I have voiced concern about something unfair, even if my voice shook",
      gamePoints: 8,
      location: "anywhere",
      socialContext: "with-others"
    }
  ]
};

function displayMockEnhancements() {
  console.log('🧪 MOCK CLAUDE ENHANCEMENT REVIEW');
  console.log('==================================\n');
  console.log('💡 These are sample Daily-Do entries showing the expected format');
  console.log('📝 Review these to see if the style and approach works for your users\n');
  
  testActivities.forEach((activity, index) => {
    const key = `${activity.roleModel} - ${activity.attribute}`;
    const items = mockEnhancements[key] || [];
    
    console.log(`\n📝 EXAMPLE ${index + 1}/5: ${activity.roleModel} - ${activity.attribute}`);
    console.log('─'.repeat(70));
    console.log(`📋 Original Method: "${activity.method}"`);
    console.log(`🤖 Generated ${items.length} Daily-Do Items:\n`);

    items.forEach((item, itemIndex) => {
      console.log(`🚀 DAILY-DO ITEM ${itemIndex + 1}:`);
      console.log(`   ID: ${item.id}`);
      console.log(`   Action: "${item.action}"`);
      console.log(`   Success Criteria: "${item.successCriteria}"`);
      console.log(`   Difficulty: ${item.difficulty}/9 (${item.gamePoints} points)`);
      console.log(`   Duration: ${item.duration}`);
      console.log(`   Best Time: ${item.timeOfDay}`);
      console.log(`   Category: ${item.category}`);
      
      if (item.materials && item.materials.length > 0) {
        console.log(`   Materials: ${item.materials.join(', ')}`);
      }
      if (item.location) {
        console.log(`   Location: ${item.location}`);
      }
      if (item.socialContext) {
        console.log(`   Social Context: ${item.socialContext}`);
      }
      console.log('');
    });
  });
  
  console.log('\n' + '='.repeat(70));
  console.log('🎯 DAILY-DO ENHANCEMENT REVIEW COMPLETE!');
  console.log('='.repeat(70));
  
  console.log('\n📊 QUALITY ANALYSIS:');
  const allItems = Object.values(mockEnhancements).flat();
  const avgDifficulty = allItems.reduce((sum, item) => sum + item.difficulty, 0) / allItems.length;
  const categories = Array.from(new Set(allItems.map(item => item.category)));
  const timesOfDay = Array.from(new Set(allItems.map(item => item.timeOfDay)));
  
  console.log(`• Total Daily-Do Items: ${allItems.length}`);
  console.log(`• Average Difficulty: ${avgDifficulty.toFixed(1)}/9`);
  console.log(`• Categories Used: ${categories.join(', ')}`);
  console.log(`• Time Preferences: ${timesOfDay.join(', ')}`);
  console.log(`• Items with Materials: ${allItems.filter(item => item.materials?.length).length}`);
  console.log(`• Solo Activities: ${allItems.filter(item => item.socialContext === 'solo').length}`);
  console.log(`• Social Activities: ${allItems.filter(item => item.socialContext === 'with-others').length}`);
  
  console.log('\n📝 REVIEW CHECKLIST:');
  console.log('✅ Are the actions immediately doable (no setup required)?');
  console.log('✅ Do success criteria make it clear when the task is complete?');
  console.log('✅ Are difficulty ratings (1-9) appropriate for each action?');
  console.log('✅ Does the first-person language feel natural to copy?');
  console.log('✅ Do the actions capture the essence of the role model\'s method?');
  console.log('✅ Are materials/location/time requirements reasonable?');
  
  console.log('\n🤔 QUESTIONS FOR YOU TO CONSIDER:');
  console.log('1. Do these actions feel authentic to each role model?');
  console.log('2. Are the difficulty levels appropriate for your users?');
  console.log('3. Do the success criteria provide clear completion signals?');
  console.log('4. Is the first-person language natural and motivating?');
  console.log('5. Are the time durations realistic for daily practice?');
  console.log('6. Do these transform abstract wisdom into concrete actions?');
  
  console.log('\n💡 NEXT STEPS:');
  console.log('• If satisfied with this quality → Proceed with Claude API processing');
  console.log('• If adjustments needed → Modify the enhancement prompts');
  console.log('• Test with different user levels (beginner/intermediate/advanced)');
  console.log('• Consider A/B testing different prompt approaches');
  
  console.log('\n🚀 Ready to enhance all 110 activities when you approve this format!');
}

// Run the mock test
displayMockEnhancements();