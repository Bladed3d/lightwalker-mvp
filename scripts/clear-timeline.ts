/**
 * Clear all timeline data for clean testing
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearTimelineData() {
  console.log('🧹 Clearing timeline data for clean testing...');
  
  try {
    // Clear timeline activities
    const deletedTimeline = await prisma.timelineActivity.deleteMany({});
    console.log(`🗑️ Cleared ${deletedTimeline.count} timeline activities`);
    
    // Clear activity completions
    const deletedCompletions = await prisma.activityCompletion.deleteMany({});
    console.log(`🗑️ Cleared ${deletedCompletions.count} activity completions`);
    
    console.log('🎉 Timeline cleared! Ready for clean testing.');
    
  } catch (error) {
    console.error('❌ Error clearing timeline:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the cleanup
clearTimelineData()
  .catch((error) => {
    console.error('❌ Clear failed:', error);
    process.exit(1);
  });