import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

interface ActivityCSVRow {
  id: string;
  title: string;
  category: string;
  description: string;
  activity: string;
  duration: string;
  difficulty: string;
  points: string;
  rarity: string;
}

function parseCSV(csvContent: string): ActivityCSVRow[] {
  const lines = csvContent.trim().split('\n');
  const headers = lines[0].split(',');
  
  return lines.slice(1).map(line => {
    // Handle CSV parsing with quoted fields that contain commas
    const values: string[] = [];
    let currentValue = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(currentValue.trim());
        currentValue = '';
      } else {
        currentValue += char;
      }
    }
    
    // Add the last value
    values.push(currentValue.trim());
    
    // Create object from headers and values
    const row: any = {};
    headers.forEach((header, index) => {
      row[header.trim()] = values[index] || '';
    });
    
    return row as ActivityCSVRow;
  });
}

async function importPhilosophicalActivities() {
  try {
    console.log('🚀 Starting import of philosophical activities...');
    
    // Read the CSV file
    const csvPath = path.join(process.cwd(), 'philosophical-activities.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    
    // Parse CSV
    const activities = parseCSV(csvContent);
    console.log(`📊 Parsed ${activities.length} activities from CSV`);
    
    // Import each activity
    let importCount = 0;
    let skipCount = 0;
    
    for (const activity of activities) {
      try {
        // Check if activity already exists
        const existingActivity = await prisma.activity.findFirst({
          where: { title: activity.title }
        });
        
        if (existingActivity) {
          console.log(`⏭️  Skipping existing activity: ${activity.title}`);
          skipCount++;
          continue;
        }
        
        // Create the activity
        const newActivity = await prisma.activity.create({
          data: {
            title: activity.title,
            description: activity.description, // Philosophical context
            instructions: activity.activity,   // Practical instructions
            icon: '🌟', // Default icon - users can customize later
            category: activity.category,
            points: parseInt(activity.points) || 20,
            rarity: activity.rarity as 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary',
            duration: activity.duration,
            difficulty: parseInt(activity.difficulty) || 1,
            gridSizeW: 1, // Default grid size
            gridSizeH: 1,
            isActive: true,
            sortOrder: importCount
          }
        });
        
        console.log(`✅ Imported: ${newActivity.title} (${newActivity.category}, ${newActivity.rarity})`);
        importCount++;
        
      } catch (error) {
        console.error(`❌ Error importing ${activity.title}:`, error);
      }
    }
    
    console.log(`\n🎉 Import completed!`);
    console.log(`✅ Successfully imported: ${importCount} activities`);
    console.log(`⏭️  Skipped existing: ${skipCount} activities`);
    
    // Show summary of categories
    const categoryStats = await prisma.activity.groupBy({
      by: ['category'],
      _count: { category: true },
      where: { isActive: true }
    });
    
    console.log('\n📈 Activity Categories Summary:');
    for (const stat of categoryStats) {
      console.log(`  ${stat.category}: ${stat._count.category} activities`);
    }
    
    console.log('\n🔍 Total active activities in database:', await prisma.activity.count({ where: { isActive: true } }));
    
  } catch (error) {
    console.error('❌ Import failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the import
importPhilosophicalActivities();