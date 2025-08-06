/**
 * Seed script to populate Activity table with hardcoded ACTIVITY_TEMPLATES
 * This migrates from hardcoded data to database-first architecture
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Copy of ACTIVITY_TEMPLATES from TarkovInventoryGrid.tsx
const ACTIVITY_TEMPLATES = [
  // Common Activities (15-20 points) - sorted alphabetically  
  { id: 'bath', title: 'Bath', icon: '/activity-icons/Bath.jpg', category: 'self-care', points: 20, rarity: 'common', duration: '20 min', difficulty: 1, description: 'Relax and cleanse with a rejuvenating bath' },
  { id: 'breakfast', title: 'Breakfast', icon: '/activity-icons/breakfast.jpg', category: 'nutrition', points: 15, rarity: 'common', duration: '30 min', difficulty: 1, description: 'Start your day with a nutritious breakfast' },
  { id: 'dogs', title: 'Dogs', icon: '/activity-icons/Dogs.jpg', category: 'companionship', points: 25, rarity: 'common', duration: '20 min', difficulty: 1, description: 'Spend quality time with your canine companions' },
  { id: 'hydrate', title: 'Hydrate', icon: '/activity-icons/hydrate.jpg', category: 'physical', points: 15, rarity: 'common', duration: '1 min', difficulty: 1, description: 'Stay hydrated with pure water', gridSize: { w: 1, h: 2 } },
  { id: 'mindful-breathing', title: 'Mindful Breathing', icon: '/activity-icons/meditation.jpg', category: 'mindfulness', points: 15, rarity: 'common', duration: '5 min', difficulty: 1, description: 'Center yourself with conscious breathing' },
  { id: 'posture-check', title: 'Posture Check', icon: '/activity-icons/posture-check.jpg', category: 'physical', points: 15, rarity: 'common', duration: '2 min', difficulty: 1, description: 'Align your spine and shoulders' },
  { id: 'quick-walk', title: 'Quick Walk', icon: '/activity-icons/running.jpg', category: 'physical', points: 20, rarity: 'common', duration: '10 min', difficulty: 1, description: 'Get your body moving with a short walk' },
  { id: 'read', title: 'Read', icon: '/activity-icons/Read.jpg', category: 'growth', points: 30, rarity: 'common', duration: '40 min', difficulty: 1, description: 'Expand your knowledge through reading' },
  { id: 'reflect', title: 'Reflect', icon: '/activity-icons/Reflect.jpg', category: 'reflection', points: 25, rarity: 'common', duration: '15 min', difficulty: 1, description: 'Take time for personal reflection and introspection' },
  
  // Uncommon Activities (25-35 points)
  { id: 'creative-thinking', title: 'Creative Thinking', icon: '/activity-icons/CreativeThink.png', category: 'creative', points: 25, rarity: 'uncommon', duration: '10 min', difficulty: 2, description: 'Generate innovative ideas and solutions' },
  { id: 'gratitude-practice', title: 'Gratitude Practice', icon: '/activity-icons/gratitude.jpg', category: 'mindfulness', points: 30, rarity: 'uncommon', duration: '5 min', difficulty: 2, description: 'Acknowledge what you are thankful for' },
  { id: 'skill-practice', title: 'Skill Practice', icon: '/activity-icons/skill-practice.jpg', category: 'creative', points: 35, rarity: 'uncommon', duration: '20 min', difficulty: 2, description: 'Develop a meaningful skill or craft' },
  { id: 'strategic-planning', title: 'Strategic Planning', icon: '/activity-icons/strategic-planning.jpg', category: 'decision-making', points: 30, rarity: 'uncommon', duration: '15 min', difficulty: 2, description: 'Plan your approach to important goals' },
  
  // Rare Activities (40-55 points)
  { id: 'deep-reflection', title: 'Deep Reflection', icon: '/activity-icons/deep-reflection.jpg', category: 'reflection', points: 50, rarity: 'rare', duration: '30 min', difficulty: 3, description: 'Contemplate life\'s deeper meanings' },
  { id: 'empathy-practice', title: 'Empathy Practice', icon: '/activity-icons/empathy.jpg', category: 'communication', points: 45, rarity: 'rare', duration: '15 min', difficulty: 3, description: 'Understand others\' perspectives deeply' },
  { id: 'mentoring', title: 'Mentoring Others', icon: '/activity-icons/Mentor.jpg', category: 'communication', points: 55, rarity: 'rare', duration: '30 min', difficulty: 3, description: 'Guide and teach someone valuable skills' },
  { id: 'problem-solving', title: 'Problem Solving', icon: '/activity-icons/problem-solving.jpg', category: 'decision-making', points: 40, rarity: 'rare', duration: '25 min', difficulty: 3, description: 'Tackle complex challenges systematically' },
  
  // Epic Activities (60-75 points)
  { id: 'conflict-resolution', title: 'Conflict Resolution', icon: '/activity-icons/conflict-resolution.jpg', category: 'communication', points: 75, rarity: 'epic', duration: '30 min', difficulty: 4, description: 'Resolve disputes with wisdom and skill', gridSize: { w: 2, h: 1 } },
  { id: 'innovation-session', title: 'Innovation Session', icon: '/activity-icons/innovation-session.jpg', category: 'creative', points: 65, rarity: 'epic', duration: '60 min', difficulty: 4, description: 'Create breakthrough solutions', gridSize: { w: 2, h: 2 } },
  { id: 'leadership-moment', title: 'Leadership Moment', icon: '/activity-icons/Handshake.png', category: 'communication', points: 70, rarity: 'epic', duration: '45 min', difficulty: 4, description: 'Lead others toward a common goal' },
  
  // Legendary Activities (80+ points)
  { id: 'inspire-others', title: 'Inspire Others', icon: '/activity-icons/inspire-others.jpg', category: 'communication', points: 90, rarity: 'legendary', duration: '60 min', difficulty: 5, description: 'Motivate people to achieve greatness' },
  { id: 'life-changing-decision', title: 'Life-Changing Decision', icon: '/activity-icons/life-changing-decision.jpg', category: 'decision-making', points: 100, rarity: 'legendary', duration: '90 min', difficulty: 5, description: 'Make a decision that transforms your path' },
  { id: 'master-skill', title: 'Master New Skill', icon: '/activity-icons/learn.jpg', category: 'creative', points: 85, rarity: 'legendary', duration: '120 min', difficulty: 5, description: 'Achieve mastery in a meaningful domain' }
];

async function seedActivities() {
  console.log('🌱 Starting Activity table seeding...');
  
  try {
    // Clear existing activities
    await prisma.activity.deleteMany({});
    console.log('🗑️ Cleared existing activities');
    
    // Insert all activities
    for (const template of ACTIVITY_TEMPLATES) {
      const gridSize = template.gridSize || { w: 1, h: 1 };
      
      await prisma.activity.create({
        data: {
          id: template.id,
          title: template.title,
          description: template.description,
          icon: template.icon,
          category: template.category,
          points: template.points,
          rarity: template.rarity,
          duration: template.duration,
          difficulty: template.difficulty,
          gridSizeW: gridSize.w,
          gridSizeH: gridSize.h,
          isActive: true,
          sortOrder: 0
        }
      });
      
      console.log(`✅ Created activity: ${template.title}`);
    }
    
    console.log(`🎉 Successfully seeded ${ACTIVITY_TEMPLATES.length} activities`);
    
  } catch (error) {
    console.error('❌ Error seeding activities:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedActivities()
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  });