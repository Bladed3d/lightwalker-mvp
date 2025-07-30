const fs = require('fs');

async function extractComprehensiveActivities() {
  console.log('🎯 Extracting ALL Lightwalker activities from seed file...\n');

  // Read the seed file directly
  const seedFileContent = fs.readFileSync('./scripts/seed-role-models.ts', 'utf8');
  
  // Extract the roleModelsData array
  const roleModelsMatch = seedFileContent.match(/const roleModelsData.*?= \[(.*?)\]/s);
  if (!roleModelsMatch) {
    console.error('❌ Could not find roleModelsData in seed file');
    return;
  }

  // Parse role models by finding enhancedAttributes sections
  const enhancedAttributesRegex = /commonName:\s*"([^"]+)"[\s\S]*?enhancedAttributes:\s*\[([\s\S]*?)\]/g;
  
  const allActivities = [];
  const activityGroups = {};
  const roleModelCount = {};
  let match;
  let totalRoleModels = 0;

  while ((match = enhancedAttributesRegex.exec(seedFileContent)) !== null) {
    const commonName = match[1];
    const attributesSection = match[2];
    totalRoleModels++;
    
    console.log(`📝 Processing ${commonName}...`);
    
    // Extract individual attributes
    const attributeRegex = /{\s*name:\s*"([^"]+)",\s*description:\s*"([^"]+)",\s*benefit:\s*"([^"]+)",\s*oppositeOf:\s*"([^"]+)",\s*method:\s*"([^"]+)"/g;
    
    let attributeMatch;
    let attributeCount = 0;
    
    while ((attributeMatch = attributeRegex.exec(attributesSection)) !== null) {
      const [, name, description, benefit, oppositeOf, method] = attributeMatch;
      attributeCount++;
      
      const activity = {
        roleModel: commonName,
        attribute: name,
        description: description,
        benefit: benefit,
        oppositeOf: oppositeOf,
        method: method,
        category: getCategoryFromActivity(method)
      };
      
      allActivities.push(activity);
      
      // Group by attribute name
      if (!activityGroups[name]) {
        activityGroups[name] = [];
      }
      activityGroups[name].push({
        roleModel: commonName,
        method: method,
        description: description,
        benefit: benefit
      });
    }
    
    roleModelCount[commonName] = attributeCount;
    console.log(`   ✅ Found ${attributeCount} attributes`);
  }

  console.log(`\n🎉 EXTRACTION COMPLETE!`);
  console.log(`👑 Role models processed: ${totalRoleModels}`);
  console.log(`📝 Total activities found: ${allActivities.length}`);
  console.log(`🎭 Unique attributes: ${Object.keys(activityGroups).length}`);

  // Generate comprehensive report
  const report = {
    summary: {
      totalActivities: allActivities.length,
      totalAttributes: Object.keys(activityGroups).length,
      totalRoleModels: totalRoleModels,
      extractedAt: new Date().toISOString(),
      roleModelBreakdown: roleModelCount
    },
    activitiesByAttribute: activityGroups,
    allActivities: allActivities.sort((a, b) => a.attribute.localeCompare(b.attribute)),
    dailyTimelineExamples: generateDailyTimelineExamples(activityGroups),
    categoryBreakdown: getCategoryBreakdown(allActivities),
    usageRecommendations: generateUsageRecommendations(activityGroups)
  };

  // Write comprehensive JSON report
  fs.writeFileSync(
    'comprehensive-lightwalker-activities.json', 
    JSON.stringify(report, null, 2)
  );

  // Generate readable markdown report
  const markdown = generateComprehensiveMarkdown(report);
  fs.writeFileSync('comprehensive-lightwalker-activities.md', markdown);

  console.log(`\n📄 Reports saved:`);
  console.log(`   • comprehensive-lightwalker-activities.json`);
  console.log(`   • comprehensive-lightwalker-activities.md`);

  // Generate quick reference for developers
  generateDeveloperReference(report);
  
  return report;
}

function getCategoryFromActivity(method) {
  const lowerMethod = method.toLowerCase();
  
  if (lowerMethod.includes('meditat') || lowerMethod.includes('breath') || lowerMethod.includes('quiet') || lowerMethod.includes('sit')) {
    return 'Mindfulness & Meditation';
  } else if (lowerMethod.includes('speak') || lowerMethod.includes('say') || lowerMethod.includes('words') || lowerMethod.includes('conversation')) {
    return 'Communication';
  } else if (lowerMethod.includes('work') || lowerMethod.includes('task') || lowerMethod.includes('focus') || lowerMethod.includes('decision')) {
    return 'Productivity & Decision Making';
  } else if (lowerMethod.includes('people') || lowerMethod.includes('others') || lowerMethod.includes('someone') || lowerMethod.includes('relationship')) {
    return 'Relationships & Social';
  } else if (lowerMethod.includes('feel') || lowerMethod.includes('emotion') || lowerMethod.includes('react') || lowerMethod.includes('anger') || lowerMethod.includes('stress')) {
    return 'Emotional Regulation';
  } else if (lowerMethod.includes('practice') || lowerMethod.includes('daily') || lowerMethod.includes('routine') || lowerMethod.includes('habit')) {
    return 'Daily Practices';
  } else if (lowerMethod.includes('learn') || lowerMethod.includes('study') || lowerMethod.includes('read') || lowerMethod.includes('understand')) {
    return 'Learning & Growth';
  } else if (lowerMethod.includes('create') || lowerMethod.includes('art') || lowerMethod.includes('music') || lowerMethod.includes('innovation')) {
    return 'Creativity & Innovation';
  } else {
    return 'Personal Development';
  }
}

function getCategoryBreakdown(activities) {
  const breakdown = {};
  activities.forEach(activity => {
    const category = activity.category;
    if (!breakdown[category]) {
      breakdown[category] = { count: 0, activities: [] };
    }
    breakdown[category].count++;
    breakdown[category].activities.push({
      roleModel: activity.roleModel,
      attribute: activity.attribute,
      method: activity.method
    });
  });
  return breakdown;
}

function generateDailyTimelineExamples(activityGroups) {
  const examples = [];
  
  // Morning routine activities
  const morningKeywords = ['morning', 'start', 'begin', 'daily', 'first', 'wake'];
  const morningActivities = findActivitiesByKeywords(activityGroups, morningKeywords);
  
  if (morningActivities.length > 0) {
    examples.push({
      timeOfDay: 'Morning (6:00-9:00 AM)',
      description: 'Start your day by embodying your Lightwalker™ traits',
      suggestedActivities: morningActivities.slice(0, 4)
    });
  }

  // Workplace/midday activities
  const workKeywords = ['work', 'decision', 'focus', 'task', 'problem', 'challenge'];
  const workActivities = findActivitiesByKeywords(activityGroups, workKeywords);
  
  if (workActivities.length > 0) {
    examples.push({
      timeOfDay: 'Midday/Work (9:00 AM-5:00 PM)',
      description: 'Apply your traits during work and daily challenges',
      suggestedActivities: workActivities.slice(0, 4)
    });
  }

  // Social/relationship activities
  const socialKeywords = ['people', 'others', 'someone', 'conversation', 'relationship', 'speak'];
  const socialActivities = findActivitiesByKeywords(activityGroups, socialKeywords);
  
  if (socialActivities.length > 0) {
    examples.push({
      timeOfDay: 'Social Interactions',
      description: 'Practice your traits in relationships and social situations',
      suggestedActivities: socialActivities.slice(0, 4)
    });
  }

  // Evening reflection activities
  const eveningKeywords = ['reflect', 'review', 'end', 'day', 'evening', 'consider'];
  const eveningActivities = findActivitiesByKeywords(activityGroups, eveningKeywords);
  
  if (eveningActivities.length > 0) {
    examples.push({
      timeOfDay: 'Evening (6:00-10:00 PM)',
      description: 'Reflect on your growth and prepare for tomorrow',
      suggestedActivities: eveningActivities.slice(0, 4)
    });
  }

  return examples;
}

function findActivitiesByKeywords(activityGroups, keywords) {
  const activities = [];
  Object.entries(activityGroups).forEach(([attribute, attributeActivities]) => {
    attributeActivities.forEach(activity => {
      const methodLower = activity.method.toLowerCase();
      if (keywords.some(keyword => methodLower.includes(keyword))) {
        activities.push({
          attribute: attribute,
          roleModel: activity.roleModel,
          method: activity.method
        });
      }
    });
  });
  return activities;
}

function generateUsageRecommendations(activityGroups) {
  return {
    dailyPractice: {
      title: "Daily Practice Recommendations",
      suggestions: [
        "Present users with 3-5 activities based on their selected traits each morning",
        "Rotate activities to prevent habituation while reinforcing core behaviors",
        "Allow users to mark activities as 'completed' for progress tracking",
        "Provide contextual activities based on time of day or user's situation"
      ]
    },
    personalization: {
      title: "Personalization Strategy",
      suggestions: [
        "Learn which activities users complete most often",
        "Suggest similar activities from other role models with the same trait",
        "Adapt difficulty based on user's consistency and feedback",
        "Create personalized activity combinations based on user's trait selection"
      ]
    },
    situationalGuidance: {
      title: "Situational Activity Suggestions",
      suggestions: [
        "When user reports stress: offer mindfulness and emotional regulation activities",
        "Before important meetings/decisions: suggest decision-making and focus activities",
        "During conflicts: provide relationship and communication activities",
        "End of day: encourage reflection and gratitude activities"
      ]
    }
  };
}

function generateComprehensiveMarkdown(report) {
  let markdown = `# 🌟 Comprehensive Lightwalker™ Activities Guide\n\n`;
  markdown += `*Your complete reference for role model activities and daily practices*\n\n`;
  markdown += `Generated on ${new Date(report.summary.extractedAt).toLocaleDateString()}\n\n`;
  
  markdown += `## 📊 Quick Stats\n\n`;
  markdown += `| Metric | Count |\n`;
  markdown += `|--------|-------|\n`;
  markdown += `| **Total Activities** | ${report.summary.totalActivities} |\n`;
  markdown += `| **Unique Attributes** | ${report.summary.totalAttributes} |\n`;
  markdown += `| **Role Models** | ${report.summary.totalRoleModels} |\n\n`;

  markdown += `### 👑 Role Model Breakdown\n\n`;
  Object.entries(report.summary.roleModelBreakdown)
    .sort(([,a], [,b]) => b - a)
    .forEach(([roleModel, count]) => {
      markdown += `- **${roleModel}**: ${count} attributes\n`;
    });

  markdown += `\n## 🎯 Activities by Attribute\n\n`;
  markdown += `*All activities are written in first person for easy user adoption*\n\n`;

  Object.entries(report.activitiesByAttribute)
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([attribute, activities]) => {
      markdown += `### ${attribute}\n\n`;
      activities.forEach(activity => {
        markdown += `**${activity.roleModel}**\n`;
        markdown += `- *Method*: "${activity.method}"\n`;
        markdown += `- *Benefit*: ${activity.benefit}\n\n`;
      });
    });

  markdown += `## 📅 Daily Timeline Examples\n\n`;
  report.dailyTimelineExamples.forEach(example => {
    markdown += `### ${example.timeOfDay}\n\n`;
    markdown += `${example.description}\n\n`;
    example.suggestedActivities.forEach(activity => {
      markdown += `- **${activity.attribute}** (${activity.roleModel}): "${activity.method}"\n`;
    });
    markdown += `\n`;
  });

  markdown += `## 📈 Category Analysis\n\n`;
  Object.entries(report.categoryBreakdown)
    .sort(([,a], [,b]) => b.count - a.count)
    .forEach(([category, data]) => {
      markdown += `### ${category} (${data.count} activities)\n\n`;
      data.activities.slice(0, 3).forEach(activity => {
        markdown += `- **${activity.attribute}** (${activity.roleModel}): "${activity.method}"\n`;
      });
      if (data.count > 3) {
        markdown += `- *...and ${data.count - 3} more*\n`;
      }
      markdown += `\n`;
    });

  markdown += `## 💡 Implementation Recommendations\n\n`;
  Object.entries(report.usageRecommendations).forEach(([key, rec]) => {
    markdown += `### ${rec.title}\n\n`;
    rec.suggestions.forEach(suggestion => {
      markdown += `- ${suggestion}\n`;
    });
    markdown += `\n`;
  });

  return markdown;
}

function generateDeveloperReference(report) {
  // Create a simplified JSON for developers
  const devReference = {
    quickAccess: {
      totalActivities: report.summary.totalActivities,
      attributesList: Object.keys(report.activitiesByAttribute).sort(),
      categoriesList: Object.keys(report.categoryBreakdown).sort(),
      topCategories: Object.entries(report.categoryBreakdown)
        .sort(([,a], [,b]) => b.count - a.count)
        .slice(0, 5)
        .map(([category, data]) => ({ category, count: data.count }))
    },
    sampleActivities: {
      kindness: report.activitiesByAttribute['Kind']?.slice(0, 2) || [],
      focus: report.activitiesByAttribute['Focused']?.slice(0, 2) || [],
      wisdom: report.activitiesByAttribute['Wise']?.slice(0, 2) || []
    },
    apiStructure: {
      note: "Each activity should be returned with this structure",
      example: {
        roleModel: "Buddha",
        attribute: "Compassionate",
        method: "I pause before reacting to anyone and try to understand what pain they might be carrying",
        description: "I treat all people with kindness and understanding, even when they're difficult.",
        benefit: "Creates deeper connections and reduces conflict by responding to others' humanity",
        category: "Relationships & Social"
      }
    }
  };

  fs.writeFileSync(
    'developer-activity-reference.json',
    JSON.stringify(devReference, null, 2)
  );

  console.log(`   • developer-activity-reference.json (Quick reference for devs)`);
}

// Run the extraction
extractComprehensiveActivities().catch(console.error);