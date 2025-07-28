// Simple script to add role models via the existing API
// Create role models with exactly the same structure as Steve Jobs
const defaultText = "Historical information available from comprehensive sources."

const roleModels = [
  {
    fullName: 'Sir Isaac Newton',
    commonName: 'Isaac Newton',
    lifeSpan: '1643-1727 (84 years)',
    culturalContext: defaultText,
    historicalPeriod: '1643-1727 (84 years)',
    primaryDomain: 'Mathematical physics and natural philosophy',
    lifeMission: 'Understand the mathematical laws governing the natural world',
    coreValues: [
      'Pursuit of absolute truth through mathematics',
      'Systematic observation and experimentation',
      'Logical reasoning over accepted authority'
    ],
    valueHierarchy: ['Truth', 'Logic', 'Precision'],
    worldview: defaultText,
    personalPhilosophy: 'If I have seen further it is by standing on the shoulders of giants',
    dominantTraits: ['Methodical', 'Brilliant', 'Solitary'],
    communicationStyle: defaultText,
    emotionalPatterns: defaultText,
    socialInteractionStyle: defaultText,
    learningApproach: defaultText,
    decisionProcess: { approach: "Mathematical reasoning and empirical observation" },
    informationGathering: defaultText,
    evaluationCriteria: defaultText,
    riskAssessment: defaultText,
    implementationStyle: defaultText,
    morningPractices: defaultText,
    workPatterns: defaultText,
    physicalPractices: defaultText,
    mentalSpiritualPractices: defaultText,
    eveningRoutines: defaultText,
    weeklyMonthlyRhythms: defaultText,
    stressManagement: defaultText,
    conflictResolution: defaultText,
    failureResponse: defaultText,
    crisisLeadership: defaultText,
    adaptationStrategies: defaultText,
    coreTeachings: defaultText,
    famousQuotes: [
      'If I have seen further it is by standing on the shoulders of giants',
      'Nature is pleased with simplicity',
      'Genius is patience'
    ],
    teachingMethods: defaultText,
    keyPrinciples: ['Truth', 'Logic', 'Precision'],
    practicalApplications: defaultText,
    familyRelationships: defaultText,
    friendshipPatterns: defaultText,
    mentorshipStyle: defaultText,
    leadershipApproach: defaultText,
    conflictHandling: defaultText,
    contemporaryRelevance: 'Newton\'s systematic approach to problem-solving remains fundamental to modern science and logical thinking.',
    dailyLifeApplications: defaultText,
    decisionTemplates: [{ template: "Apply mathematical rigor to decision making" }],
    characterDevelopment: 'By studying Newton\'s methods, users can develop systematic thinking and dedication to truth.',
    commonMisinterpretations: defaultText,
    personalitySynthesis: defaultText,
    decisionConsultation: defaultText,
    situationalApplications: defaultText,
    potentialConflicts: defaultText,
    userImplementation: defaultText,
    primarySources: defaultText,
    historicalSources: defaultText,
    academicSources: defaultText,
    culturalSources: defaultText,
    sourceQualityAssessment: defaultText,
    historicalAccuracy: defaultText,
    quoteAuthentication: defaultText,
    culturalSensitivity: defaultText,
    balancedPerspective: defaultText,
    scholarlyConsensus: defaultText
  },
  {
    fullName: 'Marcus Aurelius Antoninus',
    commonName: 'Marcus Aurelius',
    lifeSpan: '121-180 CE (59 years)',
    primaryDomain: 'Stoic philosophy, imperial leadership, and philosophical governance',
    lifeMission: 'Rule the Roman Empire with wisdom and virtue while maintaining personal philosophical development',
    coreValues: [
      'Virtue as the highest good',
      'Duty to serve the common good',
      'Acceptance of what cannot be changed',
      'Rational thinking over emotional reaction',
      'Personal responsibility and self-discipline'
    ],
    famousQuotes: [
      'You have power over your mind - not outside events. Realize this, and you will find strength',
      'The best revenge is not to be like your enemy',
      'Waste no more time arguing what a good man should be. Be one'
    ]
  },
  {
    fullName: 'Maria Skłodowska-Curie',
    commonName: 'Marie Curie',
    lifeSpan: '1867-1934 (66 years)',
    primaryDomain: 'Scientific research, radioactivity pioneer, breaking gender barriers in science',
    lifeMission: 'Advance scientific knowledge through rigorous research and open paths for women in science',
    coreValues: [
      'Scientific integrity and rigorous methodology',
      'Persistent dedication despite obstacles',
      'Knowledge sharing for humanity\'s benefit',
      'Breaking barriers for future women scientists'
    ],
    famousQuotes: [
      'Nothing in life is to be feared, it is only to be understood',
      'I am among those who think that science has great beauty',
      'Life is not easy for any of us. But what of that? We must have perseverance'
    ]
  },
  {
    fullName: 'Leonardo di ser Piero da Vinci',
    commonName: 'Leonardo da Vinci',
    lifeSpan: '1452-1519 (67 years)',
    primaryDomain: 'Art, science, engineering, and interdisciplinary innovation',
    lifeMission: 'Understand all aspects of nature through direct observation, experimentation, and artistic expression',
    coreValues: [
      'Insatiable curiosity about natural phenomena',
      'Direct observation over accepted authority',
      'Integration of art and science',
      'Perfectionist craftsmanship in all work'
    ],
    famousQuotes: [
      'Learning never exhausts the mind',
      'Simplicity is the ultimate sophistication',
      'Art is never finished, only abandoned'
    ]
  },
  {
    fullName: 'Albert Einstein',
    commonName: 'Albert Einstein',
    lifeSpan: '1879-1955 (76 years)',
    primaryDomain: 'Theoretical physics, relativity theory, and scientific philosophy',
    lifeMission: 'Understand the fundamental nature of reality through imagination and mathematical insight',
    coreValues: [
      'Imagination and visual thinking over pure logical analysis',
      'Simplicity and elegance in explaining complex phenomena',
      'Pacifism and humanitarian concerns above nationalism',
      'Scientific truth over social conventions'
    ],
    famousQuotes: [
      'Imagination is more important than knowledge',
      'Logic will get you from A to B. Imagination will take you everywhere',
      'The important thing is not to stop questioning'
    ]
  }
];

async function addRoleModels() {
  const baseUrl = 'https://lightwalker-mvp.vercel.app';
  
  for (const roleModel of roleModels) {
    try {
      console.log(`Adding ${roleModel.commonName}...`);
      
      const response = await fetch(`${baseUrl}/api/role-models`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(roleModel)
      });
      
      if (response.ok) {
        console.log(`✅ Successfully added ${roleModel.commonName}`);
      } else {
        console.log(`❌ Failed to add ${roleModel.commonName}: ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ Error adding ${roleModel.commonName}:`, error.message);
    }
  }
}

addRoleModels().then(() => {
  console.log('🎉 Finished adding role models!');
});