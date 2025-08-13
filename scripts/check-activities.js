const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkActivities() {
  try {
    const activities = await prisma.activity.findMany({
      select: {
        id: true,
        title: true,
        philosophy: true,
        description: true
      }
    });
    
    console.log('Total activities:', activities.length);
    console.log('Activities with philosophy:', activities.filter(a => a.philosophy).length);
    console.log('Activities with description:', activities.filter(a => a.description).length);
    
    console.log('\nFirst 5 activities:');
    activities.slice(0, 5).forEach(a => {
      console.log(`${a.title}:`);
      console.log(`  Description: ${a.description?.substring(0, 80) || 'None'}...`);
      console.log(`  Philosophy: ${a.philosophy || 'None'}`);
      console.log('');
    });
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkActivities();