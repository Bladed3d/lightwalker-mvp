const fs = require('fs');

async function extractActivityList() {
  console.log('🎯 Extracting activity-centric list of all daily actions...\n');

  // Read the seed file directly
  const seedFileContent = fs.readFileSync('./scripts/seed-role-models.ts', 'utf8');
  
  // Extract role models by finding enhancedAttributes sections
  const enhancedAttributesRegex = /commonName:\s*"([^"]+)"[\s\S]*?enhancedAttributes:\s*\[([\s\S]*?)\]/g;
  
  const allActivities = [];
  let match;
  let activityId = 1;

  while ((match = enhancedAttributesRegex.exec(seedFileContent)) !== null) {
    const commonName = match[1];
    const attributesSection = match[2];
    
    // Extract individual attributes
    const attributeRegex = /{\s*name:\s*"([^"]+)",\s*description:\s*"([^"]+)",\s*benefit:\s*"([^"]+)",\s*oppositeOf:\s*"([^"]+)",\s*method:\s*"([^"]+)"/g;
    
    let attributeMatch;
    
    while ((attributeMatch = attributeRegex.exec(attributesSection)) !== null) {
      const [, name, description, benefit, oppositeOf, method] = attributeMatch;
      
      allActivities.push({
        id: activityId++,
        activity: method, // This is what users will DO
        attribute: name,
        roleModel: commonName,
        benefit: benefit,
        category: getCategoryFromActivity(method),
        timeOfDay: getTimeOfDay(method),
        difficulty: getDifficulty(method),
        duration: getDuration(method)
      });
    }
  }

  // Sort activities alphabetically by the action itself
  allActivities.sort((a, b) => a.activity.localeCompare(b.activity));

  console.log(`📝 Extracted ${allActivities.length} daily activities`);

  // Create activity-focused report
  const report = {
    summary: {
      totalActivities: allActivities.length,
      categories: [...new Set(allActivities.map(a => a.category))].sort(),
      timeSlots: [...new Set(allActivities.map(a => a.timeOfDay))].sort(),
      difficulties: [...new Set(allActivities.map(a => a.difficulty))].sort(),
      extractedAt: new Date().toISOString()
    },
    activities: allActivities,
    categorizedActivities: groupByCategory(allActivities),
    timeBasedActivities: groupByTime(allActivities),
    quickActionList: allActivities.map(a => a.activity) // Just the pure actions
  };

  // Write comprehensive JSON
  fs.writeFileSync(
    'daily-activities-list.json', 
    JSON.stringify(report, null, 2)
  );

  // Generate simple markdown list
  const markdown = generateActivityMarkdown(report);
  fs.writeFileSync('DAILY-ACTIVITIES-LIST.md', markdown);

  // Generate developer-friendly CSV
  const csv = generateCSV(allActivities);
  fs.writeFileSync('daily-activities.csv', csv);

  console.log(`\n📄 Reports generated:`);
  console.log(`   • DAILY-ACTIVITIES-LIST.md (Human readable)`);
  console.log(`   • daily-activities-list.json (Complete data)`);
  console.log(`   • daily-activities.csv (Spreadsheet format)`);

  return report;
}

function getCategoryFromActivity(method) {
  const lower = method.toLowerCase();
  
  if (lower.includes('ask') || lower.includes('question') || lower.includes('what') || lower.includes('how') || lower.includes('why')) {
    return 'Questioning & Inquiry';
  } else if (lower.includes('breathe') || lower.includes('pause') || lower.includes('slow') || lower.includes('calm')) {
    return 'Breathing & Calming';
  } else if (lower.includes('write') || lower.includes('list') || lower.includes('note') || lower.includes('journal')) {
    return 'Writing & Reflection';
  } else if (lower.includes('speak') || lower.includes('say') || lower.includes('tell') || lower.includes('conversation')) {
    return 'Speaking & Communication';
  } else if (lower.includes('people') || lower.includes('others') || lower.includes('someone') || lower.includes('person')) {
    return 'Interpersonal Actions';
  } else if (lower.includes('focus') || lower.includes('attention') || lower.includes('concentrate') || lower.includes('priority')) {
    return 'Focus & Attention';
  } else if (lower.includes('practice') || lower.includes('habit') || lower.includes('routine') || lower.includes('daily')) {
    return 'Daily Practices';
  } else if (lower.includes('learn') || lower.includes('study') || lower.includes('read') || lower.includes('understand')) {
    return 'Learning & Growth';
  } else if (lower.includes('decision') || lower.includes('choose') || lower.includes('decide') || lower.includes('option')) {
    return 'Decision Making';
  } else if (lower.includes('observe') || lower.includes('notice') || lower.includes('watch') || lower.includes('see')) {
    return 'Observation & Awareness';
  } else {
    return 'Personal Development';
  }
}

function getTimeOfDay(method) {
  const lower = method.toLowerCase();
  
  if (lower.includes('morning') || lower.includes('start') || lower.includes('begin') || lower.includes('first')) {
    return 'Morning';
  } else if (lower.includes('evening') || lower.includes('end') || lower.includes('day') || lower.includes('night')) {
    return 'Evening';  
  } else if (lower.includes('meal') || lower.includes('lunch') || lower.includes('eat')) {
    return 'Mealtime';
  } else if (lower.includes('work') || lower.includes('meeting') || lower.includes('task')) {
    return 'Work Hours';
  } else {
    return 'Anytime';
  }
}

function getDifficulty(method) {
  const lower = method.toLowerCase();
  
  if (lower.includes('three') || lower.includes('minute') || lower.includes('quick') || lower.includes('simple')) {
    return 'Easy';
  } else if (lower.includes('practice') || lower.includes('develop') || lower.includes('build') || lower.includes('create')) {
    return 'Moderate';
  } else if (lower.includes('master') || lower.includes('deep') || lower.includes('complex') || lower.includes('systematic')) {
    return 'Advanced';
  } else {
    return 'Easy';
  }
}

function getDuration(method) {
  const lower = method.toLowerCase();
  
  if (lower.includes('moment') || lower.includes('pause') || lower.includes('breath')) {
    return '1-2 minutes';
  } else if (lower.includes('minute') || lower.includes('quick')) {
    return '3-5 minutes';
  } else if (lower.includes('practice') || lower.includes('session') || lower.includes('time')) {
    return '10-15 minutes';
  } else if (lower.includes('daily') || lower.includes('routine') || lower.includes('habit')) {
    return 'Ongoing';
  } else {
    return '5-10 minutes';
  }
}

function groupByCategory(activities) {
  const grouped = {};
  activities.forEach(activity => {
    if (!grouped[activity.category]) {
      grouped[activity.category] = [];
    }
    grouped[activity.category].push(activity);
  });
  return grouped;
}

function groupByTime(activities) {
  const grouped = {};
  activities.forEach(activity => {
    if (!grouped[activity.timeOfDay]) {
      grouped[activity.timeOfDay] = [];
    }
    grouped[activity.timeOfDay].push(activity);
  });
  return grouped;
}

function generateActivityMarkdown(report) {
  let markdown = `# 🎯 Daily Activities List - All 110 Actions\n\n`;
  markdown += `*Activity-focused reference for daily timeline implementation*\n\n`;
  markdown += `**Total Activities**: ${report.summary.totalActivities}  \n`;
  markdown += `**Generated**: ${new Date(report.summary.extractedAt).toLocaleDateString()}\n\n`;

  markdown += `## 📋 Complete Activity List\n\n`;
  markdown += `*All activities listed alphabetically - ready for daily timeline use*\n\n`;

  report.activities.forEach((activity, index) => {
    markdown += `${index + 1}. **"${activity.activity}"**\n`;
    markdown += `   - *Category*: ${activity.category}\n`;
    markdown += `   - *Best Time*: ${activity.timeOfDay}\n`;
    markdown += `   - *Duration*: ${activity.duration}\n`;
    markdown += `   - *Benefit*: ${activity.benefit}\n`;
    markdown += `   - *Source*: ${activity.attribute} (${activity.roleModel})\n\n`;
  });

  markdown += `## 📊 By Category\n\n`;
  Object.entries(report.categorizedActivities)
    .sort(([,a], [,b]) => b.length - a.length)
    .forEach(([category, activities]) => {
      markdown += `### ${category} (${activities.length} activities)\n\n`;
      activities.slice(0, 5).forEach(activity => {
        markdown += `- "${activity.activity}"\n`;
      });
      if (activities.length > 5) {
        markdown += `- *...and ${activities.length - 5} more*\n`;
      }
      markdown += `\n`;
    });

  markdown += `## ⏰ By Time of Day\n\n`;
  Object.entries(report.timeBasedActivities).forEach(([timeSlot, activities]) => {
    markdown += `### ${timeSlot} (${activities.length} activities)\n\n`;
    activities.slice(0, 3).forEach(activity => {
      markdown += `- "${activity.activity}"\n`;
    });
    if (activities.length > 3) {
      markdown += `- *...and ${activities.length - 3} more*\n`;
    }
    markdown += `\n`;
  });

  markdown += `## 🚀 Implementation Notes\n\n`;
  markdown += `- **All activities use first-person language** - ready for users to copy\n`;
  markdown += `- **Categorized for easy filtering** - show relevant activities by context\n`;
  markdown += `- **Time-aware** - suggest appropriate activities for different parts of day\n`;
  markdown += `- **Difficulty levels** - start users with easier activities, progress to advanced\n`;
  markdown += `- **Duration estimates** - help users choose based on available time\n\n`;

  return markdown;
}

function generateCSV(activities) {
  let csv = 'ID,Activity,Category,Time of Day,Duration,Difficulty,Benefit,Attribute,Role Model\n';
  
  activities.forEach(activity => {
    csv += `${activity.id},"${activity.activity.replace(/"/g, '""')}","${activity.category}","${activity.timeOfDay}","${activity.duration}","${activity.difficulty}","${activity.benefit.replace(/"/g, '""')}","${activity.attribute}","${activity.roleModel}"\n`;
  });
  
  return csv;
}

// Run the extraction
extractActivityList().catch(console.error);