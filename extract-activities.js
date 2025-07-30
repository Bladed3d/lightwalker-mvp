const fs = require('fs');

// Fallback data from our role models (in case API is not available)
const fallbackRoleModels = [
  {
    commonName: "Buddha",
    enhancedAttributes: {
      "Compassionate": {
        "methods": [
          "I pause before reacting to anyone and try to understand what pain they might be carrying",
          "I actively look for one thing I can appreciate about each person I meet today",
          "When someone is difficult, I silently wish for their happiness and peace"
        ]
      },
      "Mindful": {
        "methods": [
          "I take three conscious breaths before starting any new activity",
          "I notice when my mind wanders and gently return attention to the present",
          "I eat one meal today in complete silence, focusing on each bite"
        ]
      },
      "Patient": {
        "methods": [
          "When I feel rushed, I deliberately slow down my movements and breathing",
          "I practice waiting without checking my phone or fidgeting",
          "I remind myself that everything unfolds in its proper time"
        ]
      },
      "Wise": {
        "methods": [
          "I sit quietly for 10 minutes and observe my thoughts without judgment",
          "Before making decisions, I ask: 'Will this cause harm or bring peace?'",
          "I share wisdom only when asked, never when trying to prove myself"
        ]
      }
    }
  },
  {
    commonName: "Steve Jobs",
    enhancedAttributes: {
      "Focused": {
        "methods": [
          "I eliminate all distractions and work on only one important thing at a time",
          "I say 'no' to good opportunities so I can say 'yes' to great ones",
          "I start each day by identifying the single most important task"
        ]
      },
      "Perfectionist": {
        "methods": [
          "I review my work multiple times, always asking 'How can this be better?'",
          "I pay attention to details others might overlook or dismiss",
          "I'm willing to start over if the result isn't excellent"
        ]
      },
      "Innovative": {
        "methods": [
          "I challenge assumptions by asking 'What if we did this completely differently?'",
          "I study user problems deeply before jumping to solutions",
          "I combine ideas from different fields to create something new"
        ]
      },
      "Intuitive": {
        "methods": [
          "I trust my gut feeling about what feels right, even without data",
          "I pay attention to my first impressions and reactions",
          "I make space for quiet thinking to hear my inner wisdom"
        ]
      }
    }
  },
  {
    commonName: "Martin Luther King Jr.",
    enhancedAttributes: {
      "Courageous": {
        "methods": [
          "I speak up for what's right, even when my voice shakes",
          "I take action despite fear, knowing the cause is greater than my comfort",
          "I stand with others who are vulnerable or facing injustice"
        ]
      },
      "Hopeful": {
        "methods": [
          "I focus on the progress made, not just the distance left to travel",
          "I speak about possibilities and potential, not just problems",
          "I remind myself and others that change is possible"
        ]
      },
      "Loving": {
        "methods": [
          "I respond to hatred with love, knowing it's more powerful",
          "I see the humanity in everyone, even those who oppose me",
          "I choose words that heal rather than harm"
        ]
      },
      "Persistent": {
        "methods": [
          "I continue working toward my goals despite setbacks",
          "I break large challenges into smaller, manageable steps",
          "I celebrate small victories while keeping the bigger vision alive"
        ]
      }
    }
  }
];

async function extractAllActivities() {
  console.log('🎯 Extracting all Lightwalker activities from role models...\n');

  // Try to fetch from API first, fall back to hardcoded data
  let roleModels = fallbackRoleModels;
  
  try {
    const response = await fetch('http://localhost:3001/api/role-models');
    if (response.ok) {
      const data = await response.json();
      roleModels = data.roleModels;
      console.log(`✅ Successfully fetched ${roleModels.length} role models from API\n`);
    } else {
      console.log('⚠️  API not available, using fallback data\n');
    }
  } catch (error) {
    console.log('⚠️  API not available, using fallback data\n');
  }

  const allActivities = [];
  const activityGroups = {};
  
  roleModels.forEach(roleModel => {
    if (roleModel.enhancedAttributes) {
      const attributes = typeof roleModel.enhancedAttributes === 'string' 
        ? JSON.parse(roleModel.enhancedAttributes) 
        : roleModel.enhancedAttributes;
      
      Object.entries(attributes).forEach(([attributeName, attributeData]) => {
        if (attributeData.methods && Array.isArray(attributeData.methods)) {
          attributeData.methods.forEach(method => {
            const activity = {
              roleModel: roleModel.commonName,
              attribute: attributeName,
              activity: method,
              category: getCategoryFromActivity(method)
            };
            
            allActivities.push(activity);
            
            // Group by attribute for easier reference
            if (!activityGroups[attributeName]) {
              activityGroups[attributeName] = [];
            }
            activityGroups[attributeName].push({
              roleModel: roleModel.commonName,
              activity: method
            });
          });
        }
      });
    }
  });

  // Sort activities by attribute
  const sortedActivities = allActivities.sort((a, b) => {
    if (a.attribute < b.attribute) return -1;
    if (a.attribute > b.attribute) return 1;
    return a.roleModel.localeCompare(b.roleModel);
  });

  // Create comprehensive report
  const report = {
    summary: {
      totalActivities: allActivities.length,
      totalAttributes: Object.keys(activityGroups).length,
      totalRoleModels: roleModels.length,
      extractedAt: new Date().toISOString()
    },
    activitiesByAttribute: activityGroups,
    allActivities: sortedActivities,
    dailyTimelineExamples: generateDailyTimelineExamples(activityGroups)
  };

  // Write to file
  fs.writeFileSync(
    'lightwalker-activities-report.json', 
    JSON.stringify(report, null, 2)
  );

  // Generate readable markdown report
  const markdown = generateMarkdownReport(report);
  fs.writeFileSync('lightwalker-activities-report.md', markdown);

  console.log(`📊 EXTRACTION COMPLETE!`);
  console.log(`📝 Total activities found: ${allActivities.length}`);
  console.log(`🎭 Unique attributes: ${Object.keys(activityGroups).length}`);
  console.log(`👑 Role models processed: ${roleModels.length}`);
  console.log(`📄 Reports saved:`);
  console.log(`   • lightwalker-activities-report.json`);
  console.log(`   • lightwalker-activities-report.md`);
  
  return report;
}

function getCategoryFromActivity(activity) {
  const lowerActivity = activity.toLowerCase();
  
  if (lowerActivity.includes('meditat') || lowerActivity.includes('breath') || lowerActivity.includes('quiet')) {
    return 'Mindfulness';
  } else if (lowerActivity.includes('speak') || lowerActivity.includes('say') || lowerActivity.includes('words')) {
    return 'Communication';
  } else if (lowerActivity.includes('work') || lowerActivity.includes('task') || lowerActivity.includes('focus')) {
    return 'Productivity';
  } else if (lowerActivity.includes('people') || lowerActivity.includes('others') || lowerActivity.includes('someone')) {
    return 'Relationships';
  } else if (lowerActivity.includes('feel') || lowerActivity.includes('emotion') || lowerActivity.includes('react')) {
    return 'Emotional Regulation';
  } else {
    return 'Personal Growth';
  }
}

function generateDailyTimelineExamples(activityGroups) {
  const examples = [];
  
  // Morning routine example
  const morningActivities = Object.entries(activityGroups)
    .flatMap(([attr, activities]) => 
      activities.filter(a => 
        a.activity.toLowerCase().includes('morning') || 
        a.activity.toLowerCase().includes('start') ||
        a.activity.toLowerCase().includes('begin')
      )
    );

  if (morningActivities.length > 0) {
    examples.push({
      timeOfDay: 'Morning',
      suggestedActivities: morningActivities.slice(0, 3)
    });
  }

  // Workplace/midday example
  const workActivities = Object.entries(activityGroups)
    .flatMap(([attr, activities]) => 
      activities.filter(a => 
        a.activity.toLowerCase().includes('work') || 
        a.activity.toLowerCase().includes('decision') ||
        a.activity.toLowerCase().includes('focus')
      )
    );

  if (workActivities.length > 0) {
    examples.push({
      timeOfDay: 'Midday/Work',
      suggestedActivities: workActivities.slice(0, 3)
    });
  }

  // Evening example
  const eveningActivities = Object.entries(activityGroups)
    .flatMap(([attr, activities]) => 
      activities.filter(a => 
        a.activity.toLowerCase().includes('reflect') || 
        a.activity.toLowerCase().includes('review') ||
        a.activity.toLowerCase().includes('end')
      )
    );

  if (eveningActivities.length > 0) {
    examples.push({
      timeOfDay: 'Evening',
      suggestedActivities: eveningActivities.slice(0, 3)
    });
  }

  return examples;
}

function generateMarkdownReport(report) {
  let markdown = `# Lightwalker™ Daily Activities Reference Guide\n\n`;
  markdown += `*Generated on ${new Date(report.summary.extractedAt).toLocaleDateString()}*\n\n`;
  
  markdown += `## 📊 Summary\n\n`;
  markdown += `- **Total Activities**: ${report.summary.totalActivities}\n`;
  markdown += `- **Unique Attributes**: ${report.summary.totalAttributes}\n`;
  markdown += `- **Role Models**: ${report.summary.totalRoleModels}\n\n`;

  markdown += `## 🎯 Activities by Attribute\n\n`;
  markdown += `Use this reference when building daily timelines for users. Each activity is phrased in first person so users can copy the behavior directly.\n\n`;

  Object.entries(report.activitiesByAttribute)
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([attribute, activities]) => {
      markdown += `### ${attribute}\n\n`;
      activities.forEach(activity => {
        markdown += `**${activity.roleModel}**: "${activity.activity}"\n\n`;
      });
    });

  markdown += `## 📅 Daily Timeline Examples\n\n`;
  markdown += `Here are some example activities organized by time of day:\n\n`;

  report.dailyTimelineExamples.forEach(example => {
    markdown += `### ${example.timeOfDay}\n\n`;
    example.suggestedActivities.forEach(activity => {
      markdown += `- **${activity.roleModel}**: "${activity.activity}"\n`;
    });
    markdown += `\n`;
  });

  markdown += `## 💡 Usage Notes\n\n`;
  markdown += `1. **First Person Format**: All activities use "I" statements for easy copying\n`;
  markdown += `2. **Attribute-Based**: Organize daily activities around the user's selected traits\n`;
  markdown += `3. **Role Model Attribution**: Users can see which role model inspired each activity\n`;
  markdown += `4. **Flexible Timing**: Activities can be adapted to different times of day\n`;
  markdown += `5. **Contextual**: Activities work for various life situations\n\n`;

  markdown += `## 🛠️ Implementation Ideas\n\n`;
  markdown += `- **Morning Check-in**: "Based on your Lightwalker™ traits, here are 3 activities for today"\n`;
  markdown += `- **Situational Guidance**: "When facing [situation], your [attribute] trait suggests..."\n`;
  markdown += `- **Evening Reflection**: "How did you practice [trait] today?"\n`;
  markdown += `- **Progress Tracking**: Track which activities users complete most often\n`;
  markdown += `- **Personalization**: Learn which activities resonate with each user\n\n`;

  return markdown;
}

// Run the extraction
extractAllActivities().catch(console.error);