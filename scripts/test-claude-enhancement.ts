#!/usr/bin/env npx tsx

// Test Claude Enhancement Script
// Purpose: Generate a few sample Daily-Do entries for review before full batch processing
// Usage: npx tsx scripts/test-claude-enhancement.ts

import fs from 'fs';
import path from 'path';

// Load environment variables from .env.local manually
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      process.env[key.trim()] = value.trim().replace(/"/g, '');
    }
  });
}

import { DailyDoEnhancer } from '../src/lib/daily-do-enhancer';
import { EnhancementPrompt } from '../src/types/daily-do-types';

const enhancer = new DailyDoEnhancer();

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

async function testClaudeEnhancements() {
  console.log('🧪 Testing Claude Enhancement Quality');
  console.log('=====================================\n');
  
  for (let i = 0; i < testActivities.length; i++) {
    const activity = testActivities[i];
    
    console.log(`\n📝 TEST ${i + 1}/5: ${activity.roleModel} - ${activity.attribute}`);
    console.log('─'.repeat(60));
    console.log(`📋 Original Method: "${activity.method}"`);
    console.log('\n🤖 Asking Claude to enhance...\n');

    try {
      const prompt: EnhancementPrompt = {
        roleModel: activity.roleModel,
        attribute: activity.attribute,
        originalMethod: activity.method,
        context: {
          userLevel: "beginner",
          availableTime: "5-15min", 
          preferredStyle: "structured"
        }
      };

      const response = await enhancer.enhanceActivity(prompt);
      
      if (response.success && response.dailyDoItems) {
        console.log(`✅ SUCCESS: Generated ${response.dailyDoItems.length} Daily-Do items`);
        console.log(`⚡ Processing time: ${response.metadata?.processingTime}ms`);
        console.log(`🎯 Tokens used: ${response.metadata?.tokensUsed}\n`);
        
        response.dailyDoItems.forEach((item, index) => {
          console.log(`🚀 DAILY-DO ITEM ${index + 1}:`);
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
        
      } else {
        console.log(`❌ FAILED: ${response.error}`);
        console.log(`⚡ Processing time: ${response.metadata?.processingTime}ms`);
        console.log(`🔄 Retries: ${response.metadata?.retryCount}\n`);
      }
      
      // Rate limiting between calls
      await enhancer.applyRateLimit();
      
    } catch (error) {
      console.log(`💥 ERROR: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('🎯 CLAUDE ENHANCEMENT TEST COMPLETE!');
  console.log('='.repeat(60));
  console.log('\n📝 REVIEW CHECKLIST:');
  console.log('• Are the actions immediately doable (no setup required)?');
  console.log('• Do success criteria make it clear when the task is complete?');
  console.log('• Are difficulty ratings (1-9) appropriate for each action?');
  console.log('• Does the first-person language feel natural to copy?');
  console.log('• Do the actions capture the essence of the role model\'s method?');
  console.log('• Are materials/location/time requirements reasonable?');
  console.log('\n💡 NEXT STEPS:');
  console.log('• Review the generated items above');
  console.log('• Adjust the enhancement prompts if needed');
  console.log('• Run the full batch process when satisfied with quality');
  console.log('• Test with different user levels (beginner/intermediate/advanced)');
}

// Handle process termination gracefully
process.on('SIGINT', () => {
  console.log('\n🛑 Test interrupted');
  process.exit(0);
});

// Run the test
if (require.main === module) {
  testClaudeEnhancements().catch((error) => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });
}