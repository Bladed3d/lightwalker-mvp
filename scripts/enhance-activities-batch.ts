#!/usr/bin/env npx ts-node

// Batch Activity Enhancement Script
// Purpose: Process all 110 role model activities with Claude enhancements
// Safety: Preserves existing data, handles failures gracefully

import { PrismaClient } from '@prisma/client';
import { 
  DailyDoEnhancer, 
  generateUniqueId, 
  categorizeDifficulty,
  estimateEnhancementTime
} from '../src/lib/daily-do-enhancer';
import { 
  RoleModelDailyDoEnhancement, 
  AttributeEnhancement,
  EnhancementPrompt 
} from '../src/types/daily-do-types';

const prisma = new PrismaClient();
const enhancer = new DailyDoEnhancer();

interface ProcessingStats {
  totalRoleModels: number;
  totalAttributes: number;
  successfulEnhancements: number;
  failedEnhancements: number;
  totalDailyDoItems: number;
  totalProcessingTime: number;
  startTime: Date;
}

async function main() {
  console.log('🚀 Starting Claude-powered activity enhancement batch process...\n');
  
  const stats: ProcessingStats = {
    totalRoleModels: 0,
    totalAttributes: 0,
    successfulEnhancements: 0,
    failedEnhancements: 0,
    totalDailyDoItems: 0,
    totalProcessingTime: 0,
    startTime: new Date()
  };

  try {
    // Get all role models with enhancedAttributes
    const roleModels = await prisma.roleModel.findMany({
      where: {
        enhancedAttributes: { not: null },
        isActive: true
      },
      select: {
        id: true,
        commonName: true,
        enhancedAttributes: true,
        dailyDoEnhanced: true // Check if already enhanced
      }
    });

    stats.totalRoleModels = roleModels.length;
    console.log(`📊 Found ${roleModels.length} role models to process`);
    
    // Estimate total time
    const totalActivities = roleModels.reduce((count, rm) => {
      if (!rm.enhancedAttributes) return count;
      try {
        const parsed = JSON.parse(rm.enhancedAttributes);
        return count + (Array.isArray(parsed) ? parsed.length : 0);
      } catch {
        return count;
      }
    }, 0);
    
    stats.totalAttributes = totalActivities;
    const estimatedTime = estimateEnhancementTime(totalActivities);
    
    console.log(`📈 Estimated processing time: ${Math.ceil(estimatedTime / 60)} minutes`);
    console.log(`⚡ Total activities to enhance: ${totalActivities}\n`);

    // Process each role model
    for (const roleModel of roleModels) {
      await processRoleModel(roleModel, stats);
    }

    // Final statistics
    printFinalStats(stats);

  } catch (error) {
    console.error('❌ Batch processing failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

async function processRoleModel(
  roleModel: { 
    id: string; 
    commonName: string; 
    enhancedAttributes: string | null;
    dailyDoEnhanced: any;
  }, 
  stats: ProcessingStats
) {
  console.log(`\n🔧 Processing ${roleModel.commonName}...`);

  // Skip if already enhanced (unless we want to re-enhance)
  if (roleModel.dailyDoEnhanced) {
    console.log(`   ⏭️  Already enhanced, skipping...`);
    return;
  }

  // Parse enhanced attributes
  if (!roleModel.enhancedAttributes) {
    console.log(`   ⚠️  No enhanced attributes found, skipping...`);
    return;
  }

  let attributes: any[];
  try {
    attributes = JSON.parse(roleModel.enhancedAttributes);
    if (!Array.isArray(attributes)) {
      console.log(`   ❌ Invalid enhanced attributes format, skipping...`);
      return;
    }
  } catch (error) {
    console.log(`   ❌ Failed to parse enhanced attributes, skipping...`);
    return;
  }

  console.log(`   📝 Found ${attributes.length} attributes to enhance`);

  // Process each attribute
  const enhancements: AttributeEnhancement[] = [];
  let roleModelSuccesses = 0;
  let roleModelFailures = 0;

  for (let i = 0; i < attributes.length; i++) {
    const attribute = attributes[i];
    
    if (!attribute.name || !attribute.method) {
      console.log(`   ⚠️  Skipping invalid attribute at index ${i}`);
      continue;
    }

    console.log(`   🎯 Enhancing: ${attribute.name}...`);

    try {
      // Create enhancement prompt
      const prompt: EnhancementPrompt = {
        roleModel: roleModel.commonName,
        attribute: attribute.name,
        originalMethod: attribute.method,
        context: {
          userLevel: "beginner", // Start with beginner-friendly
          availableTime: "5-15min",
          preferredStyle: "structured"
        }
      };

      // Validate prompt
      if (!enhancer.validatePrompt(prompt)) {
        throw new Error('Invalid enhancement prompt');
      }

      // Enhance with Claude
      const response = await enhancer.enhanceActivity(prompt);

      if (response.success && response.dailyDoItems) {
        // Generate unique IDs for items
        response.dailyDoItems.forEach((item, index) => {
          item.id = generateUniqueId(roleModel.commonName, attribute.name, index);
        });

        // Create attribute enhancement
        const enhancement = enhancer.createAttributeEnhancement(
          attribute.name.toLowerCase().replace(/\s+/g, '-'),
          attribute.method,
          response.dailyDoItems
        );

        enhancements.push(enhancement);
        roleModelSuccesses++;
        stats.successfulEnhancements++;
        stats.totalDailyDoItems += response.dailyDoItems.length;

        console.log(`      ✅ Generated ${response.dailyDoItems.length} Daily-Do items`);
        
        // Log sample item for verification
        if (response.dailyDoItems[0]) {
          console.log(`      📋 Sample: "${response.dailyDoItems[0].action}"`);
        }

      } else {
        throw new Error(response.error || 'Enhancement failed');
      }

      // Apply rate limiting
      await enhancer.applyRateLimit();

    } catch (error) {
      console.log(`      ❌ Failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      roleModelFailures++;
      stats.failedEnhancements++;
    }
  }

  // Save enhancements to database if any succeeded
  if (enhancements.length > 0) {
    try {
      const dailyDoEnhancement = createRoleModelEnhancement(
        roleModel.commonName,
        enhancements
      );

      await prisma.roleModel.update({
        where: { id: roleModel.id },
        data: {
          dailyDoEnhanced: dailyDoEnhancement as any
        }
      });

      console.log(`   💾 Saved ${enhancements.length} enhancements to database`);
      
    } catch (error) {
      console.log(`   ❌ Database save failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Role model summary
  console.log(`   📊 ${roleModel.commonName} Summary: ${roleModelSuccesses} success, ${roleModelFailures} failed`);
}

function createRoleModelEnhancement(
  roleModelName: string,
  enhancements: AttributeEnhancement[]
): RoleModelDailyDoEnhancement {
  const allDailyDoItems = enhancements.flatMap(e => e.dailyDoItems);
  
  // Calculate difficulty distribution
  const difficultyDistribution = {
    easy: 0,
    moderate: 0,
    challenging: 0
  };

  allDailyDoItems.forEach(item => {
    const category = categorizeDifficulty(item.difficulty);
    difficultyDistribution[category]++;
  });

  // Calculate category breakdown
  const categoryBreakdown: Record<string, number> = {};
  allDailyDoItems.forEach(item => {
    categoryBreakdown[item.category] = (categoryBreakdown[item.category] || 0) + 1;
  });

  // Calculate time of day breakdown
  const timeOfDayBreakdown: Record<string, number> = {};
  allDailyDoItems.forEach(item => {
    timeOfDayBreakdown[item.timeOfDay] = (timeOfDayBreakdown[item.timeOfDay] || 0) + 1;
  });

  // Calculate average difficulty
  const totalDifficulty = allDailyDoItems.reduce((sum, item) => sum + item.difficulty, 0);
  const averageDifficulty = totalDifficulty / allDailyDoItems.length;

  return {
    enhancedAt: new Date().toISOString(),
    enhancedBy: "claude-sonnet-4",
    version: "1.0",
    enhancementContext: {
      userLevel: "beginner",
      availableTime: "5-15min",
      preferredStyle: "structured"
    },
    attributes: enhancements,
    summary: {
      totalAttributes: enhancements.length,
      totalDailyDoItems: allDailyDoItems.length,
      averageDifficulty: Math.round(averageDifficulty * 10) / 10,
      difficultyDistribution,
      categoryBreakdown,
      timeOfDayBreakdown
    }
  };
}

function printFinalStats(stats: ProcessingStats) {
  const endTime = new Date();
  const totalTime = (endTime.getTime() - stats.startTime.getTime()) / 1000;
  stats.totalProcessingTime = totalTime;

  console.log('\n' + '='.repeat(60));
  console.log('🎉 BATCH ENHANCEMENT COMPLETE!');
  console.log('='.repeat(60));
  console.log(`📊 STATISTICS:`);
  console.log(`   • Role Models Processed: ${stats.totalRoleModels}`);
  console.log(`   • Total Attributes: ${stats.totalAttributes}`);
  console.log(`   • Successful Enhancements: ${stats.successfulEnhancements}`);
  console.log(`   • Failed Enhancements: ${stats.failedEnhancements}`);
  console.log(`   • Success Rate: ${Math.round((stats.successfulEnhancements / stats.totalAttributes) * 100)}%`);
  console.log(`   • Total Daily-Do Items Created: ${stats.totalDailyDoItems}`);
  console.log(`   • Average Items per Activity: ${Math.round((stats.totalDailyDoItems / stats.successfulEnhancements) * 10) / 10}`);
  console.log(`   • Total Processing Time: ${Math.round(totalTime)} seconds`);
  console.log(`   • Average Time per Enhancement: ${Math.round((totalTime / stats.successfulEnhancements) * 10) / 10} seconds`);
  
  const enhancementRatio = stats.totalDailyDoItems / stats.totalAttributes;
  console.log(`   • Enhancement Ratio: ${enhancementRatio.toFixed(1)}x (${stats.totalDailyDoItems} concrete actions from ${stats.totalAttributes} abstract activities)`);

  console.log('\n🚀 Ready for UI integration and user testing!');
  
  // Recommendations based on stats
  if (stats.failedEnhancements > 0) {
    console.log(`\n⚠️  RECOMMENDATIONS:`);
    console.log(`   • Review failed enhancements to improve success rate`);
    console.log(`   • Consider re-running failed items with different prompts`);
  }
  
  if (enhancementRatio < 2.0) {
    console.log(`   • Enhancement ratio is low - consider generating more items per activity`);
  }
}

// Handle process termination gracefully
process.on('SIGINT', async () => {
  console.log('\n🛑 Process interrupted, cleaning up...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Process terminated, cleaning up...');
  await prisma.$disconnect();
  process.exit(0);
});

// Run the batch process
if (require.main === module) {
  main().catch(async (error) => {
    console.error('❌ Unhandled error:', error);
    await prisma.$disconnect();
    process.exit(1);
  });
}