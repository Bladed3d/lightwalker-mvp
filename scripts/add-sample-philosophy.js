const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const philosophyContent = {
  'read': 'Reading is the pathway to expanding consciousness and perspective. Through books, we absorb the distilled wisdom of countless minds across time and space. This practice cultivates intellectual humility - recognizing that our individual perspective is limited, and that growth comes from exposure to diverse thoughts and experiences.',
  
  'focused-meditation': 'Meditation is the practice of training attention and awareness. By focusing on a single point - whether breath, mantra, or pure consciousness - we develop the ability to observe our thoughts without being controlled by them. This creates space between stimulus and response, allowing for more conscious choices in daily life.',
  
  'gratitude-practice': 'Gratitude transforms our relationship with reality by shifting focus from scarcity to abundance. This practice recognizes that appreciation is a choice available in any moment, regardless of circumstances. Regular gratitude cultivation rewires the brain to notice positive aspects of experience, creating an upward spiral of wellbeing.',
  
  'empathy-practice': 'Empathy is the bridge that connects isolated individuals into a compassionate community. By truly listening and validating others\' experiences, we acknowledge the fundamental interconnectedness of human suffering and joy. This practice dissolves the illusion of separation and builds emotional intelligence.',
  
  'skill-practice': 'Skill development is the embodiment of human potential. Each skill acquired represents our capacity to transform intention into capability through dedicated practice. This process teaches patience, perseverance, and the joy of gradual mastery - qualities that extend far beyond the specific skill being learned.',
  
  'deep-reflection': 'Self-reflection is the cornerstone of conscious living. By regularly examining our thoughts, motivations, and actions, we develop self-awareness and the ability to align our behavior with our deeper values. This practice transforms life from unconscious reaction to intentional creation.',
  
  'truth-first': 'Truth-seeking is the foundation of authentic living. This practice involves the courage to see reality clearly, even when it contradicts our preferences or beliefs. By choosing truth over ego gratification, we align ourselves with reality and create space for genuine wisdom to emerge.',
  
  'life-changing-decision': 'Major life decisions are opportunities to consciously direct our path rather than drift through default choices. This practice requires the courage to prioritize authentic fulfillment over social expectations, recognizing that we are the primary architects of our own experience.',
  
  'mindful-breathing': 'Conscious breathing connects us to the present moment and the life force itself. The breath serves as an anchor for awareness, always available as a return point when the mind becomes scattered. This simple practice demonstrates that peace and clarity are accessible in any moment.',
  
  'leadership-moment': 'True leadership is not about commanding others, but about embodying the principles we wish to see in the world. By taking action aligned with our values, especially when it requires courage or sacrifice, we inspire others through example rather than words. Leadership is ultimately self-leadership made visible.'
};

async function addPhilosophyContent() {
  console.log('🎯 Adding philosophy content to activities...');
  
  try {
    let updatedCount = 0;
    
    for (const [activityId, philosophy] of Object.entries(philosophyContent)) {
      try {
        const result = await prisma.activity.update({
          where: { id: activityId },
          data: { philosophy: philosophy }
        });
        
        console.log(`✅ Added philosophy to "${result.title}"`);
        updatedCount++;
        
      } catch (error) {
        console.log(`⚠️ Could not find activity with ID "${activityId}" - skipping`);
      }
    }
    
    console.log(`\n🎉 Successfully added philosophy content to ${updatedCount} activities!`);
    
    // Verify the updates
    const activitiesWithPhilosophy = await prisma.activity.findMany({
      where: {
        philosophy: { not: null }
      },
      select: {
        id: true,
        title: true,
        philosophy: true
      }
    });
    
    console.log(`\n📋 Activities now with philosophy content (${activitiesWithPhilosophy.length}):`);
    activitiesWithPhilosophy.forEach(activity => {
      console.log(`- ${activity.title}: ${activity.philosophy.substring(0, 60)}...`);
    });
    
  } catch (error) {
    console.error('❌ Error adding philosophy content:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addPhilosophyContent();